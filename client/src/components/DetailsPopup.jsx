import { useEffect } from "react";
import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { formatBytes } from "../lib/formatBytes";

function formatDate(date) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleString();
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-3 last:border-b-0">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <span className="max-w-[65%] wrap-break-word text-right text-sm text-neutral-900">
        {value || "Not available"}
      </span>
    </div>
  );
}

export function DetailsPopup({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!item) return null;

  const type = item.isDirectory ? "Folder" : "File";
  const sizeLabel = item.isDirectory ? "Total size" : "Size";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                item.isDirectory
                  ? "bg-amber-100 text-amber-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {item.isDirectory ? (
                <FaFolder className="text-xl" />
              ) : (
                <FaFileAlt className="text-xl" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-neutral-900">
                Details
              </h2>
              <p className="truncate text-sm text-neutral-500">{item.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details popup"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <FaTimes />
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-200 px-4">
          <DetailRow label="Name" value={item.name} />
          <DetailRow label="Type" value={type} />

          <DetailRow label={sizeLabel} value={formatBytes(item.size)} />
          {!item.isDirectory && (
            <DetailRow
              label="Extension"
              value={item.extension || "Not available"}
            />
          )}
          <DetailRow label="Created" value={formatDate(item.createdAt)} />
          <DetailRow label="Updated" value={formatDate(item.updatedAt)} />
        </div>
      </div>
    </div>
  );
}

export default DetailsPopup;
