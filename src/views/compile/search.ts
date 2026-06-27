import { indexedDBHelper } from "../../utils/indexedDB";
import { TreeData } from "./types";

// 定义状态类型
interface State {
  searchKeyword: any;
  timelineFiles: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;

// 设置状态
export const setSearchState = (s: State) => {
  state = s;
};

/**
 * 排序文件列表
 * @param newFile 可选。如果是刚创建的文件，直接传入以实现“秒开”
 */
const sortFilesByTime = async (newFile?: TreeData) => {
  if (!state) return;

  // 1. 乐观更新：如果有新文件，直接插队到数组最前面
  if (newFile) {
    // 检查是否已经存在（防止重复触发）
    const exists = state.timelineFiles.value.some((f: TreeData) => f.name === newFile.name);
    if (!exists) {
      // 插入到开头并保持引用，这样 Vue 只会渲染新增的那一行
      state.timelineFiles.value.unshift(newFile);
      console.log("⚡ 快速渲染：新文件已插入时光流");
    }
    // 既然已经手动更新了 UI，我们可以异步地去同步数据库，不需要让用户等
  }

  // 2. 只有在列表为空或者需要彻底同步时才执行全量读取
  // 我们可以利用请求动画帧，把重活放在下一帧执行，不阻塞 UI
  requestAnimationFrame(async () => {
    try {
      // 检查 state 是否为 null
      if (!state) return;
      
      // 如果数据量巨大，考虑在这里加一个简单的缓存逻辑或只取前 50 条
      const localFiles = await indexedDBHelper.getAllFiles();

      const allFiles: TreeData[] = localFiles.map((file) => ({
        id: file.id,
        name: file.name,
        path: file.path || file.name,
        type: "file",
        content: file.content,
        editorMode: file.editorMode,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      }));

      // 排序
      allFiles.sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA;
      });

      // 只有在数据真的发生变化时才更新引用
      state.timelineFiles.value = allFiles;
    } catch (error) {
      console.error("排序文件失败:", error);
    }
  });
};

// 刷新文件列表
const refreshFiles = async () => {
  try {
    // 直接重新排序文件，从IndexedDB获取最新数据
    await sortFilesByTime();
  } catch (error) {
    console.error("刷新文件列表失败:", error);
  }
};

// 处理搜索
const handleSearch = async (keyword: string) => {
  if (!state) return;

  state.searchKeyword.value = keyword;
  // 搜索
  if (keyword.trim()) {
    const filteredFiles = state.timelineFiles.value.filter((file: any) => {
      return (
        file.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (file.content &&
          file.content.toLowerCase().includes(keyword.toLowerCase()))
      );
    });
    state.timelineFiles.value = filteredFiles;
  } else {
    // 搜索关键词为空，重新按时间排序
    await sortFilesByTime();
  }
};

// 重置搜索
const resetSearch = async () => {
  if (!state) return;

  state.searchKeyword.value = "";
  await sortFilesByTime();
};

export {
  sortFilesByTime,
  refreshFiles,
  handleSearch,
  resetSearch,
};
