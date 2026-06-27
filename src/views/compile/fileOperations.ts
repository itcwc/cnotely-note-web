import { nextTick } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import githubApi from "../../api/github";
import {
  exportMarkdown,
  exportTxt,
  exportPdf,
  exportHtml,
  exportDocx,
  ExportOptions,
} from "../../../src/utils/export";
import { indexedDBHelper, StoredFile } from "../../utils/indexedDB";
import { TreeData, SelectedFile } from "./types";
import { sortFilesByTime } from "./search";

// 定义状态类型
interface State {
  selectedFile: any;
  fileName: any;
  repoTree: any;
  timelineFiles?: any;
  defaultExpandedKeys?: any;
  isInitializing?: any;
  editorId?: any;
  newFileType?: any;
  newFileMode?: any;
  showNewFileDialog?: any;
  selectValue?: any;
  selectedRepo?: any;
  isProcessing?: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;


// 标志位：是否正在自动创建文件
let isAutoCreating = false;

// 设置状态
export const setState = (s: State) => {
  state = s;
};

// 获取自动创建标志（供外部使用）
export const getIsAutoCreating = () => isAutoCreating;

// 生成唯一文件名（基于日期，重复则递增）
const generateUniqueFileName = (t: any, extension: string = ".md"): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const baseName = `${t("compile_view.new_note")}-${dateStr}`;

  if (!state) return `${baseName}${extension}`;

  const existingNames = new Set<string>();

  const collectNames = (files: TreeData[]) => {
    for (const f of files) {
      existingNames.add(f.name.toLowerCase());
      if (f.children) collectNames(f.children);
    }
  };
  if (state.repoTree?.value) collectNames(state.repoTree.value);
  if (state.timelineFiles?.value) {
    for (const f of state.timelineFiles.value) {
      existingNames.add(f.name.toLowerCase());
    }
  }

  let candidate = `${baseName}${extension}`;
  let counter = 1;
  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${baseName}(${counter})${extension}`;
    counter++;
  }
  return candidate;
};

// 自动创建第一个文件
const autoCreateFirstFile = async (initialContent: string, t: any) => {
  if (!state) return;

  isAutoCreating = true;

  try {
    const fileType = "md";
    const fullFileName = generateUniqueFileName(t);
    const baseName = fullFileName.replace(/\.md$/i, "");

    // 3. 更新状态，确保 ID 彻底清空以防污染
    state.selectedFile.value = {
      id: undefined, // 关键：确保生成新记录
      name: fullFileName,
      content: initialContent,
    };

    // UI 标题显示（不带后缀）
    state.fileName.value = baseName;

    // 4. 同步到内存中的文件树
    const newFile: TreeData = {
      name: fullFileName,
      path: fullFileName,
      content: initialContent,
      type: "file",
      updatedAt: Date.now(),
    };
    state.repoTree.value.push(newFile);

    // 5. 保存到 IndexedDB
    console.log(`🚀 自动创建模式 [${fileType}] :`, fullFileName);
    const savedFile = await indexedDBHelper.saveFile(
      {
        name: fullFileName,
        content: initialContent,
        type: fileType,
      },
      true // forceInsert: 确保是新记录
    );

    // 6. 回填自增 ID，后续保存操作将基于此 ID
    if (savedFile && savedFile.id) {
      state.selectedFile.value.id = savedFile.id;
    }

    // 构造一个简单的 TreeData 对象
    const fileToDisplay: TreeData = {
      id: savedFile.id,
      name: fullFileName,
      path: fullFileName,
      type: "file",
      content: "", // 时光流预览通常不需要全文，可以传空
      updatedAt: Date.now(),
    };

    // 传入新对象，触发"插队"逻辑
    await sortFilesByTime(fileToDisplay);

    // 7. 更新侧边栏
    await sortFilesByTime();
    localStorage.setItem("lastSelectedFile", fullFileName);

  } catch (error) {
    console.error("自动创建失败:", error);
  } finally {
    isAutoCreating = false;
  }
};

// 处理编辑器内容变化事件
const handleContentChange = async (file: SelectedFile) => {
  if (!state) return;

  // 如果正在自动创建文件，跳过保存操作
  if (isAutoCreating) return;

  // 更新selectedFile内容
  state.selectedFile.value.content = file.content;

  // 保存到repoTree和IndexedDB，传入文件ID
  // 重复触发1
  // console.log("使用6");
  await saveCurrentFileContent(undefined, file.id);
};

// 处理重命名文件事件
const handleRenameFile = async (file: TreeData, newName: string, t: any) => {
  if (!state) return;

  const renameFileInTree = (files: TreeData[]): boolean => {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name === file.name) {
        files[i] = { ...f, name: newName };
        return true;
      }
      if (f.children && f.children.length > 0) {
        if (renameFileInTree(f.children)) {
          return true;
        }
      }
    }
    return false;
  };

  renameFileInTree(state.repoTree.value);

  // 同步更新 timelineFiles
  if (state.timelineFiles?.value) {
    const timelineIndex = state.timelineFiles.value.findIndex(
      (f: TreeData) => f.name === file.name,
    );
    if (timelineIndex !== -1) {
      state.timelineFiles.value[timelineIndex] = {
        ...state.timelineFiles.value[timelineIndex],
        name: newName,
      };
      state.timelineFiles.value = [...state.timelineFiles.value];
    }
  }

  if (state.selectedFile.value.name === file.name) {
    state.selectedFile.value = {
      ...state.selectedFile.value,
      name: newName,
    };
    const nameWithoutExt = newName.replace(/\.[^/.]+$/, "");
    state.fileName.value = nameWithoutExt;
  }

  try {
    await indexedDBHelper.renameFile(file.name, newName);
    console.log("文件已重命名:", file.name, "->", newName);
    ElMessage.success(t("compile_view.file_renamed"));
  } catch (error) {
    console.error("重命名文件失败:", error);
  }
};

// 处理删除文件事件
const handleDeleteFile = async (file: TreeData, t: any) => {
  if (!state) return;

  // 从repoTree中删除文件节点
  const removeFileFromTree = (files: TreeData[]): boolean => {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name === file.name) {
        files.splice(i, 1);
        return true;
      }
      if (f.children && f.children.length > 0) {
        if (removeFileFromTree(f.children)) {
          return true;
        }
      }
    }
    return false;
  };

  removeFileFromTree(state.repoTree.value);

  // 如果删除的是当前选中的文件，需要重置选中状态
  if (state.selectedFile.value.name === file.name) {
    if (state.repoTree.value.length > 0) {
      // 选择第一个文件作为当前文件
      const firstFile = state.repoTree.value[0];
      state.selectedFile.value = {
        name: firstFile.name,
        content: firstFile.content || "",
      };
      state.fileName.value = firstFile.name.split(".")[0] || "";
    } else {
      // 如果没有文件了，重置选中状态
      state.selectedFile.value = {
        name: "",
        content: "",
      };
      state.fileName.value = t("compile_view.new_note");
    }
  }

  // 从IndexedDB中删除文件
  try {
    await indexedDBHelper.deleteFileByName(file.name);
    console.log("文件已从IndexedDB删除:", file.name);
  } catch (error) {
    console.error("从IndexedDB删除文件失败:", error);
  }
};

// 处理导入文件事件
const handleImportFile = async (importData: {
  name: string;
  content: string;
  type: string;
}, t: any) => {
  if (!state) return;

  try {
    // 设置自动创建标志，防止触发 handleContentChange 时重复保存
    isAutoCreating = true;
    
    // 保存当前文件内容
    console.log('使用4');
    await saveCurrentFileContent();

    // 生成唯一路径
    const fileExt = importData.name.endsWith(".md") ? ".md" : ".html";
    const baseName = importData.name.replace(/\.md$|\.html$/i, "");
    const newFilePath = `local://${baseName}${fileExt}`;

    // 创建新的文件对象
    const newFile: TreeData = {
      name: importData.name,
      path: newFilePath,
      type: "file",
      content: importData.content,
    };

    // 添加到repoTree
    state.repoTree.value.push(newFile);

    // 切换到新文件
    state.selectedFile.value = {
      name: importData.name,
      content: importData.content,
    };

    // 设置文件名
    state.fileName.value = baseName;

    console.log("保存2");
    // 保存到IndexedDB
    const savedFile = await indexedDBHelper.saveFile({
      name: importData.name,
      content: importData.content,
      type: importData.type as "md" | "html",
    });

    // 更新 selectedFile，包含返回的 id
    state.selectedFile.value = {
      ...state.selectedFile.value,
      id: savedFile.id,
    };

    // 构造一个简单的 TreeData 对象，用于时光流更新
    const fileToDisplay: TreeData = {
      id: savedFile.id,
      name: importData.name,
      path: newFilePath,
      type: "file",
      content: "", // 时光流预览通常不需要全文，可以传空
      updatedAt: Date.now(),
    };

    // 传入新对象，触发时光流的“插队”逻辑，实现实时更新
    await sortFilesByTime(fileToDisplay);

    // ElMessage.success(t('compile_view.import_success'));
  } catch (error) {
    console.error("导入文件失败:", error);
    ElMessage.error(t("compile_view.import_failure"));
  } finally {
    // 重置自动创建标志
    isAutoCreating = false;
  }
};

// 处理导入选中文件事件
const handleImportSelectedFiles = async (
  repo: any,
  selectedFiles: string[],
  t: any
) => {
  if (!state) return;

  try {
    // 保存当前文件内容
    console.log('使用5');
    await saveCurrentFileContent();

    state.selectedRepo.value = repo;
    let importedCount = 0;

    // 遍历选中的文件
    for (const filePath of selectedFiles) {
      try {
        // 获取文件内容
        const fileContent = await githubApi.repos.getFileContent(
          repo.full_name || repo.name,
          filePath,
        );

        // 提取文件名
        const fileName = filePath.split("/").pop() || "";
        if (!fileName) continue;

        // 确定文件类型
        const fileExt = fileName.endsWith(".md") ? ".md" : ".html";

        console.log("保存3");
        // 保存到IndexedDB
        await indexedDBHelper.saveFile({
          name: fileName,
          content: fileContent.content,
          type: fileExt === ".md" ? "md" : "html",
          repo: repo.full_name || repo.name,
          path: filePath,
          branch: repo.default_branch || "main",
        });

        importedCount++;
      } catch (error) {
        console.error(`导入文件 ${filePath} 失败:`, error);
      }
    }

    if (importedCount > 0) {
      ElMessage.success(
        t("compile_view.imported_files_success", { count: importedCount }),
      );
    } else {
      ElMessage.warning(t("compile_view.no_files_imported"));
    }
  } catch (error) {
    console.error("导入选中文件失败:", error);
    ElMessage.error(t("compile_view.import_failure"));
  }
};

// 处理导出文件事件
const handleExportFile = async (file: TreeData, format?: string, t?: any) => {
  if (!state) return;

  console.log("导出文件:", file, "格式:", format);

  // 如果是当前选中的文件，直接使用当前内容和选择的格式
  if (file.name === state.selectedFile.value.name) {
    exportFile(format, t);
  } else {
    // 如果不是当前选中的文件，从缓存中获取文件内容
    try {
      const fileContentFromDB = await indexedDBHelper.getFileByName(file.name);
      if (fileContentFromDB) {
        // 保存当前选中文件的状态
        const originalSelectedFile = { ...state.selectedFile.value };
        const originalFileName = state.fileName.value;

        // 临时设置为要导出的文件
        state.selectedFile.value = {
          name: file.name,
          content: fileContentFromDB.content,
        };
        // 截取文件名，去掉扩展名
        state.fileName.value = file.name.split(".")[0];

        // 执行导出
        exportFile(format, t);

        // 恢复原状态
        state.selectedFile.value = originalSelectedFile;
        state.fileName.value = originalFileName;
      } else {
        if (t) {
          ElMessage.error(t("compile_view.cannot_get_file_content"));
        }
      }
    } catch (error) {
      console.error("获取文件内容失败:", error);
      if (t) {
        ElMessage.error(t("compile_view.get_file_content_failure"));
      }
    }
  }
};

// 创建新文件
const createNewFile = async (t: any) => {
  if (!state) return;

  // 1. 开启全局锁，屏蔽主组件的 watch
  state.isProcessing.value = true;

  try {
    const editorMode = state.newFileMode?.value || "markdown";
    const fileExt = editorMode === "richtext" ? ".html" : ".md";
    const fileType = editorMode === "richtext" ? "html" : "md";
    const finalFileName = generateUniqueFileName(t, fileExt);
    const baseName = finalFileName.replace(/\.(md|html)$/i, "");

    // 富文本初始内容（空 HTML）
    const initialContent = editorMode === "richtext" ? "<p><br></p>" : "";

    // 2. 先保存到数据库，提前拿到 ID
    const savedFile = await indexedDBHelper.saveFile({
      name: finalFileName,
      content: initialContent,
      type: fileType,
      editorMode,
    }, true);

    // 构造一个简单的 TreeData 对象
    const fileToDisplay: TreeData = {
      id: savedFile.id,
      name: finalFileName,
      path: finalFileName,
      type: "file",
      content: "",
      editorMode,
      updatedAt: Date.now(),
    };

    // 传入新对象，触发“插队”逻辑
    await sortFilesByTime(fileToDisplay);

    // 3. 将拿到的 ID 和信息填入状态
    state.selectedFile.value = {
      id: savedFile.id,
      name: finalFileName,
      content: initialContent,
      editorMode,
    };

    // 4. 更新树和 UI
    state.repoTree.value.push({
      name: finalFileName,
      path: finalFileName,
      content: initialContent,
      type: "file",
      editorMode,
    });

    state.fileName.value = baseName;

    // 关闭对话框
    state.showNewFileDialog.value = false;
    ElMessage.success(t("compile_view.new_file_created"));

  } finally {
    // 5. 延迟释放锁
    setTimeout(() => {
      if (state) {
        state.isProcessing.value = false;
      }
    }, 300);
  }
};

// 导出文件方法
const exportFile = (format?: string, t?: any) => {
  if (!state || !t) return;

  // 如果提供了格式参数，则使用提供的格式，否则使用默认值
  const exportFormat = format || state.selectValue.value;
  // 添加日志以调试格式传递问题
  console.log("Compile exportFile called with format:", format);
  console.log("Final exportFormat:", exportFormat);
  const content = state.selectedFile.value.content;
  if (!content.trim()) {
    ElMessage({
      message: t("compile_view.empty_input_message"),
      type: "error",
      duration: 2000,
    });
    return;
  }
  const name = state.fileName.value || t("compile_view.new_note"); // 使用输入的文件名或默认值

  // 判断是否为HTML内容（基于文件扩展名）
  const isHtmlContent = state.selectedFile.value.name.endsWith('.html');

  // 基本导出选项
  const baseExportOptions: ExportOptions = {
    content,
    fileName: name,
    isHtmlContent,
  };

  switch (exportFormat) {
    case "md":
      if (isHtmlContent) {
        ElMessage({
          message: t("compile_view.rich_text_export_limit"),
          type: "warning",
          duration: 2000,
        });
        return;
      }
      exportMarkdown(baseExportOptions);
      break;
    case "pdf":
      exportPdf(baseExportOptions);
      break;
    case "html":
      ElMessageBox({
        title: t("compile_view.export_html_title"),
        message: t("compile_view.export_html_message"),
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: t("compile_view.dark_mode"),
        cancelButtonText: t("compile_view.light_mode"),
        confirmButtonClass: "export-hmd-cbtn",
      })
        .then(() => {
          exportHtml({ ...baseExportOptions, theme: "dark" });
        })
        .catch(() => {
          exportHtml({ ...baseExportOptions, theme: "light" });
        });
      break;
    case "docx":
      exportDocx(baseExportOptions);
      break;
    case "txt":
      exportTxt(baseExportOptions);
      break;
    default:
      console.error("Unsupported format");
  }
};

// 保存到云方法（如有实现）
const saveCloud = () => {
  // 这里可根据实际需求实现保存到云的逻辑
  // ElMessage({
  //   message: t("settings_view.save_not_online"),
  //   type: "warning",
  //   duration: 2000,
  // });
};

// 保存当前文件内容到repoTree和IndexedDB

const saveCurrentFileContent = async (oldName?: string, fileId?: string) => {
  if (!state) return;

  if (state.selectedFile.value.name) {
    // 更新repoTree中的文件内容
    if (state.repoTree.value.length > 0) {
      const findAndUpdateFile = (files: TreeData[]): boolean => {
        if (!state) return false;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name === state.selectedFile.value.name) {
            // 更新文件内容
            file.content = state.selectedFile.value.content;
            return true;
          }
          if (file.children && file.children.length > 0) {
            if (findAndUpdateFile(file.children)) {
              return true;
            }
          }
        }
        return false;
      };
      findAndUpdateFile(state.repoTree.value);
    }

    // 保存到IndexedDB
    try {
      // 确定文件类型
      const fileExtension = state.selectedFile.value.name.split(".").pop();
      const type = fileExtension === "md" ? "md" : "html";

      // 尝试获取现有文件，以获取仓库相关信息
      let existingFile = null;
      try {
        existingFile = await indexedDBHelper.getFileByName(
          state.selectedFile.value.name,
        );
      } catch (error) {
        console.error("获取现有文件失败:", error);
      }

      // 如果提供了旧文件名，先检查是否存在旧文件
      if (oldName && oldName !== state.selectedFile.value.name) {
        try {
          // 尝试获取旧文件
          const oldFile = await indexedDBHelper.getFileByName(oldName);
          if (oldFile) {
            // 如果存在旧文件，先删除它
            await indexedDBHelper.deleteFileByName(oldName);
          }
        } catch (error) {
          console.error("删除旧文件失败:", error);
        }
      }

      // console.log("保存4");
      const savedFile = await indexedDBHelper.saveFile({
        id: fileId,
        name: state.selectedFile.value.name,
        content: state.selectedFile.value.content,
        type: type as "md" | "html",
        repo: existingFile?.repo,
        path: existingFile?.path,
        branch: existingFile?.branch,
        sha: existingFile?.sha,
      });

      // 更新 selectedFile，包含返回的 id
      if (savedFile.id) {
        state.selectedFile.value = {
          ...state.selectedFile.value,
          id: savedFile.id,
        };
      }
      // console.log("文件已保存到IndexedDB");
    } catch (error) {
      console.error("保存文件到IndexedDB失败:", error);
    }
  }
};

// 从repoTree中查找文件
const findFileInRepoTree = (
  path: string,
  files: TreeData[],
): TreeData | null => {
  for (const file of files) {
    if (file.name === path) {
      return file;
    }
    if (file.children && file.children.length > 0) {
      const found = findFileInRepoTree(path, file.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 节点点击事件处理
const handleNodeClick = async (data: TreeData) => {
  const currentState = state;
  if (!currentState) return;

  // 第一步：让编辑器彻底消失
  currentState.isProcessing.value = true; 
  currentState.selectedFile.value = { content: "" }; // 清空旧数据

  await nextTick(); // 等待 Vue 销毁 DOM

  try {
    if (!data.id) {
      currentState.isProcessing.value = false;
      return;
    }
    const fileFromDB = await indexedDBHelper.getFileById(data.id);
    if (fileFromDB) {
      // 第二步：赋值新数据
      currentState.selectedFile.value = fileFromDB;
      
      // 更新文件名（去掉扩展名）
      const baseName = data.name.replace(/\.md$|\.html$/i, "");
      currentState.fileName.value = baseName;
      
      // 第三步：延迟 50ms 再让编辑器回来，给第三方库清理内存的时间
      setTimeout(() => {
        currentState.isProcessing.value = false;
      }, 50);
    }
  } catch (e) {
    currentState.isProcessing.value = false;
  }
};

// 从IndexedDB恢复文件数据
const restoreFilesFromIndexedDB = async (t: any) => {
  if (!state) return;

  try {
    state.isInitializing.value = true;
    const files = await indexedDBHelper.getAllFiles();

    if (files.length > 0) {
      // ... 原有的恢复逻辑 ...
    } else {
      // --- 情况：数据库完全为空 ---
      // 我们创建一个临时的"未命名"状态，但不立即存入 DB
      state.selectedFile.value = {
        name: "", // 保持为空，作为触发自动创建的信号
        content: "",
      };
      state.fileName.value = t("compile_view.new_note"); // 显示"新建笔记"
    }

    await nextTick();
    state.isInitializing.value = false;
  } catch (error) {
    console.error(error);
    if (state) {
      state.isInitializing.value = false;
    }
  }
};


// 准备进入“待创建”状态（清空当前编辑器）
const prepareNewFile = (t: any) => {
  if (!state) return;

  // 关键：彻底清空对象，包括 id
  state.selectedFile.value = {
    id: undefined, // 必须显式重置
    name: "",      // name 为空，才会再次触发 autoCreateFirstFile 的逻辑
    content: "",
  };
  state.fileName.value = t("compile_view.new_note");
  console.log("状态已重置，输入内容将自动创建新文件");
};

export {
  autoCreateFirstFile,
  handleContentChange,
  handleDeleteFile,
  handleRenameFile,
  handleImportFile,
  handleImportSelectedFiles,
  handleExportFile,
  createNewFile,
  exportFile,
  saveCloud,
  saveCurrentFileContent,
  findFileInRepoTree,
  handleNodeClick,
  restoreFilesFromIndexedDB,
  prepareNewFile,
};
