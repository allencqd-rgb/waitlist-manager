import { useState } from 'react';

function AddEntryModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    工号: '',
    演出名称: '',
    城市: '',
    候补日期: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requiredFields = ['工号', '演出名称', '城市', '候补日期'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`请填写${field}`);
        return;
      }
    }

    setIsSubmitting(true);
    const success = onAdd(formData);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  // 点击背景关闭
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 modal-content overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">添加候补记录</h3>
            <p className="text-xs text-gray-400 mt-0.5">录入新的候补申请</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              工号 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="工号"
              value={formData.工号}
              onChange={handleChange}
              placeholder="请输入工号"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              演出名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="演出名称"
              value={formData.演出名称}
              onChange={handleChange}
              placeholder="请输入演出名称"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                城市 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="城市"
                value={formData.城市}
                onChange={handleChange}
                placeholder="如：上海"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                候补日期 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="候补日期"
                value={formData.候补日期}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> 添加中...
                </>
              ) : (
                <>添加记录</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEntryModal;
