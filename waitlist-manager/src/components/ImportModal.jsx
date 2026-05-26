import { useState, useRef } from 'react';

function ImportModal({ onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('请选择 CSV 格式的文件');
      setFile(null);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }
    onImport(file);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
            <h3 className="text-lg font-semibold text-gray-800">导入 CSV 文件</h3>
            <p className="text-xs text-gray-400 mt-0.5">批量导入候补记录</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            ✕
          </button>
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
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50/50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 underline"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  点击选择或拖拽 CSV 文件到此处
                </p>
                <p className="text-xs text-gray-400">支持 .csv 格式文件</p>
              </div>
            )}
          </div>

          {/* Format Guide */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-500">📋</span>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                CSV 格式示例
              </span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <code className="text-xs text-green-400 font-mono whitespace-pre">
{`工号,演出名称,城市,候补日期,候补创建时间
A001,星际穿越,上海,2026-06-01,2026-05-20 09:00:00
A002,周杰伦演唱会,北京,2026-06-05,2026-05-21 10:30:00`}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 候补创建时间可选，不填则自动使用导入时间
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!file}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                file
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md shadow-green-500/25'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              开始导入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
