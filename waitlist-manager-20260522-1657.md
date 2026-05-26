# 演出候补递补管理系统 - 开发工件

## 目标
根据用户提供的 PRD 文档，创建一个完整的演出候补递补管理系统原型。

## 关键推理
1. **技术选型**：采用 PRD 建议的 React + Tailwind + LocalStorage 方案，适合 V1 单机单用户场景
2. **数据模型**：严格按照 PRD 定义的字段（姓名、工号、演出名称、城市、候补日期、状态等）
3. **去重逻辑**：实现工号+演出名称+城市+候补日期的唯一性约束
4. **递补操作**：采用拖拽 + 确认弹窗的方式，符合 PRD 要求的用户交互流程
5. **自动清理**：递补后自动取消同工号的其他候补记录

## 实现的功能
根据 PRD 的 User Stories，已实现：

### Story 1: 候补名单录入与去重 ✓
- 表单录入，带必填验证
- CSV 批量导入，自动去重并报告重复数量
- 重复检测：工号+演出名称+城市+候补日期

### Story 2: 候补名单排序展示 ✓
- 默认按候补创建时间升序排列
- 点击列头可切换升序/降序
- 支持按演出名称和城市筛选

### Story 3: 递补操作 ✓
- 拖拽候补记录到剧目卡片完成递补
- 确认弹窗显示完整递补信息
- 递补后自动取消该人员（相同工号）的所有其他候补记录
- 右侧卡片实时显示已递补人员列表

### Story 4: 剧目卡片管理 ✓
- 从候补名单自动聚合演出名称+城市+候补日期组合
- 每张卡片显示：演出名称、城市、日期、候补人数、已递补人数
- 支持展开/折叠，展示已递补人员详细列表

### Story 5: 数据导出 ✓
- 导出全部记录 / 候补名单 / 已递补记录
- 生成 UTF-8 BOM CSV 文件，Excel 打开无乱码
- 文件名格式：`候补管理_[类型]_[时间戳].csv`

## 技术实现细节

### 项目结构
```
waitlist-manager/
├── src/
│   ├── utils/
│   │   ├── storage.js      # LocalStorage 读写
│   │   └── waitlist.js     # 核心业务逻辑
│   ├── components/
│   │   ├── WaitlistTable.jsx   # 左侧候补表格
│   │   ├── ShowCards.jsx       # 右侧剧目卡片
│   │   ├── AddEntryModal.jsx   # 添加记录弹窗
│   │   └── ImportModal.jsx     # CSV 导入弹窗
│   ├── App.jsx             # 主应用组件
│   ├── App.css             # 样式文件
│   └── main.jsx           # 入口文件
├── vite.config.js          # Vite + Tailwind 配置
└── tailwind.config.js      # Tailwind 配置
```

### 核心工具函数 (waitlist.js)
- `isDuplicate()` - 去重检测
- `createWaitlistEntry()` - 创建候补记录
- `getShowCombinations()` - 聚合剧目组合
- `performAssignment()` - 执行递补操作（含自动清理）
- `exportToCSV()` - 导出 CSV
- `parseCSV()` - 解析 CSV 文件

### 数据存储
- 使用 LocalStorage，key: `waitlist_data`
- 数据结构: `{ entries: [] }`
- 每条 entry 包含完整字段 + id (UUID) + 候补创建时间 + 状态 + 已递补至

## 如何运行

### 开发模式
```bash
cd /Users/chenquanda/.qclaw/workspace-ua58rsb93veqtxl7/waitlist-manager
npm run dev
```
访问: http://localhost:5173

### 生产构建
```bash
npm run build
npm run preview  # 预览构建结果
```

## 待完善的功能
根据 PRD 的 Open Questions，以下功能可后续扩展：
1. 撤销递补操作（当前未实现）
2. 手动添加空演出卡片
3. 更完善的拖拽交互（当前是拖拽到顶部区域）
4. 多端同步（需引入后端 + 数据库）

## 测试建议
1. 测试去重：尝试添加重复的工号+演出+城市+日期组合
2. 测试递补：拖拽候补记录到剧目卡片，确认自动清理逻辑
3. 测试导入：准备 CSV 文件，验证批量导入和去重报告
4. 测试导出：导出不同范围的 CSV，用 Excel 打开验证编码
5. 测试筛选和排序：输入筛选条件，点击列头排序

---

**项目路径**: `/Users/chenquanda/.qclaw/workspace-ua58rsb93veqtxl7/waitlist-manager`
**开发服务器**: 正在运行，http://localhost:5173
**构建状态**: ✅ 成功（43 modules transformed, built in 102ms）
