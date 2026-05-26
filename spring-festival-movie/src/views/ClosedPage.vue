<template>
  <div class="page-container">
    <div class="bg-layer">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <div class="content-area">
      <div class="header-section">
        <div class="logo-icon">❤️</div>
        <h1 class="main-title">新春观影添欢乐</h1>
      </div>

      <h2 class="sub-title">吉祥甄选礼平台积分</h2>

      <div class="closed-banner-large">
        <div class="closed-title">信息收集已截止</div>
      </div>

      <div class="form-section">
        <div class="form-row">
          <span class="form-label">WWID：</span>
          <span class="form-value-fixed">张三</span>
        </div>
        <div class="form-row">
          <span class="form-label">姓名：</span>
          <span class="form-value-fixed">123234</span>
        </div>
        <div class="form-row">
          <span class="form-label">电话：</span>
          <span class="form-value-fixed">13800138000</span>
        </div>

        <p class="hint-text closed-hint">
          * 预计春节前分发<br/>
          具体领取方式请留意邮件和本大屏中的领取指南
        </p>
      </div>
    </div>

    <div class="bottom-decoration"></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  max-width: 480px;
  margin: 0 auto;
}

.bg-layer { position: fixed; inset: 0; z-index: -1; }
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #8B0000 0%, #CC0000 40%, #E63946 100%);
}
.bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image:
    radial-gradient(circle at 20% 30%, #FFD700 2px, transparent 2px),
    radial-gradient(circle at 80% 20%, #FFD700 1px, transparent 1px),
    radial-gradient(circle at 60% 70%, #FFD700 2px, transparent 2px);
  background-size: 60px 60px, 80px 80px, 100px 100px;
}

.content-area {
  position: relative;
  z-index: 1;
  padding: 24px 20px 180px;
}

.header-section { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.logo-icon { font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }

.main-title {
  font-size: 28px;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 2px 8px rgba(139, 0, 0, 0.8);
  letter-spacing: 2px;
  margin: 0;
}

.sub-title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  margin: 4px 0 16px;
  font-weight: 500;
}

.closed-banner-large {
  text-align: center;
  padding: 32px 12px 24px;
}

.closed-title {
  font-size: 26px;
  font-weight: 800;
  color: #FFD700;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.form-section {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 20px 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.form-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.form-row:last-of-type { border-bottom: none; }
.form-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  min-width: 52px;
  font-weight: 500;
}
.form-value-fixed { font-size: 14px; color: #fff; flex: 1; }

.hint-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 14px 0 0;
}
.hint-text.closed-hint { margin-top: 16px; }

.bottom-decoration {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 160px;
  background: linear-gradient(to top, rgba(139, 0, 0, 0.6), transparent);
  pointer-events: none;
  z-index: 0;
}
</style>
