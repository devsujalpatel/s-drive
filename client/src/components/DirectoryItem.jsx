import { Archive, Code2, FileImage, FileText, Film, Folder, MoreHorizontal } from 'lucide-react';
import ContextMenu from './ContextMenu';
import { formatBytes } from '../lib/formatBytes';
import { createPortal } from 'react-dom';

function DirectoryItem({ item, handleRowClick, activeContextMenu, contextMenuPos, handleContextMenu, getFileIcon, uploadProgress, uploadError, handleCancelUpload, handleDeleteFile, handleDeleteDirectory, openRenameModal, onOpenDetails, BASE_URL }) {
  const isUploadingItem = item.id.startsWith('temp-');
  const iconMap = {
    pdf: [FileText, 'file-icon-pdf'], image: [FileImage, 'file-icon-image'],
    video: [Film, 'file-icon-video'], archive: [Archive, 'file-icon-archive'],
    code: [Code2, 'file-icon-code'], alt: [FileText, 'file-icon-default'],
  };
  const [Icon, iconClass] = iconMap[getFileIcon(item.name)] || iconMap.alt;
  const size = item.isDirectory ? (item.totalSize ?? item.size) : item.size;

  return <div className={`drive-item ${isUploadingItem ? 'drive-item-uploading' : ''}`} onClick={() => !activeContextMenu && handleRowClick(item.isDirectory ? 'directory' : 'file', item.id)} onContextMenu={(event) => handleContextMenu(event, item.id)}>
    <span className={`drive-item-icon ${item.isDirectory ? 'folder-tile' : iconClass}`}>{item.isDirectory ? <Folder size={19} fill="currentColor" strokeWidth={1.7} /> : <Icon size={19} strokeWidth={1.8} />}</span>
    <div className="drive-item-main">
      <div className="drive-item-name-line"><span className="drive-item-name" title={item.name}>{item.name}</span>{isUploadingItem && <span className="uploading-pill">Uploading</span>}</div>
      <span className="drive-item-meta">{item.isDirectory ? 'Folder' : 'File'} <span>·</span> {formatBytes(size)}</span>
      {isUploadingItem && !uploadError && <div className="upload-progress-wrap"><div className="upload-progress-caption"><span>{uploadProgress >= 100 ? 'Finishing up…' : 'Uploading your file'}</span><span>{Math.floor(uploadProgress)}%</span></div><div className="upload-progress-track"><span style={{ width: `${uploadProgress}%` }} /></div></div>}
      {uploadError && <span className="upload-error" role="alert">Upload failed: {uploadError}</span>}
    </div>
    <span className="drive-item-updated">{item.isUploading ? 'In progress' : '—'}</span>
    <button className="drive-item-menu-button" aria-label={`Actions for ${item.name}`} onClick={(event) => { event.stopPropagation(); handleContextMenu(event, item.id); }}><MoreHorizontal size={19} /></button>
    {activeContextMenu === item.id && createPortal(<ContextMenu item={item} contextMenuPos={contextMenuPos} isUploadingItem={isUploadingItem} handleCancelUpload={handleCancelUpload} handleDeleteFile={handleDeleteFile} handleDeleteDirectory={handleDeleteDirectory} onOpenDetails={onOpenDetails} openRenameModal={openRenameModal} BASE_URL={BASE_URL} />, document.body)}
  </div>;
}

export default DirectoryItem;
