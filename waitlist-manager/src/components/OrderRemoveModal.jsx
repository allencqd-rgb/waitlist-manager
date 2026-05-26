import { useState, useRef } from 'react';

function OrderRemoveModal({ onRemove, onClose }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
      setError('请选择 CSV 或 TXT 格式的文件');
      setFile(null);
      setPreview([]);
      return;
    }

    setFile(selectedFile);
    setError('');

    // 预览：解析文件中的工号
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line) => line.trim());
      
      // 解析工号列（支持带表头或纯工号列表）
      const ids = [];
      lines.forEach((line, idx) => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        // 如果第一行是"工号"则跳过
        if (idx === 0 && (vals[0] === '工号' || vals[0].toLowerCase() === 'empid' || vals[0].toLowerCase() === 'id')) return;
        if (vals[0]) ids.push(vals[0]);
      });
      setPreview(ids);
    };
    reader.readAsText(selectedFile);
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file || preview.length === 0) {
      setError('文件中没有有效的工号数据');
      return;
    }
    onRemove(preview);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 modal-content overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">📋 订单删除</h3>
            <p className="text-xs text-gray-400 mt-0.5">上传包含工号的文件，批量删除系统中的候补记录</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">✕</button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-blue-500 bg-blue-50' :
              file ? 'border-green-400 bg-green-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleInputChange} className="hidden" />
            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center"><span className="text-2xl">📄</span></div>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · 包含 <strong>{preview.length}</strong> 个工号</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview([]); }} className="text-xs text-red-500 hover:text-red-600 underline">重新选择</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center"><span className="text-2xl">📁</span></div>
                <p className="text-sm font-medium text-gray-700">点击选择或拖拽文件到此处</p>
                <p className="text-xs text-gray-400">支持 .csv / .txt 格式，第一列为工号</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-red-600 uppercase tracking-wider">⚠️ 即将删除以下工号的所有候补记录</span>
                <span className="text-xs font-bold text-red-600">{preview.length} 条</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {preview.map((id, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    <span className="font-mono text-gray-700 truncate">{id}</span>
                  </div>
                ))}
                {preview.length > 10 && <p className="text-xs text-gray-400 text-center py-1">... 还有 {preview.length - 10} 条</p>}
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span>📋</span><span className="text-xs font-medium text-gray-600 uppercase tracking-wider">文件格式示例</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <code className="text-xs text-green-400 font-mono whitespace-pre">{`# 方式一：带表头
工号
A001
A002
15152876935

# 方式二：纯工号列表（每行一个）
A001
A002`}</code>
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 文件中匹配到的工号将从系统中删除所有相关候补记录</p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-secondary">取消</button>
            <button
              onClick={handleSubmit}
              disabled={!file || preview.length === 0}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                file && preview.length > 0
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-500/25'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              🗑️ 确认删除 ({preview.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderRemoveModal;