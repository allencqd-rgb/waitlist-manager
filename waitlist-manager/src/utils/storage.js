// LocalStorage 工具函数
const STORAGE_KEY = 'waitlist_data';
const DELETED_SHOWS_KEY = 'waitlist_deleted_shows';
const SHOW_IDS_KEY = 'waitlist_show_ids'; // 剧目ID映射：{ "演出|城市|日期": "剧目ID" }

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { entries: [], shows: [] };
  } catch (error) {
    console.error('Failed to load data from LocalStorage:', error);
    return { entries: [], shows: [] };
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save data to LocalStorage:', error);
    return false;
  }
};

export const loadDeletedShows = () => {
  try {
    const raw = localStorage.getItem(DELETED_SHOWS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

export const saveDeletedShows = (set) => {
  try {
    localStorage.setItem(DELETED_SHOWS_KEY, JSON.stringify([...set]));
  } catch (error) {
    console.error('Failed to save deleted shows:', error);
  }
};

export const clearDeletedShows = () => {
  localStorage.removeItem(DELETED_SHOWS_KEY);
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  clearDeletedShows();
  clearShowIds();
};

// 剧目ID映射读写
export const loadShowIds = () => {
  try {
    const raw = localStorage.getItem(SHOW_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveShowIds = (map) => {
  try {
    localStorage.setItem(SHOW_IDS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save show IDs:', error);
  }
};

export const clearShowIds = () => {
  localStorage.removeItem(SHOW_IDS_KEY);
};
