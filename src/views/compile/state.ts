import { ref, computed } from "vue";
import { SelectedFile, UserInfo, TreeData, RepoData } from "./types";
import RepoAside from "../../components/layout/RepoAside.vue";

// 基本设置
const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("theme") === "dark",
);

// 移动端判断
const isMobile = () => window.innerWidth <= 768;

// 检查是否为颜色值（只验证HEX格式）
const isColorValue = (value: string): boolean => {
  if (!value) return false;
  // 只检查是否为HEX格式（6位或3位），因为系统只会存储这种格式
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

// 导出选项
const options = [
  { value: "md", label: "compile_view.export_md" },
  { value: "pdf", label: "compile_view.export_pdf" },
  { value: "html", label: "compile_view.export_html" },
  { value: "docx", label: "compile_view.export_docx" },
  { value: "txt", label: "compile_view.export_txt" },
];

// 创建状态的函数
export const createState = () => {
  // 响应式变量
  // 编辑器相关
  const isProcessing = ref(false);
  const repoAsideRef = ref<InstanceType<typeof RepoAside> | null>(null);
  const isInitializing = ref(true); // 加载锁
  const selectedFile = ref<SelectedFile>({ name: "", content: "" });
  const height = "100%";
  const editLanguage = ref<string>(savedLanguage || "en");
  const editorTheme = ref<string>(
    localStorage.getItem("editorTheme") ?? "default",
  );
  const editorAreaTheme = ref<string>(
    localStorage.getItem("editorAreaTheme") ?? "default",
  );
  const previewAreaTheme = ref<string>(
    localStorage.getItem("previewAreaTheme") ?? "default",
  );

  // 编辑器类型
  const editorType = ref<string>(
    localStorage.getItem("editorType") || "editormd",
  ); // 可选值: editormd, quill

  // 新建文件相关
  const showNewFileDialog = ref<boolean>(false);
  const newFileType = ref<string>("md"); // 默认文件类型
  let fileCounter = 1; // 用于生成默认文件名

  // 面板大小控制
  const panel1Size = ref<number>(50); // 左侧用户面板大小
  const panel2Size = ref<number>(250); // 中间文件列表面板大小
  const editorPanelSize = ref<number | undefined>(); // 编辑器面板大小

  // 搜索状态
  const searchKeyword = ref<string>(""); // 搜索关键词
  const timelineFiles = ref<TreeData[]>([]); // 按时间排序的文件列表

  // 布局相关
  const splitterWrapper = ref<HTMLElement | null>(null);
  const isCollapsible = ref<boolean>(false);

  // 用户信息管理
  const isLoggedIn = ref<boolean>(false);
  const userInfo = ref<UserInfo>({
    email: "",
    avatar: "",
    nickname: "",
    access_token: "",
    default_storage_provider: "",
  });

  // 平台相关
  const selectedPlatform = ref<string>(
    localStorage.getItem("selected_platform") ||
    userInfo.value.default_storage_provider ||
    "",
  );

  // 仓库相关
  const repos = ref<RepoData[]>([]);
  // 初始化一个默认的本地仓库，确保selectedRepo始终有值
  const selectedRepo = ref<RepoData>({
    name: "本地仓库",
    full_name: "local/local-repo",
    description: "本地文件存储",
  });
  const repoTree = ref<TreeData[]>([]);
  const defaultExpandedKeys = ref<string[]>([]);

  // 编辑器ID
  const editorId = ref(Date.now());

  // 用户菜单引用
  const userMenuRef = ref<any>(null);

  const selectValue = ref<string>(options[0].value);

  // 文件名
  const fileName = ref<string>("Note"); // 默认文件名为 "note"

  return {
    isProcessing,
    repoAsideRef,
    isInitializing,
    selectedFile,
    height,
    editLanguage,
    editorTheme,
    editorAreaTheme,
    previewAreaTheme,
    editorType,
    showNewFileDialog,
    newFileType,
    fileCounter,
    panel1Size,
    panel2Size,
    editorPanelSize,
    searchKeyword,
    timelineFiles,
    splitterWrapper,
    isCollapsible,
    isLoggedIn,
    userInfo,
    selectedPlatform,
    repos,
    selectedRepo,
    repoTree,
    defaultExpandedKeys,
    editorId,
    userMenuRef,
    options,
    selectValue,
    fileName,
    savedLanguage,
    isMobile,
    isColorValue,
  };
};
