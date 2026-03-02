<template>
  <div class="privacy-policy-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <el-button type="primary" @click="goBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            {{ t("common.back_to_previous") }}
          </el-button>
          <h1>{{ t("privacy_policy.title") }}</h1>
        </div>
      </el-header>
      <el-main>
        <div class="privacy-content">
          <h2>{{ t("privacy_policy.section1") }}</h2>
          <p>{{ t("privacy_policy.intro") }}</p>
          <p>{{ t("privacy_policy.intro_note") }}</p>

          <h2>{{ t("privacy_policy.section2") }}</h2>

          <h3>{{ t("privacy_policy.section2_1") }}</h3>
          <p>{{ t("privacy_policy.account_info") }}</p>
          <ul>
            <li>{{ accountItem1 }}</li>
            <li>{{ accountItem2 }}</li>
            <li>{{ accountItem3 }}</li>
            <li>{{ accountItem4 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section2_2") }}</h3>
          <p>{{ t("privacy_policy.oauth_info") }}</p>
          <ul>
            <li>{{ oauthItem1 }}</li>
            <li>{{ oauthItem2 }}</li>
            <li>{{ oauthItem3 }}</li>
            <li>{{ oauthItem4 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section2_3") }}</h3>
          <p>{{ t("privacy_policy.note_storage") }}</p>
          <ul>
            <li>{{ noteStorageItem1 }}</li>
            <li>{{ noteStorageItem2 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section2_4") }}</h3>
          <p>{{ t("privacy_policy.usage_data") }}</p>
          <ul>
            <li>{{ usageItem1 }}</li>
            <li>{{ usageItem2 }}</li>
          </ul>

          <h2>{{ t("privacy_policy.section3") }}</h2>
          <ul>
            <li>{{ usagePurpose1 }}</li>
            <li>{{ usagePurpose2 }}</li>
            <li>{{ usagePurpose3 }}</li>
            <li>{{ usagePurpose4 }}</li>
            <li>{{ usagePurpose5 }}</li>
          </ul>

          <h2>{{ t("privacy_policy.section4") }}</h2>

          <h3>{{ t("privacy_policy.section4_1") }}</h3>
          <p>{{ t("privacy_policy.local_storage_text") }}</p>
          <ul>
            <li>{{ localStorageItem1 }}</li>
            <li>{{ localStorageItem2 }}</li>
            <li>{{ localStorageItem3 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section4_2") }}</h3>
          <p>{{ t("privacy_policy.cloud_storage_text") }}</p>
          <ul>
            <li>{{ cloudStorageItem1 }}</li>
            <li>{{ cloudStorageItem2 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section4_3") }}</h3>
          <p>{{ t("privacy_policy.server_storage") }}</p>
          <ul>
            <li>{{ serverStorageItem1 }}</li>
            <li>{{ serverStorageItem2 }}</li>
            <li>{{ serverStorageItem3 }}</li>
          </ul>

          <h3>{{ t("privacy_policy.section4_4") }}</h3>
          <p>{{ t("privacy_policy.security_measures") }}</p>
          <ul>
            <li>{{ securityItem1 }}</li>
            <li>{{ securityItem2 }}</li>
            <li>{{ securityItem3 }}</li>
            <li>{{ securityItem4 }}</li>
          </ul>

          <h2>{{ t("privacy_policy.section5") }}</h2>
          <p>{{ t("privacy_policy.third_party_services") }}</p>

          <h3>{{ t("privacy_policy.section5_1") }}</h3>
          <p>{{ t("privacy_policy.github_info") }}</p>

          <h3>{{ t("privacy_policy.section5_2") }}</h3>
          <p>{{ t("privacy_policy.google_info") }}</p>

          <h3>{{ t("privacy_policy.section5_3") }}</h3>
          <p>{{ t("privacy_policy.frontend_libraries") }}</p>
          <ul>
            <li>{{ frontendItem1 }}</li>
            <li>{{ frontendItem2 }}</li>
            <li>{{ frontendItem3 }}</li>
            <li>{{ frontendItem4 }}</li>
            <li>{{ frontendItem5 }}</li>
            <li>{{ frontendItem6 }}</li>
            <li>{{ frontendItem7 }}</li>
          </ul>

          <h2>{{ t("privacy_policy.section6") }}</h2>
          <p>{{ t("privacy_policy.your_rights_text") }}</p>
          <ul>
            <li>{{ rightsItem1 }}</li>
            <li>{{ rightsItem2 }}</li>
            <li>{{ rightsItem3 }}</li>
            <li>{{ rightsItem4 }}</li>
            <li>{{ rightsItem5 }}</li>
          </ul>

          <h2>{{ t("privacy_policy.section8") }}</h2>
          <p>{{ t("privacy_policy.extension_permissions_text") }}</p>
          <ul>
            <li>{{ permissionActiveTab }}</li>
            <li>{{ permissionStorage }}</li>
            <li>{{ permissionContextMenu }}</li>
            <li>{{ permissionScripting }}</li>
            <li>{{ permissionNotifications }}</li>
            <li>{{ permissionSidePanel }}</li>
            <li>{{ permissionWindows }}</li>
            <li>{{ permissionHostPermissions }}</li>
          </ul>
          <p>{{ t("privacy_policy.extension_user_rights_text") }}</p>

          <h2>{{ t("privacy_policy.section9") }}</h2>
          <p>{{ t("privacy_policy.policy_updates_text") }}</p>
          <p>{{ t("privacy_policy.policy_updates_note") }}</p>

          <h2>{{ t("privacy_policy.section10") }}</h2>
          <p>{{ t("privacy_policy.contact_text") }}</p>
          <p>
            <strong>{{ t("privacy_policy.email") }}support@cnotely.com</strong>
          </p>

          <div class="last-updated">
            <p>
              <strong>{{ t("privacy_policy.last_updated") }}</strong>
            </p>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ArrowLeft } from "@element-plus/icons-vue";

const { t } = useI18n();
import { useRouter } from "vue-router";

const router = useRouter();

// 返回上一页
const goBack = () => {
  // 检查是否有上一页，如果没有则返回首页
  if (window.history.length <= 2) {
    router.push('/');
  } else {
    router.back();
  }
};

// 将数组类型的翻译值拆分为单独的变量
const accountItem1 = t("privacy_policy.account_item1");
const accountItem2 = t("privacy_policy.account_item2");
const accountItem3 = t("privacy_policy.account_item3");
const accountItem4 = t("privacy_policy.account_item4");

const oauthItem1 = t("privacy_policy.oauth_item1");
const oauthItem2 = t("privacy_policy.oauth_item2");
const oauthItem3 = t("privacy_policy.oauth_item3");
const oauthItem4 = t("privacy_policy.oauth_item4");

const noteStorageItem1 = t("privacy_policy.note_storage_item1");
const noteStorageItem2 = t("privacy_policy.note_storage_item2");

const usageItem1 = t("privacy_policy.usage_item1");
const usageItem2 = t("privacy_policy.usage_item2");

const usagePurpose1 = t("privacy_policy.usage_purpose1");
const usagePurpose2 = t("privacy_policy.usage_purpose2");
const usagePurpose3 = t("privacy_policy.usage_purpose3");
const usagePurpose4 = t("privacy_policy.usage_purpose4");
const usagePurpose5 = t("privacy_policy.usage_purpose5");

const localStorageItem1 = t("privacy_policy.local_storage_item1");
const localStorageItem2 = t("privacy_policy.local_storage_item2");
const localStorageItem3 = t("privacy_policy.local_storage_item3");

const cloudStorageItem1 = t("privacy_policy.cloud_storage_item1");
const cloudStorageItem2 = t("privacy_policy.cloud_storage_item2");

const serverStorageItem1 = t("privacy_policy.server_storage_item1");
const serverStorageItem2 = t("privacy_policy.server_storage_item2");
const serverStorageItem3 = t("privacy_policy.server_storage_item3");

const securityItem1 = t("privacy_policy.security_item1");
const securityItem2 = t("privacy_policy.security_item2");
const securityItem3 = t("privacy_policy.security_item3");
const securityItem4 = t("privacy_policy.security_item4");

const frontendItem1 = t("privacy_policy.frontend_item1");
const frontendItem2 = t("privacy_policy.frontend_item2");
const frontendItem3 = t("privacy_policy.frontend_item3");
const frontendItem4 = t("privacy_policy.frontend_item4");
const frontendItem5 = t("privacy_policy.frontend_item5");
const frontendItem6 = t("privacy_policy.frontend_item6");
const frontendItem7 = t("privacy_policy.frontend_item7");

const rightsItem1 = t("privacy_policy.rights_item1");
const rightsItem2 = t("privacy_policy.rights_item2");
const rightsItem3 = t("privacy_policy.rights_item3");
const rightsItem4 = t("privacy_policy.rights_item4");
const rightsItem5 = t("privacy_policy.rights_item5");

const cookiesItem1 = t("privacy_policy.cookies_item1");
const cookiesItem2 = t("privacy_policy.cookies_item2");
const cookiesItem3 = t("privacy_policy.cookies_item3");

// 浏览器扩展权限相关变量
const permissionActiveTab = t("privacy_policy.permission_active_tab");
const permissionStorage = t("privacy_policy.permission_storage");
const permissionContextMenu = t("privacy_policy.permission_context_menu");
const permissionScripting = t("privacy_policy.permission_scripting");
const permissionNotifications = t("privacy_policy.permission_notifications");
const permissionSidePanel = t("privacy_policy.permission_side_panel");
const permissionWindows = t("privacy_policy.permission_windows");
const permissionHostPermissions = t("privacy_policy.permission_host_permissions");

</script>

<style scoped>
.privacy-policy-container {
  min-height: 100vh;
  background-color: var(--el-color-info-light-9);
  display: flex;
  flex-direction: column;
}

.el-header {
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 40px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-main {
  flex: 1;
  overflow-y: auto;
}

.back-home {
  margin-right: 20px;
}

.el-header h1 {
  margin: 0;
  color: var(--el-text-color);
  font-size: 24px;
}

.el-main {
  padding: 40px;
}

.privacy-content {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--el-bg-color);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.privacy-content h2 {
  /* color: #303133; */
  margin-top: 32px;
  margin-bottom: 16px;
  font-size: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.privacy-content h3 {
  color: #409eff;
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 16px;
}

.privacy-content p {
  /* color: #606266; */
  line-height: 1.6;
  margin-bottom: 16px;
}

.privacy-content ul {
  /* color: #606266; */
  line-height: 1.6;
  margin-bottom: 16px;
  padding-left: 24px;
}

.privacy-content li {
  margin-bottom: 8px;
}

.last-updated {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  /* color: #909399; */
  font-size: 14px;
}

@media (max-width: 768px) {
  .el-header {
    padding: 0 20px;
  }

  .el-main {
    padding: 20px;
  }

  .privacy-content {
    padding: 24px;
  }

  .privacy-content h2 {
    font-size: 18px;
  }

  .privacy-content h3 {
    font-size: 15px;
  }
}
</style>
