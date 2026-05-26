import { v4 as uuidv4 } from 'uuid';

// 生成唯一ID
export const generateId = () => uuidv4();

// 检查是否为重复候补（工号+演出名称+城市+候补日期）
export const isDuplicate = (entries, newEntry) => {
  return entries.some(
    (entry) =>
      entry.工号 === newEntry.工号 &&
      entry.演出名称 === newEntry.演出名称 &&
      entry.城市 === newEntry.城市 &&
      entry.候补日期 === newEntry.候补日期 &&
      entry.状态 !== '已取消'
  );
};

// 创建新候补记录
export const createWaitlistEntry = (entryData) => {
  return {
    id: generateId(),
    ...entryData,
    候补创建时间: entryData.候补时间 || entryData.候补创建时间 || new Date().toISOString(),
    状态: '候补中',
    已递补至: null,
  };
};

// 获取所有演出+日期组合
export const getShowCombinations = (entries) => {
  const combinations = new Map();
  
  entries.forEach((entry) => {
    const key = `${entry.演出名称}|${entry.城市}|${entry.候补日期}`;
    if (!combinations.has(key)) {
      combinations.set(key, {
        演出名称: entry.演出名称,
        城市: entry.城市,
        候补日期: entry.候补日期,
        候补人数: 0,
        已递补人数: 0,
      });
    }
    
    const combo = combinations.get(key);
    if (entry.状态 !== '已递补') {
      combo.候补人数 += 1;
    }
  });
  
  // 统计已递补人数（被递补到该剧目的记录）
  entries.forEach((entry) => {
    if (entry.状态 === '已递补' && entry.已递补至) {
      const [演出名称, 城市, 候补日期] = entry.已递补至.split('|');
      const key = `${演出名称}|${城市}|${候补日期}`;
      if (combinations.has(key)) {
        combinations.get(key).已递补人数 += 1;
      } else {
        // 该剧目的所有候补都已递补，仍需显示卡片
        combinations.set(key, {
          演出名称,
          城市,
          候补日期,
          候补人数: 0,
          已递补人数: 1,
        });
      }
    }
  });
  
  return Array.from(combinations.values());
};

// 执行递补操作
export const performAssignment = (entries, entryId, showInfo) => {
  const updatedEntries = [...entries];
  const entryIndex = updatedEntries.findIndex((e) => e.id === entryId);
  
  if (entryIndex === -1) return updatedEntries;
  
  const entry = updatedEntries[entryIndex];
  const targetShow = `${showInfo.演出名称}|${showInfo.城市}|${showInfo.候补日期}`;
  
  // 1. 更新该条记录状态为已递补
  updatedEntries[entryIndex] = {
    ...entry,
    状态: '已递补',
    已递补至: targetShow,
    递补时间: new Date().toISOString(),
  };
  
  // 2. 删除该人员（相同工号）的所有其他候补记录
  const 工号 = entry.工号;
  for (let i = updatedEntries.length - 1; i >= 0; i--) {
    if (updatedEntries[i].工号 === 工号 && updatedEntries[i].id !== entryId) {
      updatedEntries[i] = {
        ...updatedEntries[i],
        状态: '已取消',
        已递补至: `同一人员已递补至[${entry.工号}]${targetShow}`,
      };
    }
  }
  
  return updatedEntries;
};

// 导出为CSV
export const exportToCSV = (entries, showIds = {}, type = 'all') => {
  let filteredEntries = entries;
  
  if (type === '候补中') {
    filteredEntries = entries.filter((e) => e.状态 === '候补中');
  } else if (type === '已递补') {
    filteredEntries = entries.filter((e) => e.状态 === '已递补');
  } else if (type === 'firstChoice') {
    // 取第一志愿：每个工号保留最早的一条候补记录
    const empMap = new Map();
    const sortedByTime = [...entries]
      .filter(e => e.状态 === '候补中')
      .sort((a, b) => new Date(a.候补创建时间 || 0) - new Date(b.候补创建时间 || 0));
    sortedByTime.forEach(e => {
      if (!empMap.has(e.工号)) {
        empMap.set(e.工号, e);
      }
    });
    filteredEntries = Array.from(empMap.values());
  }
  
  const headers = ['工号', '演出名称', '城市', '候补日期', '状态', '已递补至', '候补创建时间'];
  // 导出时将列名显示为"候补时间"
  const displayHeaders = ['工号', '演出名称', '城市', '候补日期', '状态', '已递补至', '候补时间', '剧目ID'];
  const csvRows = [
    displayHeaders.join(','),
    ...filteredEntries.map((entry) => {
      // 计算剧目key
      let showKey = '';
      if (entry.状态 === '已递补' && entry.已递补至) {
        showKey = entry.已递补至;
      } else {
        showKey = `${entry.演出名称}|${entry.城市}|${entry.候补日期}`;
      }
      const 剧目ID = showIds[showKey] || '';
      const rowValues = headers.map((header) => {
        const value = entry[header] || '';
        return `"${value}"`;
      });
      rowValues.push(`"${剧目ID}"`);
      return rowValues.join(',');
    }),
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `候补管理_${type}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 解析CSV
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      
      const entries = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        return entry;
      });
      
      resolve(entries);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
