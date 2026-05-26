import { useState } from 'react';

function ShowCards({ entries, showCombinations, deletedShows, showIds, onShowIdChange, onAssign, onBatchAssign, isFirstChoiceMode }) {
  const [expandedShows, setExpandedShows] = useState(new Set());
  const [dragOverKey, setDragOverKey] = useState(null);

  const toggleExpand = (showKey) => {
    const newSet = new Set(expandedShows);
    if (newSet.has(showKey)) {
      newSet.delete(showKey);
    } else {
      newSet.add(showKey);
    }
    setExpandedShows(newSet);
  };

  // 第一志愿模式下，只统计筛选后 entries 中的数据
  const displayEntries = isFirstChoiceMode ? entries : null;

  const getAssignedEntries = (show) => {
    const showKey = `${show.演出名称}|${show.城市}|${show.候补日期}`;
    const sourceEntries = displayEntries || entries;
    return sourceEntries.filter(
      (e) => e.状态 === '已递补' && e.已递补至 === showKey
    );
  };

  const getWaitingCount = (show) => {
    const showKey = `${show.演出名称}|${show.城市}|${show.候补日期}`;
    const sourceEntries = displayEntries || entries;
    return sourceEntries.filter(
      (e) => e.状态 === '候补中' && `${e.演出名称}|${e.城市}|${e.候补日期}` === showKey
    ).length;
  };

  // 拖拽处理
  const handleDragOver = (e, showKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverKey(showKey);
  };

  const handleDragLeave = () => {
    setDragOverKey(null);
  };

  const handleDrop = (e, show) => {
    e.preventDefault();
    setDragOverKey(null);
    
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
      if (entriesToAssign.some(e => !e || !e.id || e.状态 !== '候补中')) return;

      // 校验：剧目一致性
      const mismatched = entriesToAssign.filter(entryData => {
        const originalShow = `${entryData.演出名称}|${entryData.城市}|${entryData.候补日期}`;
        const targetShow = `${show.演出名称}|${show.城市}|${show.候补日期}`;
        return originalShow !== targetShow;
      });
      if (mismatched.length > 0) {
        const sample = mismatched[0];
        alert(
          `❌ 剧目不匹配（${mismatched.length} 条记录）\n\n` +
          `该候补记录属于：\n🎭 ${sample.演出名称}\n📍 ${sample.城市} · ${sample.候补日期}\n\n` +
          `您拖拽到的剧目：\n🎭 ${show.演出名称}\n📍 ${show.城市} · ${show.候补日期}\n\n` +
          `请将记录拖拽到其对应的剧目区域完成递补。`
        );
        return;
      }

      const idList = entriesToAssign.map(e => e.工号).join('、');
      const confirmed = window.confirm(
        `确认将以下 ${entriesToAssign.length} 人递补至\n\n` +
        `🎭 ${show.演出名称}\n📍 ${show.城市} · ${show.候补日期}\n\n` +
        `工号：${idList}\n\n` +
        `⚠️ 递补后这些人员的其他候补记录将被取消`
      );

      if (confirmed && onAssign) {
        if (onBatchAssign && entriesToAssign.length > 1) {
          onBatchAssign(entriesToAssign.map(e => e.id), show);
        } else {
          entriesToAssign.forEach(entryData => {
            onAssign(entryData.id, show);
          });
        }
      }
    } catch (err) {
      console.error('拖拽解析失败:', err);
    }
  };

  if (showCombinations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎭</div>
        <p className="text-sm">暂无剧目数据</p>
        <p className="text-xs mt-1">添加候补记录后将自动显示</p>
      </div>
    );
  }

  return (
    <>
      {/* 剧目卡片列表 */}
      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {isFirstChoiceMode && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-sm">✦</span>
            <span className="text-xs font-medium text-purple-700">第一志愿模式 — 统计数据已按筛选结果更新</span>
          </div>
        )}

        {showCombinations.map((show, index) => {
          const showKey = `${show.演出名称}|${show.城市}|${show.候补日期}`;
          const assignedEntries = getAssignedEntries(show);
          const waitingCount = getWaitingCount(show);
          const isExpanded = expandedShows.has(showKey);
          const isDragOver = dragOverKey === showKey;
          const isDeleted = deletedShows ? deletedShows.has(showKey) : false;

          return (
            <div
              key={index}
              onDragOver={(e) => handleDragOver(e, showKey)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, show)}
              className={`group show-card bg-white rounded-xl border overflow-hidden transition-all ${
                isDragOver 
                  ? 'border-blue-400 border-2 shadow-lg shadow-blue-500/20 scale-[1.02] bg-blue-50/50' 
                  : isDeleted
                    ? 'border-red-200 bg-red-50/50 opacity-70'
                    : 'border-gray-100'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(showKey)}
                className="p-4 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-800 truncate pr-2">
                        {show.演出名称}
                        {isDeleted && (
                          <span className="ml-2 text-xs font-normal text-red-500 bg-red-100 px-1.5 py-0.5 rounded">已删除</span>
                        )}
                      </h3>
                      <input
                        type="text"
                        placeholder="剧目ID"
                        value={showIds[showKey] || ''}
                        onChange={(e) => onShowIdChange(showKey, e.target.value)}
                        className="ml-auto px-2 py-1 text-xs border border-gray-200 rounded-lg w-24 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>📍</span> {show.城市}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <span>📅</span> {show.候补日期}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className={`p-1.5 rounded-lg transition-all ${
                        isExpanded ? 'bg-blue-50 text-blue-600 rotate-180' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                    <span className="text-amber-600 text-xs font-medium">候补中</span>
                    <span className="text-amber-700 font-bold">{waitingCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-600 text-xs font-medium">已递补</span>
                    <span className="text-emerald-700 font-bold">{assignedEntries.length}</span>
                  </div>
                </div>

                {/* Drop Hint */}
                {isDragOver && (
                  <div className="mt-3 py-2 text-center text-sm font-medium text-blue-600 bg-blue-100/50 rounded-lg border border-blue-200">
                    松开鼠标完成递补
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      已递补人员 ({assignedEntries.length})
                    </h4>
                    {assignedEntries.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        <span className="block text-2xl mb-2">👤</span>
                        暂无递补人员
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-100 gap-2"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {entry.工号.slice(0, 2)}
                              </div>
                              <div className="min-w-0 flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 truncate">{entry.工号}</span>
                                <span className="status-badge status-assigned flex-shrink-0">
                                  已递补
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {entry.递补时间 ? new Date(entry.递补时间).toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ShowCards;
