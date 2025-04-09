// components/ConfirmDialog.jsx
const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmDialog;
  