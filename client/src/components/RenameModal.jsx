import { useEffect, useRef } from "react";
import { FaFolder, FaFileAlt } from "react-icons/fa";

function RenameModal({
  renameType,
  renameValue,
  setRenameValue,
  onClose,
  onRenameSubmit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              renameType === "folder"
                ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {renameType === "folder" ? (
              <FaFolder className="text-xl" />
            ) : (
              <FaFileAlt className="text-xl" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Rename {renameType === "folder" ? "Folder" : "File"}
            </h2>

            <p className="text-sm text-neutral-500">
              Enter a new name below.
            </p>
          </div>
        </div>

        <form onSubmit={onRenameSubmit} className="space-y-6">
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Enter new name"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl cursor-pointer border border-neutral-300 px-5 py-2.5 font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl cursor-pointer bg-blue-600 px-5 py-2.5 font-medium text-white shadow transition hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameModal;