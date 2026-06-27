import { nextTick } from "vue";
import { ElMessage } from "element-plus";
import githubApi from "../../api/github";
import { TreeData, RepoData, Node } from "./types";
import { useRouter } from "vue-router";

// 定义状态类型
interface State {
  selectedPlatform: any;
  repos: any;
  selectedRepo: any;
  repoTree: any;
  defaultExpandedKeys: any;
  repoAsideRef: any;
}

// 状态对象，将在 Compile.vue 中设置
let state: State | null = null;
let t: any = null;
let router: any = null;

// 设置状态
export const setRepoState = (s: State, i18n: any, r: any) => {
  state = s;
  t = i18n;
  router = r;
};

// 自动检测当前已授权的平台（不依赖 selectedPlatform）
const detectPlatform = (): string | null => {
  // 读 localStorage 里的 user_info（OAuth 登录后写入）
  try {
    const raw = localStorage.getItem("user_info");
    if (raw) {
      const info = JSON.parse(raw);
      if (info?.provider) return info.provider;
    }
  } catch {}
  // 降级：看 selectedPlatform 是否有值
  if (state?.selectedPlatform?.value) {
    return state.selectedPlatform.value;
  }
  return null;
};

// 切换平台函数
const togglePlatform = () => {
  if (!t) return;

  // 提示用户并跳转到设置页
  ElMessage({
    message: t("compile_view.redirecting_to_profile"),
    type: "success",
    duration: 1000,
    showClose: true,
  });

  // 延迟一小段时间后跳转，让用户能看到提示信息
  setTimeout(() => {
    router.push("/settings");
  }, 1000);
};

// 节点展开/折叠事件处理
const handleNodeExpand = (data: TreeData, node: Node) => {
  console.log("Node expanded:", data.name);
};

const handleNodeCollapse = (data: TreeData, node: Node) => {
  console.log("Node collapsed:", data.name);
};

// 设置默认展开节点
const setDefaultExpandedNodes = () => {
  if (!state) return;
  
  // 调试信息
  console.log("repoTree:", state.repoTree.value);
  console.log("repoTree length:", state.repoTree.value.length);

  // 默认展开第一层节点
  const expandedKeys = state.repoTree.value.slice(0, 10).map((item: TreeData) => {
    // 确保 item 有 path 属性
    console.log("item:", item);
    return item.path || item.full_name || item.name;
  });

  console.log("expandedKeys:", expandedKeys);
  state.defaultExpandedKeys.value = expandedKeys;

  // 确保 defaultExpandedKeys 被正确设置
  console.log("defaultExpandedKeys:", state.defaultExpandedKeys.value);
};

// 打开仓库选择对话框
const openRepoDialog = async () => {
  if (!state || !t) return;

  // 自动检测平台，不强制要求 selectedPlatform
  const platform = state.selectedPlatform.value || detectPlatform();
  if (!platform) {
    ElMessage.warning(t("compile_view.please_login_first") || "请先登录");
    return;
  }

  try {
    if (platform === "github") {
      state.repos.value = await githubApi.repos.getUserRepos();
    }
  } catch (error) {
    console.error("获取仓库列表失败:", error);
    ElMessage.error(t("compile_view.get_repo_list_failure"));
  } finally {
    state.repoAsideRef.value?.handleRepoLoaded();
  }
};

// 选择仓库
const selectRepo = async (repo: RepoData) => {
  if (!state) return;
  
  state.selectedRepo.value = repo;
  await getRepoTree(repo.full_name || repo.name);
};

// 获取仓库文件树
const getRepoTree = async (repoName: string) => {
  if (!state || !t) return;
  
  const platform = state.selectedPlatform.value || detectPlatform();
  if (!platform) return;

  try {
    if (platform === "github") {
      let tree = await githubApi.repos.getRepoTree(repoName);

      // 只使用仓库文件，不合并本地文件
      state.repoTree.value = tree;
      // 使用 nextTick 确保 repoTree 数据更新后再设置默认展开节点
      nextTick(() => {
        setDefaultExpandedNodes();
      });
    }
  } catch (error) {
    console.error("获取仓库文件树失败:", error);
    ElMessage.error(t("compile_view.get_repo_tree_failure"));
  }
};

export {
  togglePlatform,
  handleNodeExpand,
  handleNodeCollapse,
  setDefaultExpandedNodes,
  openRepoDialog,
  selectRepo,
  getRepoTree,
};
