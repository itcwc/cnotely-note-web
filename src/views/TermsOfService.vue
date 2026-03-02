<template>
  <div class="terms-policy-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <el-button type="primary" @click="goBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            {{ t("common.back_to_previous") }}
          </el-button>
          <h1>{{ t("terms_of_service.title") }}</h1>
        </div>
      </el-header>
      <el-main>
        <div class="terms-content">
          <h2>{{ t("terms_of_service.section1") }}</h2>
          <p>{{ t("terms_of_service.intro") }}</p>
          <p>{{ t("terms_of_service.intro_note") }}</p>

          <h2>{{ t("terms_of_service.section2") }}</h2>
          <p>{{ t("terms_of_service.service_content") }}</p>
          <ul>
            <li>{{ serviceItem1 }}</li>
            <li>{{ serviceItem2 }}</li>
            <li>{{ serviceItem3 }}</li>
            <li>{{ serviceItem4 }}</li>
            <li>{{ serviceItem5 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section3") }}</h2>

          <h3>{{ t("terms_of_service.section3_1") }}</h3>
          <p>{{ t("terms_of_service.registration_process") }}</p>
          <p>{{ t("terms_of_service.registration_methods") }}</p>
          <ul>
            <li>{{ registrationOption1 }}</li>
            <li>{{ registrationOption2 }}</li>
            <li>{{ registrationOption3 }}</li>
          </ul>

          <h3>{{ t("terms_of_service.section3_2") }}</h3>
          <p>{{ t("terms_of_service.account_security") }}</p>
          <ul>
            <li>{{ securityMeasure1 }}</li>
            <li>{{ securityMeasure2 }}</li>
            <li>{{ securityMeasure3 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section4") }}</h2>
          <p>{{ t("terms_of_service.user_behavior") }}</p>
          <ul>
            <li>{{ behaviorRule1 }}</li>
            <li>{{ behaviorRule2 }}</li>
            <li>{{ behaviorRule3 }}</li>
            <li>{{ behaviorRule4 }}</li>
            <li>{{ behaviorRule5 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section5") }}</h2>

          <h3>{{ t("terms_of_service.section5_1") }}</h3>
          <p>{{ t("terms_of_service.our_ip") }}</p>
          <ul>
            <li>{{ ipItem1 }}</li>
            <li>{{ ipItem2 }}</li>
            <li>{{ ipItem3 }}</li>
            <li>{{ ipItem4 }}</li>
          </ul>
          <p>{{ t("terms_of_service.ip_note") }}</p>

          <h3>{{ t("terms_of_service.section5_2") }}</h3>
          <p>{{ t("terms_of_service.your_content") }}</p>
          <ul>
            <li>{{ contentPermission1 }}</li>
            <li>{{ contentPermission2 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section6") }}</h2>

          <h3>{{ t("terms_of_service.section6_1") }}</h3>
          <p>{{ t("terms_of_service.changes_note") }}</p>

          <h3>{{ t("terms_of_service.section6_2") }}</h3>
          <p>{{ t("terms_of_service.account_termination") }}</p>
          <ul>
            <li>{{ terminationReason1 }}</li>
            <li>{{ terminationReason2 }}</li>
            <li>{{ terminationReason3 }}</li>
          </ul>
          <p>{{ t("terms_of_service.termination_note") }}</p>

          <h2>{{ t("terms_of_service.section7") }}</h2>
          <p>{{ t("terms_of_service.disclaimer_text") }}</p>
          <ul>
            <li>{{ disclaimerItem1 }}</li>
            <li>{{ disclaimerItem2 }}</li>
            <li>{{ disclaimerItem3 }}</li>
          </ul>
          <p>{{ t("terms_of_service.no_warranties") }}</p>
          <ul>
            <li>{{ warrantyItem1 }}</li>
            <li>{{ warrantyItem2 }}</li>
            <li>{{ warrantyItem3 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section8") }}</h2>
          <p>{{ t("terms_of_service.limitation_text") }}</p>
          <ul>
            <li>{{ limitationItem1 }}</li>
            <li>{{ limitationItem2 }}</li>
            <li>{{ limitationItem3 }}</li>
          </ul>

          <h2>{{ t("terms_of_service.section9") }}</h2>
          <p>{{ t("terms_of_service.updates_text") }}</p>
          <p>{{ t("terms_of_service.updates_note") }}</p>

          <h2>{{ t("terms_of_service.section10") }}</h2>
          <p>{{ t("terms_of_service.contact_text") }}</p>
          <p>
            <strong
              >{{ t("terms_of_service.email") }}support@cnotely.com</strong
            >
          </p>

          <div class="last-updated">
            <p>
              <strong>{{ t("terms_of_service.last_updated") }}</strong>
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
const serviceItem1 = t("terms_of_service.service_item1");
const serviceItem2 = t("terms_of_service.service_item2");
const serviceItem3 = t("terms_of_service.service_item3");
const serviceItem4 = t("terms_of_service.service_item4");
const serviceItem5 = t("terms_of_service.service_item5");

const registrationOption1 = t("terms_of_service.registration_option1");
const registrationOption2 = t("terms_of_service.registration_option2");
const registrationOption3 = t("terms_of_service.registration_option3");

const securityMeasure1 = t("terms_of_service.security_measure1");
const securityMeasure2 = t("terms_of_service.security_measure2");
const securityMeasure3 = t("terms_of_service.security_measure3");

const behaviorRule1 = t("terms_of_service.behavior_rule1");
const behaviorRule2 = t("terms_of_service.behavior_rule2");
const behaviorRule3 = t("terms_of_service.behavior_rule3");
const behaviorRule4 = t("terms_of_service.behavior_rule4");
const behaviorRule5 = t("terms_of_service.behavior_rule5");

const ipItem1 = t("terms_of_service.ip_item1");
const ipItem2 = t("terms_of_service.ip_item2");
const ipItem3 = t("terms_of_service.ip_item3");
const ipItem4 = t("terms_of_service.ip_item4");

const contentPermission1 = t("terms_of_service.content_permission1");
const contentPermission2 = t("terms_of_service.content_permission2");

const terminationReason1 = t("terms_of_service.termination_reason1");
const terminationReason2 = t("terms_of_service.termination_reason2");
const terminationReason3 = t("terms_of_service.termination_reason3");

const disclaimerItem1 = t("terms_of_service.disclaimer_item1");
const disclaimerItem2 = t("terms_of_service.disclaimer_item2");
const disclaimerItem3 = t("terms_of_service.disclaimer_item3");

const warrantyItem1 = t("terms_of_service.warranty_item1");
const warrantyItem2 = t("terms_of_service.warranty_item2");
const warrantyItem3 = t("terms_of_service.warranty_item3");

const limitationItem1 = t("terms_of_service.limitation_item1");
const limitationItem2 = t("terms_of_service.limitation_item2");
const limitationItem3 = t("terms_of_service.limitation_item3");
</script>

<style scoped>
.terms-policy-container {
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

.terms-content {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--el-bg-color);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.terms-content h2 {
  /* color: #303133; */
  margin-top: 32px;
  margin-bottom: 16px;
  font-size: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.terms-content h3 {
  color: #409eff;
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 16px;
}

.terms-content p {
  /* color: #606266; */
  line-height: 1.6;
  margin-bottom: 16px;
}

.terms-content ul {
  /* color: #606266; */
  line-height: 1.6;
  margin-bottom: 16px;
  padding-left: 24px;
}

.terms-content li {
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

  .terms-content {
    padding: 24px;
  }

  .terms-content h2 {
    font-size: 18px;
  }

  .terms-content h3 {
    font-size: 15px;
  }
}
</style>
