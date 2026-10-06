import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

function DeleteConfirmModal({ item, busy = false, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, onClose]);

  if (!item) return null;

  const kind = item.type === 'directory' ? 'folder' : 'file';
  return (
    <div
      className="delete-modal-overlay "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        className="modal-enter w-full max-w-[430px] overflow-hidden rounded-2xl border border-[#e7eae4] bg-white shadow-[0_24px_80px_rgba(24,35,24,.2)]"
      >
        <div className="flex items-start justify-between border-b border-[#eff1ec] px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fbefec] text-[#b9685c]">
              <AlertTriangle size={19} />
            </span>
            <div>
              <h2
                id="delete-title"
                className="m-0 font-[Manrope] text-[17px] font-semibold tracking-[-.3px] text-[#252a23]"
              >
                Delete {kind}?
              </h2>
              <p className="mt-1 text-[12px] text-[#8b9288]">
                This action can’t be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#969d93] transition hover:bg-[#f3f5f1] hover:text-[#464e44] disabled:opacity-40"
          >
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p
            id="delete-description"
            className="m-0 text-[13px] leading-6 text-[#697166]"
          >
            Are you sure you want to delete{' '}
            <strong className="font-semibold text-[#343b32]">
              {item.name}
            </strong>
            ?{' '}
            {kind === 'folder'
              ? 'Everything inside this folder will be removed too.'
              : 'The file will be permanently removed from your drive.'}
          </p>
        </div>
        <div className="flex justify-end gap-2.5 border-t border-[#eff1ec] bg-[#fcfcfb] px-6 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="h-10 rounded-[9px] border border-[#e3e7e0] bg-white px-4 text-[12px] font-semibold text-[#626a5f] transition hover:bg-[#f7f8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-10 min-w-[100px] rounded-[9px] bg-[#a84f43] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#914237] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeleteConfirmModal;
