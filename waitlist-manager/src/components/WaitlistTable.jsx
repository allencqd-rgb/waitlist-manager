import { useState } from 'react';

function WaitlistTable({ entries, sortConfig, onSort, onAssign, onBatchAssign, showCombinations, isFirstChoiceMode, onDeleteShow }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverShowIndex, setDragOverShowIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, show: null });

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allIds = waitingEntries.map(e => e.id);
    if (selectedIds.size === allIds.length && allIds.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const handleSort = (key) => {
    onSort({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleDragStart = (e, entry) => {
    // 收集选中的记录；如果当前行未选中，则仅拖拽当前行
    let dragEntries;
    if (selectedIds.has(entry.id)) {
      dragEntries = waitingEntries.filter(e => selectedIds.has(e.id) && e.状态 === '候补中');
    } else {
      dragEntries = [entry];
    }
    const json = JSON.stringify(dragEntries);
    e.dataTransfer.setData('application/json', json);
    e.dataTransfer.setData('text/plain', json);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(entry.id);
    // 自定义拖拽图像显示数量
    if (dragEntries.length > 1) {
      const ghost = document.createElement('div');
      ghost.textContent = `${dragEntries.length} 条记录`;
      ghost.style.cssText = 'position:absolute;top:-1000px;padding:8px 16px;background:#1e40af;color:#fff;border-radius:8px;font-size:14px;font-weight:600;';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    setDragOverShowIndex(null);
  };

  const handleDragOver = (e, entryId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(entryId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDropOnShow = (e, showInfo) => {
    e.preventDefault();
    setDragOverShowIndex(null);
    try {
      let rawData = e.dataTransfer.getData('application/json');
      if (!rawData) {
        rawData = e.dataTransfer.getData('text/plain');
      }
      if (!rawData) return;

      // 兼容：单条（对象）或多条（数组）
      const parsed = JSON.parse(rawData);
      const entriesToAssign = Array.isArray(parsed) ? parsed : [parsed];

      if (entriesToAssign.length === 0) return;

      // 校验：所有记录必须是候补中
      const invalidEntries = entriesToAssign.filter(e => !e || !e.id || e.状态 !== '候补中');
      if (invalidEntries.length > 0) return;

      // 校验：剧目一致性
      const mismatched = entriesToAssign.filter(entry => {
        const originalShow = `${entry.演出名称}|${entry.城市}|${entry.候补日期}`;
        const targetShow = `${showInfo.演出名称}|${showInfo.城市}|${showInfo.候补日期}`;
        return originalShow !== targetShow;
      });
      if (mismatched.length > 0) {
        const sample = mismatched[0];
        alert(
          `❌ 剧目不匹配（${mismatched.length} 条记录）\n\n` +
          `该候补记录属于：\n🎭 ${sample.演出名称}\n📍 ${sample.城市} · ${sample.候补日期}\n\n` +
          `您拖拽到的剧目：\n🎭 ${showInfo.演出名称}\n📍 ${showInfo.城市} · ${showInfo.候补日期}\n\n` +
          `请将记录拖拽到其对应的剧目区域完成递补。`
        );
        return;
      }

      const idList = entriesToAssign.map(e => e.工号).join('、');
      const confirmed = window.confirm(
        `确认将以下 ${entriesToAssign.length} 人递补至\n\n` +
        `🎭 ${showInfo.演出名称}\n📍 ${showInfo.城市} · ${showInfo.候补日期}\n\n` +
        `工号：${idList}\n\n` +
        `⚠️ 递补后这些人员的其他候补记录将被取消`
      );

      if (confirmed) {
        if (onBatchAssign && entriesToAssign.length > 1) {
          onBatchAssign(entriesToAssign.map(e => e.id), showInfo);
        } else {
          entriesToAssign.forEach(entryData => {
            onAssign(entryData.id, showInfo);
          });
        }
        setSelectedIds(new Set());
      }
    } catch (err) {
      alert('拖拽解析失败：' + err.message);
    }
  };

  // 右键菜单
  const handleContextMenu = (e, show) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, show });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, show: null });
  };

  const handleDeleteShow = () => {
    if (!contextMenu.show || !onDeleteShow) return;
    const show = contextMenu.show;
    const confirmed = window.confirm(
      `⚠️ 确认删除以下剧目？\n\n` +
      `🎭 ${show.演出名称}\n` +
      `📍 ${show.城市} · 📅 ${show.候补日期}\n\n` +
      `此操作不可撤销！`
    );
    if (confirmed) {
      onDeleteShow(show);
    }
    closeContextMenu();
  };

  const headers = [
    { key: '_checkbox', label: '', width: 'w-10', sortable: false },
    { key: '工号', label: '工号', width: 'w-24' },
    { key: '演出名称', label: '演出名称', width: 'w-40' },
    { key: '城市', label: '城市', width: 'w-20' },
    { key: '候补日期', label: '候补日期', width: 'w-24' },
    { key: '状态', label: '状态', width: 'w-20' },
    { key: '候补创建时间', label: '候补时间', width: 'w-32' },
    // { key: '递补时间', label: '递补时间', width: 'w-32' },
  ];

  const waitingEntries = entries.filter((e) => e.状态 === '候补中');

  // 选中计数（仅统计当前可见的候补中记录）
  const visibleSelectedCount = [...selectedIds].filter(id => waitingEntries.some(e => e.id === id)).length;

  return (
    <div className="space-y-4">
      {/* 第一志愿模式提示 */}
      {isFirstChoiceMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">✦</span>
          <div>
            <span className="text-sm font-semibold text-purple-800">第一志愿模式</span>
            <span className="text-sm text-purple-600 ml-2">已筛选每个工号最早的一条候补记录，工号唯一</span>
          </div>
          <span className="ml-auto text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            共 {entries.length} 人
          </span>
        </div>
      )}

      {/* Drop Zones for Shows */}
      {showCombinations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-600">🎯</span>
            <span className="text-sm font-medium text-blue-800">拖拽候补记录到右侧区域完成递补</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {showCombinations.map((show, index) => (
              <div
                key={index}
                onDrop={(e) => handleDropOnShow(e, show)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverShowIndex(index);
                }}
                onDragLeave={() => setDragOverShowIndex(null)}
                onContextMenu={(e) => handleContextMenu(e, show)}
                className={`drop-zone px-4 py-2.5 rounded-xl cursor-pointer border-2 border-dashed text-sm font-medium transition-all ${
                  dragOverShowIndex === index
                    ? 'drop-zone-active'
                    : 'bg-white/80 border-blue-200 text-blue-700 hover:bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <span className="mr-1.5">🎭</span>
                {show.演出名称}
                <span className="mx-1.5 text-blue-400">·</span>
                {show.城市}
                <span className="mx-1.5 text-blue-400">·</span>
                {show.候补日期}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu.visible && contextMenu.show && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={closeContextMenu} />
          <div
            className="fixed z-[100] bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-800 truncate">{contextMenu.show.演出名称}</p>
              <p className="text-[10px] text-gray-400">{contextMenu.show.城市} · {contextMenu.show.候补日期}</p>
            </div>
            <button
              onClick={handleDeleteShow}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除该剧目及所有候补记录
            </button>
          </div>
        </>
      )}

      {/* 选中计数浮动条 */}
      {visibleSelectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
          <span className="text-sm font-medium">已选择 <span className="text-blue-400 font-bold text-lg">{visibleSelectedCount}</span> 条记录</span>
          <span className="text-gray-500">|</span>
          <span className="text-xs text-gray-400">拖拽任一选中行到剧目卡片即可批量递补</span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-gray-400 hover:text-white transition-colors ml-1"
          >✕ 清除选择</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {headers.map((header) => (
                <th
                  key={header.key}
                  onClick={() => header.sortable !== false && handleSort(header.key)}
                  className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${header.sortable !== false ? 'cursor-pointer hover:text-gray-700 hover:bg-gray-50/50' : ''} transition-colors ${header.width}`}
                >
                  {header.key === '_checkbox' ? (
                    <input
                      type="checkbox"
                      checked={waitingEntries.length > 0 && selectedIds.size === waitingEntries.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      {header.label}
                      {sortConfig.key === header.key && (
                        <span className="text-blue-500">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {waitingEntries.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p className="text-sm">暂无候补记录</p>
                    <p className="text-xs mt-1">点击上方「添加记录」开始录入</p>
                  </div>
                </td>
              </tr>
            ) : (
              waitingEntries.map((entry) => (
                <tr
                  key={entry.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entry)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, entry.id)}
                  onDragLeave={handleDragLeave}
                  className={`table-row border-b border-gray-50 ${
                    draggingId === entry.id ? 'dragging' : ''
                  } ${dragOverId === entry.id ? 'drag-over' : ''}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className={`flex items-center gap-2 ${selectedIds.has(entry.id) ? 'bg-blue-50 -mx-3 px-3 rounded-lg' : ''}`}>
                      <span className="text-gray-400 cursor-grab">⋮⋮</span>
                      <span className="font-medium text-gray-700">{entry.工号}</span>
                      {selectedIds.size > 1 && selectedIds.has(entry.id) && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">已选</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-gray-800 font-medium">{entry.演出名称}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-gray-600">{entry.城市}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-gray-600">{entry.候补日期}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="status-badge status-waiting">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      候补中
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">
                    {new Date(entry.候补创建时间).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WaitlistTable;
