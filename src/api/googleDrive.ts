// Google Drive API —— 纯前端 PKCE 模式，无需后端
import { getAccessToken } from '@/utils/pkce';
import i18n from '@/i18n';

const t = i18n.global.t;
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// ============ 同步文件夹配置 ============

/** 同步文件夹名称 */
const SYNC_FOLDER_NAME = 'CNotely_Sync';

/** 缓存的同步文件夹 ID */
let syncFolderId: string | null = null;

// ============ 通用请求 ============

/** 元数据类请求（list / get / 等） */
async function gdFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('未登录，缺少 access_token');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  const res = await fetch(`${DRIVE_API}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive API ${res.status}: ${text}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

/** 上传类请求（multipart），自行拼 URL */
async function gdUpload<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('未登录，缺少 access_token');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  const res = await fetch(`${UPLOAD_API}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive Upload ${res.status}: ${text}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ============ 文件夹管理 ============

/**
 * 查找或创建同步文件夹
 * @returns 文件夹 ID
 */
async function findOrCreateSyncFolder(): Promise<string> {
  if (syncFolderId) return syncFolderId;

  console.log(`[Google Drive] 查找文件夹: ${SYNC_FOLDER_NAME}`);

  // 1. 先查找是否已存在
  const q = encodeURIComponent(
    `name='${SYNC_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const data: any = await gdFetch<any>(`/files?q=${q}&fields=files(id,name)&pageSize=1`);

  if (data.files?.[0]?.id) {
    syncFolderId = data.files[0].id;
    console.log(`[Google Drive] 找到已存在的文件夹: ${SYNC_FOLDER_NAME} (${syncFolderId})`);
    return syncFolderId;
  }

  // 2. 不存在则创建
  console.log(`[Google Drive] 创建新文件夹: ${SYNC_FOLDER_NAME}`);
  const createData: any = await gdFetch<any>('/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: SYNC_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  syncFolderId = createData.id;
  console.log(`[Google Drive] 文件夹已创建: ${SYNC_FOLDER_NAME} (${syncFolderId})`);
  return syncFolderId;
}

// ============ 工具函数 ============

/** 按文件名在同步文件夹内搜索，返回 fileId 或 null */
async function findFileIdByNameInFolder(name: string, folderId: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${name}' and '${folderId}' in parents and trashed=false`
  );
  const data: any = await gdFetch<any>(`/files?q=${q}&fields=files(id,name)&pageSize=1`);
  return data.files?.[0]?.id ?? null;
}

/** 构建 multipart/related 请求体 */
function buildMultipartBody(metadata: object, content: string, boundary: string): string {
  const delimiter = `--${boundary}\r\n`;
  const close = `\r\n--${boundary}--`;
  return (
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    '\r\n' +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    close
  );
}

// ============ 对外 API ============

const googleDriveApi = {

  /**
   * 初始化：确保同步文件夹存在
   * 在首次调用其他 API 前会自动调用
   */
  async init(): Promise<void> {
    await findOrCreateSyncFolder();
  },

  /** 获取同步文件夹 ID（供外部使用） */
  async getSyncFolderId(): Promise<string> {
    return findOrCreateSyncFolder();
  },

  // 获取文件列表（仅同步文件夹内，最近 100 个）
  async getFiles(): Promise<any[]> {
    const folderId = await findOrCreateSyncFolder();
    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const data: any = await gdFetch<any>(
      `/files?q=${q}&pageSize=100&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc`,
    );
    console.log(`[Google Drive] 获取到 ${data.files?.length || 0} 个文件（仅同步文件夹）`);
    return data.files || [];
  },

  // 获取文件内容（纯文本）
  async getFileContent(fileId: string): Promise<string> {
    const token = getAccessToken();
    const res = await fetch(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`获取文件内容失败: ${res.status}`);
    return res.text();
  },

  /**
   * 同步文件：优先用 fileId 更新，否则按文件名查找后创建/更新
   * 文件会保存到同步文件夹内
   * @param name 文件名
   * @param content 文件内容
   * @param fileId 可选，Google Drive 文件 ID（已知时直接更新，跳过查找）
   * @returns 上传结果（含 id 字段）
   */
  async syncFile(name: string, content: string, fileId?: string): Promise<any> {
    if (fileId) {
      // 已知 fileId，直接更新（PATCH 不支持 parents 字段，只传 name）
      const boundary = `----CnotelyDrive${Date.now()}`;
      const metadata: any = { name };
      const body = buildMultipartBody(metadata, content, boundary);
      console.log(`[Google Drive] 用 fileId 更新文件: ${name} (${fileId})`);
      return gdUpload<any>(
        `/files/${encodeURIComponent(fileId)}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
          body,
        },
      );
    }

    // 未知 fileId，按文件名查找
    const folderId = await findOrCreateSyncFolder();
    const existingId = await findFileIdByNameInFolder(name, folderId);

    if (existingId) {
      // 更新已有文件
      const boundary = `----CnotelyDrive${Date.now()}`;
      const metadata: any = { name };
      const body = buildMultipartBody(metadata, content, boundary);
      console.log(`[Google Drive] 按文件名更新文件: ${name} (${existingId})`);
      return gdUpload<any>(
        `/files/${encodeURIComponent(existingId)}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
          body,
        },
      );
    } else {
      // 创建新文件
      const boundary = `----CnotelyDrive${Date.now()}`;
      const metadata: any = {
        name,
        parents: [folderId],
      };
      const body = buildMultipartBody(metadata, content, boundary);
      console.log(`[Google Drive] 创建新文件: ${name}`);
      return gdUpload<any>('/files?uploadType=multipart', {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
      });
    }
  },

  /** 上传新文件（不查重，保存到同步文件夹） */
  async uploadFile(fileName: string, fileContent: string): Promise<any> {
    const folderId = await findOrCreateSyncFolder();
    const boundary = `----CnotelyDrive${Date.now()}`;
    const metadata = {
      name: fileName,
      mimeType: fileName.endsWith('.md') ? 'text/markdown' : 'text/html', // 用 text/plain 避免 Google Drive 自动转换成 Google Docs 格式
      parents: [folderId],
    };

    // console.log('metadata', metadata);

    const body = buildMultipartBody(metadata, fileContent, boundary);
    console.log(`[Google Drive] 上传文件: ${fileName} 到文件夹 ${SYNC_FOLDER_NAME}`);
    return gdUpload<any>('/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
  },
};

export default googleDriveApi;
