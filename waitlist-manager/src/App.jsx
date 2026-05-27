import { useState, useEffect } from 'react';
import { loadData, saveData, clearData, loadDeletedShows, saveDeletedShows, loadShowIds, saveShowIds } from './utils/storage';
import { isDuplicate, createWaitlistEntry, getShowCombinations, performAssignment, exportToCSV, parseCSV } from './utils/waitlist';
import WaitlistTable from './components/WaitlistTable';
import ShowCards from './components/ShowCards';
import AddEntryModal from './components/AddEntryModal';
import ImportModal from './components/ImportModal';
import OrderRemoveModal from './components/OrderRemoveModal';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showOrderRemoveModal, setShowOrderRemoveModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '候补创建时间', direction: 'asc' });
  const [filter, setFilter] = useState({ 演出名称: '', 城市: '', 状态: '' });
  const [activeTab, setActiveTab] = useState('all'); // all | waiting | assigned
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [firstChoiceMode, setFirstChoiceMode] = useState(false); // 取第一志愿模式
  const [deletedShows, setDeletedShows] = useState(() => loadDeletedShows()); // 已删除剧目
  const [showIds, setShowIds] = useState(() => loadShowIds()); // 剧目ID映射

  // 保存剧目ID
  const handleShowIdChange = (showKey, showId) => {
    const newShowIds = { ...showIds };
    if (showId) {
      newShowIds[showKey] = showId;
    } else {
      delete newShowIds[showKey];
    }
    setShowIds(newShowIds);
    saveShowIds(newShowIds);
  };

  // 保存数据到 LocalStorage
  const saveEntries = (newEntries) => {
    setEntries(newEntries);
    saveData({ entries: newEntries });
  };

  // 清除所有数据
  const handleClear = () => {
    if (window.confirm('确认清除所有数据？此操作不可撤销！')) {
      clearData();
      setEntries([]);
      setDeletedShows(new Set());
    }
  };

  // 添加候补记录
  const handleAddEntry = (entryData) => {
    if (isDuplicate(entries, entryData)) {
      alert('该候补记录已存在（工号+演出名称+城市+候补日期 重复）');
      return false;
    }
    const newEntry = createWaitlistEntry(entryData);
    const newEntries = [...entries, newEntry];
    saveEntries(newEntries);
    return true;
  };

  // 执行递补（单条）
  const handleAssign = (entryId, showInfo) => {
    const newEntries = performAssignment(entries, entryId, showInfo);
    saveEntries(newEntries);
  };

  // 批量递补
  const handleBatchAssign = (entryIds, showInfo) => {
    let current = entries;
    entryIds.forEach(id => {
      current = performAssignment(current, id, showInfo);
    });
    saveEntries(current);
  };

  // 导出 CSV
  const handleExport = (type) => {
    exportToCSV(entries, showIds, type);
    setShowExportMenu(false);
  };

  // 删除剧目（删除候补中记录，标记剧目为已删除，保留已递补记录）
  const handleDeleteShow = (show) => {
    const showKey = `${show.演出名称}|${show.城市}|${show.候补日期}`;
    // 只删除「候补中」的记录，已递补的保留
    const newEntries = entries.filter(
      (e) => !(
        `${e.演出名称}|${e.城市}|${e.候补日期}` === showKey &&
        e.状态 === '候补中'
      )
    );
    // 标记该剧目为已删除
    const newDeletedShows = new Set([...deletedShows, showKey]);
    setDeletedShows(newDeletedShows);
    saveDeletedShows(newDeletedShows);
    saveEntries(newEntries);
  };

  // 订单删除（按工号批量删除）
  const handleOrderRemove = (empIds) => {
    const idSet = new Set(empIds.map(id => String(id).trim()));
    const beforeCount = entries.length;
    const newEntries = entries.filter((entry) => !idSet.has(String(entry.工号).trim()));
    const removedCount = beforeCount - newEntries.length;
    saveEntries(newEntries);
    alert(`删除完成：共移除 ${removedCount} 条候补记录（匹配 ${idSet.size} 个工号）`);
  };

  // 导入 CSV
  const handleImport = async (file) => {
    try {
      const importedEntries = await parseCSV(file);
      let addedCount = 0;
      let duplicateCount = 0;
      const newEntries = [...entries];
      importedEntries.forEach((entryData) => {
        if (isDuplicate(newEntries, entryData)) {
          duplicateCount += 1;
        } else {
          const newEntry = createWaitlistEntry(entryData);
          newEntries.push(newEntry);
          addedCount += 1;
        }
      });
      saveEntries(newEntries);
      alert(`导入完成：成功 ${addedCount} 条，跳过重复 ${duplicateCount} 条`);
    } catch (error) {
      alert('导入失败：' + error.message);
    }
  };

  // 排序
  const sortedEntries = [...entries].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 筛选
  let filteredEntries = sortedEntries.filter((entry) => {
    if (filter.演出名称 && !entry.演出名称.includes(filter.演出名称)) return false;
    if (filter.城市 && !entry.城市.includes(filter.城市)) return false;
    if (filter.状态 === 'waiting' && entry.状态 !== '候补中') return false;
    if (filter.状态 === 'assigned' && entry.状态 !== '已递补') return false;
    return true;
  });

  // 取第一志愿：每个工号只保留最早的一条候补记录
  const firstChoiceEntries = firstChoiceMode ? (() => {
    const empMap = new Map();
    // 按候补创建时间排序，最早的先入 map，后面同工号的被跳过
    const sortedByTime = [...filteredEntries]
      .filter(e => e.状态 === '候补中')
      .sort((a, b) => new Date(a.候补创建时间 || 0) - new Date(b.候补创建时间 || 0));
    sortedByTime.forEach(e => {
      if (!empMap.has(e.工号)) {
        empMap.set(e.工号, e);
      }
    });
    // 已递补记录不受第一志愿筛选影响，全部保留
    const assignedEntries = filteredEntries.filter(e => e.状态 === '已递补');
    return [...Array.from(empMap.values()), ...assignedEntries];
  })() : null;

  // 最终展示数据
  const displayEntries = firstChoiceMode ? firstChoiceEntries : filteredEntries;

  // 左侧表格用的剧目列表（排除已删除的）
  const showCombinations = getShowCombinations(entries).filter(
    s => !deletedShows.has(`${s.演出名称}|${s.城市}|${s.候补日期}`)
  );

  // 右侧卡片用的剧目列表（包含已删除剧目，确保卡片始终可见）
  const allShowCombinations = (() => {
    const combos = getShowCombinations(entries);
    // 补充已删除但已无任何记录的剧目（从 deletedShows 中恢复）
    deletedShows.forEach(key => {
      if (!combos.some(c => `${c.演出名称}|${c.城市}|${c.候补日期}` === key)) {
        const [演出名称, 城市, 候补日期] = key.split('|');
        combos.push({ 演出名称, 城市, 候补日期 });
      }
    });
    return combos;
  })();

  // 统计数据
  const stats = {
    total: entries.length,
    waiting: entries.filter(e => e.状态 === '候补中').length,
    assigned: entries.filter(e => e.状态 === '已递补').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-lg">🎭</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">演出候补递补管理系统</h1>
                <p className="text-xs text-gray-400">拖拽 · 管理 · 实时同步</p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                总计 <span className="text-gray-900 font-bold">{stats.total}</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-50 rounded-full text-xs font-medium text-amber-700">
                候补中 <span className="font-bold">{stats.waiting}</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 rounded-full text-xs font-medium text-emerald-700">
                已递补 <span className="font-bold">{stats.assigned}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/25 transition-all hover:shadow-lg"
              >
                <span>＋</span> 添加记录
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                📥 导入
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  📤 导出 ▾
                </button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <button onClick={() => handleExport('all')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> 导出全部记录
                      </button>
                      <button onClick={() => handleExport('候补中')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> 导出候补名单
                      </button>
                      <button onClick={() => handleExport('已递补')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 导出已递补记录
                      </button>
                      {firstChoiceMode && (
                        <button onClick={() => handleExport('firstChoice')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span> 导出第一志愿结果
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowOrderRemoveModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-all"
              >
                📋 订单删除
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="清除所有数据"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Filter & Tab Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {[
                { key: 'all', label: '全部', icon: '📋' },
                { key: 'waiting', label: '候补中', icon: '⏳' },
                { key: 'assigned', label: '已递补', icon: '✅' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter({ ...filter, 状态: tab.key === 'all' ? '' : tab.key })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    (tab.key === 'all' && !filter.状态) || filter.状态 === tab.key
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab.key === 'all' ? 'bg-gray-200 text-gray-600' :
                    tab.key === 'waiting' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {tab.key === 'all' ? stats.total : tab.key === 'waiting' ? stats.waiting : stats.assigned}
                  </span>
                </button>
              ))}
            </div>

            {/* 第一志愿切换 */}
            <button
              onClick={() => setFirstChoiceMode(!firstChoiceMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                firstChoiceMode
                  ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-sm'
                  : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100'
              }`}
            >
              <span>{firstChoiceMode ? '✦' : '○'}</span>
              取第一志愿
              {firstChoiceMode && (
                <span className="ml-1 text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                  {displayEntries.length}
                </span>
              )}
            </button>

            {/* Search Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="搜索演出名称..."
                  value={filter.演出名称}
                  onChange={(e) => setFilter({ ...filter, 演出名称: e.target.value })}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48 transition-all"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="筛选城市..."
                  value={filter.城市}
                  onChange={(e) => setFilter({ ...filter, 城市: e.target.value })}
                  className="pl-4 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-32 transition-all"
                />
                {(filter.演出名称 || filter.城市) && (
                  <button
                    onClick={() => setFilter({ 演出名称: '', 城市: '', 状态: filter.状态 })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >✕</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Waitlist Table (3 cols) */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-800">📝 候补名单</h2>
                <p className="text-xs text-gray-400 mt-0.5">拖拽行到右侧剧目卡片完成递补</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                共 {displayEntries.length} 条{firstChoiceMode ? '（第一志愿）' : ''}
              </span>
            </div>
            <div className="p-6 pt-2">
              <WaitlistTable
                entries={displayEntries}
                sortConfig={sortConfig}
                onSort={setSortConfig}
                onAssign={handleAssign}
                onBatchAssign={handleBatchAssign}
                showCombinations={showCombinations}
                isFirstChoiceMode={firstChoiceMode}
                onDeleteShow={handleDeleteShow}
              />
            </div>
          </div>

          {/* Right: Show Cards (2 cols) */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-800">🎬 剧目卡片</h2>
                <p className="text-xs text-gray-400 mt-0.5">点击展开查看已递补人员</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {showCombinations.length} 个剧目{firstChoiceMode ? ' · 第一志愿' : ''}
              </span>
            </div>
            <div className="p-6 pt-2">
              <ShowCards
                entries={entries}
                showCombinations={allShowCombinations}
                deletedShows={deletedShows}
                onAssign={handleAssign}
                onBatchAssign={handleBatchAssign}
                showIds={showIds}
                onShowIdChange={handleShowIdChange}
                isFirstChoiceMode={firstChoiceMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEntryModal
          onAdd={handleAddEntry}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showImportModal && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
      {showOrderRemoveModal && (
        <OrderRemoveModal
          onRemove={handleOrderRemove}
          onClose={() => setShowOrderRemoveModal(false)}
        />
      )}
    </div>
  );
}

export default App;
