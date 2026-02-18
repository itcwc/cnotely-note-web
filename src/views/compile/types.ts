// 定义类型
export interface TreeData {
  id?: string;
  name: string;
  path: string;
  type: string;
  content?: string;
  full_name?: string;
  children?: TreeData[];

  createdAt?: number; // 创建时间
  updatedAt?: number; // 更新时间
}

export interface RepoData {
  name: string;
  full_name?: string;
  description?: string;
  children?: RepoData[];
}

export interface Node {
  expanded: boolean;
  [key: string]: any;
}

export interface SelectedFile {
  name: string;
  content: string;
  path?: string;
  updatedAt?: number | string;
  id?: string;
}

export interface UserInfo {
  email: string;
  avatar: string;
  nickname: string;
  access_token: string;
  default_storage_provider: string;
}
