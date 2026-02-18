// IndexedDB 工具类

// 定义文件类型
export type FileType = "md" | "html";

// 定义文件对象接口
export interface StoredFile {
  id?: string; // 唯一标识符
  name: string; // 文件名
  content: string; // 文件内容
  type: FileType; // 文件类型
  createdAt: number; // 创建时间
  updatedAt: number; // 更新时间
  // 仓库相关信息（云端导入时使用）
  repo?: string; // 仓库名称（格式：owner/repo）
  path?: string; // 文件路径
  branch?: string; // 分支名称
  sha?: string; // 文件的 SHA 值
}

// 数据库名称和版本
const DB_NAME = "cnotely-db";
const DB_VERSION = 4;
const STORE_NAME = "files";

// IndexedDB 工具类
class IndexedDBHelper {
  private db: IDBDatabase | null = null;
  private readyPromise: Promise<void> | null = null;

  // 初始化数据库
  init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // 数据库升级或首次创建
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 获取或创建文件存储
        let store;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // 创建文件存储
          store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          // 创建索引
          store.createIndex("byName", "name", { unique: false });
          store.createIndex("byType", "type", { unique: false });
        } else {
          // 在升级事件中，我们需要使用事务来获取对象存储
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            store = transaction.objectStore(STORE_NAME);

            // 检查并处理索引
            if (store.indexNames.contains("byName")) {
              // 删除旧的索引（可能是 unique: true）
              store.deleteIndex("byName");
            }
            // 创建新的非唯一索引
            store.createIndex("byName", "name", { unique: false });

            if (!store.indexNames.contains("byType")) {
              store.createIndex("byType", "type", { unique: false });
            }
          }
        }
      };

      // 数据库打开成功
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      // 数据库打开失败
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.readyPromise;
  }

  // 保存文件
  async saveFile(file: Omit<StoredFile, "createdAt" | "updatedAt"> & { id?: any }, isNewfile: boolean = false): Promise<StoredFile> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    // 1. 统一后缀逻辑：只有不包含点的时候才加，且强制转换
    let fileName = file.name;
    if (fileName && !fileName.includes('.')) {
      fileName += (file.type === 'md' ? '.md' : '.html');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const now = Date.now();

      // 2. 定义执行保存的内部函数
      const executePut = (existing?: StoredFile) => {
        // --- 核心防御：如果传入的内容是空的，且数据库里已经有内容，拒绝覆盖 ---
        // 这一步能防止刷新页面时，初始化阶段的空内容把旧数据冲掉
        if (existing && existing.content && !file.content) {
          console.warn(`[DB] 拒绝将文件 ${fileName} 覆盖为空内容`);
          resolve(existing);
          return;
        }

        const fileToSave: any = {
          ...file,
          name: fileName,
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        };

        // --- 核心修复：处理 ID ---
        if (existing?.id) {
          fileToSave.id = existing.id; // 保持原有 ID
        } else if (file.id) {
          fileToSave.id = file.id; // 使用传入的 ID
        } else {
          // 如果是新文件且没有 ID，删除 id 属性
          // 这样 IndexedDB 才会根据 autoIncrement 自动生成主键
          delete fileToSave.id;
        }

        const saveRequest = store.put(fileToSave);
        saveRequest.onsuccess = () => {
          // 返回值里必须带上生成的 ID
          const finalId = existing?.id || (saveRequest.result as string);
          resolve({ ...fileToSave, id: finalId });
        };
        saveRequest.onerror = (e) => reject((e.target as IDBRequest).error);
      };


      console.log(file);

      if (isNewfile) {
        // 没有 ID，按带后缀的文件名找
        const index = store.index("byName");
        const getByNameReq = index.get(fileName);
        getByNameReq.onsuccess = () => executePut(getByNameReq.result);
      } else {
        // 3. 查找逻辑：ID 优先 > 文件名索引
        if (file.id) {
          // 如果有 ID，直接按 ID 找，这是最准的
          const getByIdReq = store.get(file.id);
          getByIdReq.onsuccess = () => executePut(getByIdReq.result);
        }

        // else if (store.indexNames.contains("byName")) {
        //   // 没有 ID，按带后缀的文件名找
        //   const index = store.index("byName");
        //   const getByNameReq = index.get(fileName);
        //   getByNameReq.onsuccess = () => executePut(getByNameReq.result);
        // }

        else {
          executePut();
        }
      }


    });
  }

  // 根据名称获取文件（返回第一个匹配的文件）
  async getFileByName(name: string): Promise<StoredFile | null> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      // 尝试使用索引获取文件
      if (store.indexNames.contains("byName")) {
        try {
          const index = store.index("byName");

          // 使用 openCursor 而不是 get，因为文件名可能重复
          const request = index.openCursor(name);

          request.onsuccess = () => {
            const cursor = request.result;

            if (cursor) {
              // 找到第一个匹配的文件
              resolve(cursor.value as StoredFile);
            } else {
              // 如果没有找到，且名称不带后缀，尝试查找带后缀的版本
              if (name && !name.includes('.')) {
                // 尝试 .md 后缀
                const mdRequest = index.openCursor(name + '.md');
                mdRequest.onsuccess = () => {
                  const mdCursor = mdRequest.result;
                  if (mdCursor) {
                    resolve(mdCursor.value as StoredFile);
                  } else {
                    // 尝试 .html 后缀
                    const htmlRequest = index.openCursor(name + '.html');
                    htmlRequest.onsuccess = () => {
                      const htmlCursor = htmlRequest.result;
                      resolve(htmlCursor ? htmlCursor.value as StoredFile : null);
                    };
                    htmlRequest.onerror = (event) => {
                      reject((event.target as IDBRequest).error);
                    };
                  }
                };
                mdRequest.onerror = (event) => {
                  reject((event.target as IDBRequest).error);
                };
              } else {
                resolve(null);
              }
            }
          };

          request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
          };
        } catch (error) {
          // 如果索引操作失败，返回 null
          resolve(null);
        }
      } else {
        // 如果索引不存在，返回 null
        resolve(null);
      }
    });
  }

  // 根据名称获取所有文件（处理文件名重复的情况）
  async getFilesByName(name: string): Promise<StoredFile[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const files: StoredFile[] = [];

      // 尝试使用索引获取文件
      if (store.indexNames.contains("byName")) {
        try {
          const index = store.index("byName");

          // 使用 openCursor 遍历所有匹配的文件
          const request = index.openCursor(name);

          request.onsuccess = () => {
            const cursor = request.result;

            if (cursor) {
              files.push(cursor.value as StoredFile);
              cursor.continue();
            } else {
              // 如果没有找到，且名称不带后缀，尝试查找带后缀的版本
              if (name && !name.includes('.')) {
                // 尝试 .md 后缀
                const mdRequest = index.openCursor(name + '.md');
                mdRequest.onsuccess = () => {
                  const mdCursor = mdRequest.result;
                  if (mdCursor) {
                    files.push(mdCursor.value as StoredFile);
                    mdCursor.continue();
                  }

                  // 尝试 .html 后缀
                  const htmlRequest = index.openCursor(name + '.html');
                  htmlRequest.onsuccess = () => {
                    const htmlCursor = htmlRequest.result;
                    if (htmlCursor) {
                      files.push(htmlCursor.value as StoredFile);
                      htmlCursor.continue();
                    }
                    resolve(files);
                  };
                  htmlRequest.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                  };
                };
                mdRequest.onerror = (event) => {
                  reject((event.target as IDBRequest).error);
                };
              } else {
                resolve(files);
              }
            }
          };

          request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
          };
        } catch (error) {
          // 如果索引操作失败，返回空数组
          resolve([]);
        }
      } else {
        // 如果索引不存在，返回空数组
        resolve([]);
      }
    });
  }

  // 获取所有文件
  async getAllFiles(): Promise<StoredFile[]> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as StoredFile[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // 删除文件
  async deleteFileByName(name: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // 尝试使用索引获取文件
      if (store.indexNames.contains("byName")) {
        try {
          const index = store.index("byName");

          // 使用 openCursor 遍历所有匹配的文件
          const request = index.openCursor(name);

          request.onsuccess = () => {
            const cursor = request.result;

            if (cursor) {
              const file = cursor.value as StoredFile;
              if (file && file.id) {
                const deleteRequest = store.delete(file.id);

                deleteRequest.onsuccess = () => {
                  // 继续删除下一个匹配的文件
                  cursor.continue();
                };

                deleteRequest.onerror = (event) => {
                  reject((event.target as IDBRequest).error);
                };
              } else {
                cursor.continue();
              }
            } else {
              // 所有匹配的文件都已处理完毕
              resolve();
            }
          };

          request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
          };
        } catch (error) {
          // 如果索引操作失败，直接返回
          resolve();
        }
      } else {
        // 如果索引不存在，直接返回
        resolve();
      }
    });
  }

  // 清空所有文件
  async clearAllFiles(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // 通过 ID 获取文件
  async getFileById(id: string): Promise<StoredFile | null> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const file = request.result as StoredFile;
        resolve(file || null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}


// 导出单例实例
export const indexedDBHelper = new IndexedDBHelper();
