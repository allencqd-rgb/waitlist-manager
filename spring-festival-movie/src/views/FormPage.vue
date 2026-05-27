<template>
  <div class="page-container">
    <!-- 背景层：红色渐变 + 胶片图案 -->
    <div class="bg-layer">
      <div class="bg-gradient"></div>
      <!-- 胶片装饰 - 右上角 -->
      <div class="film-strip film-strip-right"></div>
      <!-- 胶片装饰 - 左上角小 -->
      <div class="film-strip film-strip-left"></div>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <!-- Logo + 标题区 -->
      <div class="header-section">
        <div class="logo-area">
          <svg class="logo-svg" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 心形logo -->
            <path d="M25 10 C15 0, 0 10, 0 22 C0 35, 25 48, 25 48 C25 48, 50 35, 50 22 C50 10, 35 0, 25 10Z" fill="white" fill-opacity="0.9"/>
            <text x="60" y="20" fill="white" font-size="9" font-family="system-ui">领生医疗行业工会</text>
            <text x="60" y="32" fill="white" fill-opacity="0.7" font-size="6" font-family="system-ui">Labor Union of Medical Industry</text>
          </svg>
        </div>
        <h1 class="main-title">新春观影添欢乐</h1>
      </div>

      <!-- 副标题 -->
      <h2 class="sub-title">吉祥甄选礼平台积分</h2>

      <!-- 截止信息卡片（米色/淡黄底） -->
      <div v-if="!isClosed" class="deadline-card">
        <p class="deadline-row"><span class="dl-label">截止日期：</span><span class="dl-value">2026年2月5日</span></p>
        <p class="deadline-row"><span class="dl-label">申领对象：</span><span class="dl-value">2026年1月31日前在职会员</span></p>
        <p class="deadline-row deadline-note">逾期未领，将视为自动放弃。</p>
      </div>

      <!-- 表单区域 -->
      <div v-if="!isClosed" class="form-section">
        <div class="form-row">
          <span class="form-label">WWID：</span>
          <span class="form-value-fixed">{{ userInfo.wwid }}</span>
        </div>
        <div class="form-row">
          <span class="form-label">姓名：</span>
          <span class="form-value-fixed">{{ userInfo.name }}</span>
        </div>
        <div class="form-row">
          <span class="form-label">电话：</span>
          <input
            v-if="mode === 'edit'"
            v-model="formData.phone"
            type="tel"
            placeholder="13800138000"
            class="form-input"
            :class="{ 'input-error': phoneError }"
          />
          <span v-else class="form-value-fixed">{{ formData.phone || '—' }}</span>
        </div>

        <p v-if="phoneError" class="error-msg">{{ phoneError }}</p>

        <!-- 重要提醒 -->
        <p class="hint-text">
          【重要提醒】手机号码将用于与福利平台绑定，提交前，请务必确保手机号码输入准确。
        </p>

        <!-- 提交按钮 -->
        <button
          v-if="mode === 'edit'"
          class="submit-btn"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提 交' }}
        </button>
        <button
          v-else
          class="submit-btn"
          @click="mode = 'edit'"
        >
          更改信息
        </button>
      </div>

      <!-- 已截止状态 -->
      <div v-else class="closed-section">
        <div class="form-row">
          <span class="form-label">WWID：</span>
          <span class="form-value-fixed">{{ userInfo.wwid }}</span>
        </div>
        <div class="form-row">
          <span class="form-label">姓名：</span>
          <span class="form-value-fixed">{{ userInfo.name }}</span>
        </div>
        <div class="form-row">
          <span class="form-label">电话：</span>
          <span class="form-value-fixed">{{ formData.phone || '13800138000' }}</span>
        </div>

        <div class="closed-banner">
          <div class="closed-title">信息收集已截止</div>
          <p class="closed-note">感谢参与！</p>
          <p class="closed-note small">如有疑问请联系：客服邮箱</p>
          <p class="closed-note small">工作邮箱：support@platform.com</p>
        </div>

        <p class="hint-text closed-hint">
          * 预计春节前分发<br/>
          具体领取方式请留意邮件和本大屏中的领取指南
        </p>
      </div>
    </div>

    <!-- 底部插画区域：礼物盒 + 观影人物 -->
    <div class="bottom-illustration">
      <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" class="illust-svg">
        <!-- 礼盒左侧 -->
        <g transform="translate(20, 40)">
          <!-- 盒子主体 -->
          <rect x="0" y="30" width="90" height="70" rx="4" fill="#C41E3A" stroke="#8B0000" stroke-width="2"/>
          <!-- 盒盖 -->
          <rect x="-5" y="18" width="100" height="18" rx="3" fill="#E63946" stroke="#8B0000" stroke-width="2"/>
          <!-- 蝴蝶结左 -->
          <ellipse cx="20" cy="12" rx="16" ry="10" fill="#FFD700" transform="rotate(-20 20 12)"/>
          <ellipse cx="38" cy="12" rx="16" ry="10" fill="#FFE066" transform="rotate(20 38 12)"/>
          <circle cx="29" cy="16" r="5" fill="#DAA520"/>
          <!-- 丝带垂直 -->
          <rect x="25" y="18" width="8" height="82" fill="#FFD700"/>
          <!-- 礼物内容冒出：电影票 -->
          <rect x="55" y="-5" width="30" height="40" rx="2" fill="#F4E4BC" stroke="#D4C090" stroke-width="1"/>
          <line x1="60" y1="5" x2="80" y2="5" stroke="#C4A030" stroke-width="1"/>
          <line x1="60" y1="12" x2="80" y2="12" stroke="#C4A030" stroke-width="1"/>
          <line x1="60" y1="19" x2="75" y2="19" stroke="#C4A030" stroke-width="1"/>
          <!-- 爆米花桶 -->
          <path d="M10 -15 L5 10 L35 10 L30 -15 Z" fill="#FF6B35" stroke="#CC4400" stroke-width="1"/>
          <circle cx="12" cy="-18" r="4" fill="#FFE066"/>
          <circle cx="20" cy="-22" r="5" fill="#FFFACD"/>
          <circle cx="28" cy="-17" r="4" fill="#FFE066"/>
          <!-- 胶卷 -->
          <circle cx="70" cy="65" r="14" fill="#444" stroke="#222" stroke-width="2"/>
          <circle cx="70" cy="65" r="10" fill="#666"/>
          <circle cx="70" cy="65" r="4" fill="#888"/>
          <!-- 3D眼镜 -->
          <ellipse cx="30" cy="110" rx="12" ry="8" fill="#333" stroke="#111" stroke-width="1.5"/>
          <ellipse cx="52" cy="110" rx="12" ry="8" fill="#333" stroke="#111" stroke-width="1.5"/>
          <line x1="42" y1="108" x2="42" y2="112" stroke="#111" stroke-width="2"/>
          <!-- 场记板 -->
          <g transform="translate(85, 70) rotate(15)">
            <rect x="0" y="0" width="28" height="22" rx="2" fill="#222" stroke="#000" stroke-width="1"/>
            <rect x="2" y="2" width="24" height="8" fill="#FFF"/>
            <line x1="2" y1="6" x2="26" y2="6" stroke="#222" stroke-width="2"/>
            <rect x="10" y="-4" width="8" height="4" fill="#222"/>
          </g>
        </g>

        <!-- 右侧：看电影的人物 -->
        <g transform="translate(200, 30)">
          <!-- 电影座椅 -->
          <rect x="0" y="100" width="160" height="50" rx="6" fill="#B83A3A" stroke="#8B2020" stroke-width="2"/>
          <rect x="10" y="85" width="45" height="20" rx="4" fill="#C94A4A"/>
          <rect x="105" y="85" width="45" height="20" rx="4" fill="#C94A4A"/>

          <!-- 人物1：男性（中间） -->
          <g transform="translate(55, 35)">
            <!-- 身体 -->
            <rect x="10" y="35" width="36" height="55" rx="8" fill="#7B8FAF"/>
            <!-- 头 -->
            <circle cx="28" cy="20" r="16" fill="#F5D0B5"/>
            <!-- 头发 -->
            <path d="M12 16 Q16 2 28 4 Q40 2 44 16 Q44 10 40 8 Q28 0 16 8 Q12 10 12 16Z" fill="#3D2914"/>
            <!-- 眼睛 -->
            <circle cx="22" cy="19" r="1.5" fill="#333"/>
            <circle cx="34" cy="19" r="1.5" fill="#333"/>
            <!-- 微笑 -->
            <path d="M23 26 Q28 30 33 26" stroke="#A67C52" stroke-width="1.2" fill="none"/>
            <!-- 手臂拿爆米花 -->
            <rect x="-8" y="40" width="12" height="30" rx="5" fill="#7B8FAF"/>
            <rect x="46" y="40" width="12" height="30" rx="5" fill="#7B8FAF"/>
            <!-- 爆米花桶（手中） -->
            <path d="M-12 58 L-16 78 H0 L-4 58 Z" fill="#FF6B35" stroke="#CC4400" stroke-width="1"/>
            <circle cx="-10" cy="55" r="3" fill="#FFE066"/>
            <circle cx="-6" cy="53" r="3" fill="#FFFACD"/>
            <!-- 饮料杯 -->
            <rect x="48" y="52" width="12" height="24" rx="2" fill="#E74C3C"/>
            <rect x="47" y="48" width="14" height="5" rx="2" fill="#C0392B"/>
          </g>

          <!-- 人物2：女性（右边） -->
          <g transform="translate(115, 45)">
            <!-- 身体 -->
            <path d="M8 40 Q0 70 5 95 L45 95 Q50 70 42 40 Z" fill="#6B5B95"/>
            <!-- 头 -->
            <circle cx="25" cy="25" r="14" fill="#F5D0B5"/>
            <!-- 头发（长发） -->
            <path d="M11 22 Q13 6 25 8 Q37 6 39 22 Q39 16 35 14 Q25 6 15 14 Q11 16 11 22Z" fill="#2C1810"/>
            <path d="M10 25 Q5 50 8 70" stroke="#2C1810" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M40 25 Q45 50 42 70" stroke="#2C1810" stroke-width="6" fill="none" stroke-linecap="round"/>
            <!-- 眼睛 -->
            <circle cx="20" cy="23" r="1.5" fill="#333"/>
            <circle cx="30" cy="23" r="1.5" fill="#333"/>
            <!-- 微笑 -->
            <path d="M21 30 Q25 33 29 30" stroke="#A67C52" stroke-width="1.2" fill="none"/>
            <!-- 手臂 -->
            <rect x="-4" y="43" width="10" height="26" rx="4" fill="#6B5B95"/>
            <rect x="44" y="43" width="10" height="26" rx="4" fill="#6B5B95"/>
            <!-- 饮料 -->
            <rect x="44" y="54" width="10" height="20" rx="2" fill="#3498DB"/>
            <rect x="43" y="51" width="12" height="4" rx="2" fill="#2980B9"/>
          </g>

          <!-- 人物3：小孩（前面） -->
          <g transform="translate(80, 68)">
            <!-- 身体 -->
            <rect x="6" y="28" width="26" height="38" rx="6" fill="#E74C3C"/>
            <!-- 头 -->
            <circle cx="19" cy="17" r="12" fill="#F5D0B5"/>
            <!-- 头发（双马尾） -->
            <path d="M8 14 Q10 4 19 6 Q28 4 30 14 Q30 9 27 8 Q19 2 11 8 Q8 9 8 14Z" fill="#1A0F0A"/>
            <circle cx="5" cy="16" r="5" fill="#1A0F0A"/>
            <circle cx="33" cy="16" r="5" fill="#1A0F0A"/>
            <!-- 眼睛（大眼睛） -->
            <circle cx="15" cy="16" r="2" fill="#333"/>
            <circle cx="23" cy="16" r="2" fill="#333"/>
            <circle cx="15.5" cy="15.3" r="0.7" fill="#FFF"/>
            <circle cx="23.5" cy="15.3" r="0.7" fill="#FFF"/>
            <!-- 开心的嘴 -->
            <ellipse cx="19" cy="21" rx="3" ry="2" fill="#E57373"/>
            <!-- 手臂 -->
            <rect x="-2" y="32" width="8" height="20" rx="3" fill="#E74C3C"/>
            <rect x="30" y="32" width="8" height="20" rx="3" fill="#E74C3C"/>
            <!-- 爆米花 -->
            <path d="M-4 44 L-7 58 H6 L2 44 Z" fill="#FF6B35" stroke="#CC4400" stroke-width="0.8"/>
            <circle cx="-2" cy="42" r="2.5" fill="#FFE066"/>
            <circle cx="1" cy="40" r="2.5" fill="#FFFACD"/>
          </g>
        </g>

        <!-- 星星装饰 -->
        <circle cx="180" cy="20" r="2" fill="#FFD700" opacity="0.6"/>
        <circle cx="350" cy="15" r="1.5" fill="#FFD700" opacity="0.5"/>
        <circle cx="300" cy="35" r="2.5" fill="#FFE066" opacity="0.4"/>
        <circle cx="130" cy="50" r="1.5" fill="#FFD700" opacity="0.5"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isClosed = route.name === 'closed'
const mode = ref<'edit' | 'view'>('edit')
const submitting = ref(false)
const phoneError = ref('')

// 用户信息（实际应从接口获取）
const userInfo = reactive({
  wwid: '张三',
  name: '123234',
})

const formData = reactive({
  phone: '',
})

function validatePhone(phone: string): boolean {
  if (!phone) {
    phoneError.value = '请输入手机号'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的手机号格式'
    return false
  }
  phoneError.value = ''
  return true
}

async function handleSubmit() {
  if (!validatePhone(formData.phone)) return

  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  submitting.value = false
  mode.value = 'view'
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  max-width: 480px;
  margin: 0 auto;
}

/* ====== 背景层 ====== */
.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    175deg,
    #990000 0%,
    #B20000 15%,
    #CC0000 35%,
    #DC143C 60%,
    #E63946 80%,
    #CD3333 100%
  );
}

/* 胶片图案 - 右上角大 */
.film-strip-right {
  position: absolute;
  top: -30px;
  right: -40px;
  width: 280px;
  height: 320px;
  background:
    /* 胶片边孔 - 左侧 */
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 14px,
      rgba(0,0,0,0.25) 14px,
      rgba(0,0,0,0.25) 22px
    ),
    /* 胶片边孔 - 右侧 */
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 14px,
      rgba(0,0,0,0.25) 14px,
      rgba(0,0,0,0.25) 22px
    );
  background-size: 30px 100%, 30px 100%;
  background-position: 0 0, calc(100% - 30px) 0;
  border-radius: 20px;
  transform: rotate(-12deg);
  opacity: 0.35;
  box-shadow:
    inset 0 0 30px rgba(255,215,0,0.08),
    0 0 40px rgba(0,0,0,0.15);
}

/* 胶片内框线 */
.film-strip-right::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 32px;
  right: 32px;
  bottom: 0;
  border: 2px solid rgba(0,0,0,0.15);
  border-radius: 8px;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 35px,
      rgba(0,0,0,0.08) 35px,
      rgba(0,0,0,0.08) 37px
    );
}

/* 胶片图案 - 左上角小 */
.film-strip-left {
  position: absolute;
  top: 60px;
  left: -50px;
  width: 150px;
  height: 180px;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 10px,
      rgba(0,0,0,0.2) 10px,
      rgba(0,0,0,0.2) 16px
    ),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 10px,
      rgba(0,0,0,0.2) 10px,
      rgba(0,0,0,0.2) 16px
    );
  background-size: 22px 100%, 22px 100%;
  background-position: 0 0, calc(100% - 22px) 0;
  border-radius: 12px;
  transform: rotate(8deg);
  opacity: 0.2;
}

/* ====== 内容区 ====== */
.content-area {
  position: relative;
  z-index: 1;
  padding: 20px 18px 220px;
}

.header-section {
  margin-bottom: 6px;
}

.logo-area {
  margin-bottom: 10px;
}

.logo-svg {
  width: 140px;
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.main-title {
  font-size: 32px;
  font-weight: 900;
  color: #FFD700;
  text-shadow:
    0 2px 4px rgba(139, 0, 0, 0.6),
    0 0 20px rgba(255, 215, 0, 0.2);
  letter-spacing: 4px;
  margin: 0;
  line-height: 1.2;
}

.sub-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  margin: 6px 0 18px;
  font-weight: 500;
  letter-spacing: 1px;
}

/* ====== 截止信息卡片（米色底） ====== */
.deadline-card {
  background: linear-gradient(135deg, #FFF8E7 0%, #FFEFCC 100%);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.deadline-row {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.6;
  color: #8B0000;
}

.dl-label {
  font-weight: 700;
  color: #CC0000;
}

.dl-value {
  color: #333;
}

.deadline-note {
  color: #B22222 !important;
  font-weight: 600;
  margin-top: 6px !important;
}

/* ====== 表单区域 ====== */
.form-section,
.closed-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 18px 16px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.form-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-row:last-of-type {
  border-bottom: none;
}

.form-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  min-width: 56px;
  font-weight: 500;
  letter-spacing: 1px;
}

.form-value-fixed {
  font-size: 15px;
  color: #fff;
  flex: 1;
  font-weight: 500;
}

.form-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.97);
  border: 1.5px solid transparent;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  color: #333;
  outline: none;
  transition: all 0.2s;
  font-weight: 500;
}

.form-input:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.form-input.input-error {
  border-color: #ff4444;
  background: #fff5f5;
}

.error-msg {
  color: #ffcccc;
  font-size: 12px;
  margin: 6px 0 0;
}

.hint-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin: 16px 0 22px;
}

.hint-text.closed-hint {
  margin-top: 16px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #E63946 0%, #CC0000 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  letter-spacing: 6px;
  box-shadow: 0 4px 16px rgba(204, 0, 0, 0.4);
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(204, 0, 0, 0.5);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ====== 已截止状态 ====== */
.closed-banner {
  text-align: center;
  padding: 24px 12px 16px;
}

.closed-title {
  font-size: 22px;
  font-weight: 800;
  color: #FFD700;
  margin-bottom: 10px;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.closed-note {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0;
}

.closed-note.small {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}

/* ====== 底部插画 ====== */
.bottom-illustration {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 200px;
  pointer-events: none;
  z-index: 1;
}

.illust-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom;
}
</style>
