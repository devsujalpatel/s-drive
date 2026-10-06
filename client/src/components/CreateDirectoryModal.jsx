import { useEffect, useRef } from 'react';
import { FolderPlus, X } from 'lucide-react';

function CreateDirectoryModal({ newDirname, setNewDirname, onClose, onCreateDirectory }) {
  const inputRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    const handleKeyDown = (event) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172017]/35 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="create-folder-title" className="modal-enter w-full max-w-[430px] overflow-hidden rounded-2xl border border-[#e7eae4] bg-white shadow-[0_24px_80px_rgba(24,35,24,.2)]">
      <div className="flex items-start justify-between border-b border-[#eff1ec] px-6 py-5">
        <div className="flex items-center gap-3.5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf3e8] text-[#557354]"><FolderPlus size={20} /></span>
          <div><h2 id="create-folder-title" className="m-0 font-[Manrope] text-[17px] font-semibold tracking-[-.3px] text-[#252a23]">Create a folder</h2><p className="mt-1 text-[12px] text-[#8b9288]">Give your new folder a name.</p></div>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[#969d93] transition hover:bg-[#f3f5f1] hover:text-[#464e44]"><X size={17} /></button>
      </div>
      <form onSubmit={onCreateDirectory} className="p-6">
        <label htmlFor="new-folder-name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[.08em] text-[#777f74]">Folder name</label>
        <input id="new-folder-name" ref={inputRef} type="text" value={newDirname} onChange={(event) => setNewDirname(event.target.value)} placeholder="e.g. Project files" className="h-11 w-full rounded-[10px] border border-[#dfe4dc] bg-white px-3.5 text-[13px] text-[#282d26] outline-none transition placeholder:text-[#b0b6ad] focus:border-[#88a18a] focus:ring-4 focus:ring-[#719477]/10" />
        <div className="mt-6 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="h-10 rounded-[9px] border border-[#e3e7e0] bg-white px-4 text-[12px] font-semibold text-[#626a5f] transition hover:bg-[#f7f8f5]">Cancel</button>
          <button type="submit" disabled={!newDirname.trim()} className="h-10 rounded-[9px] bg-[#365f48] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#294d39] disabled:cursor-not-allowed disabled:opacity-45">Create folder</button>
        </div>
      </form>
    </section>
  </div>;
}

export default CreateDirectoryModal;
