import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DirectoryHeader from './components/DirectoryHeader';
import CreateDirectoryModal from './components/CreateDirectoryModal';
import RenameModal from './components/RenameModal';
import DirectoryList from './components/DirectoryList';
import './DirectoryView.css';
import api from './lib/axios';
import { getErrorMessage, showErrorToast } from './lib/errorToast';
import { DetailsPopup } from './components/DetailsPopup';
import useStorageStore from './store/useStorageStore';
import Breadcrumb from './components/breadcrumb';
import { uploadInitiate } from './apis/fileApi';
import { Files, FolderOpen, FolderPlus, HardDriveUpload, Plus, Upload } from 'lucide-react';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { createPortal } from 'react-dom';

function DirectoryView() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
  const { dirId } = useParams();
  const navigate = useNavigate();

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState('My Drive');

  // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState('New Folder');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); // "directory" or "file"
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Uploading states
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
  const [uploadErrorMap, setUploadErrorMap] = useState({});
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  const [path, setPath] = useState([]);
  const [userRootDirId, setUserRootDirId] = useState(null);

  const { availableSpace } = useStorageStore();

  /**
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    setErrorMessage('');

    try {
      const { data } = await api.get(`/directory/${dirId || ''}`);

      setDirectoryName(dirId ? data.name : 'My Drive');
      setPath(data.path);

      // New items on top
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
      setUserRootDirId(data.path[0].id);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }

      const message = getErrorMessage(
        error,
        'Failed to fetch directory contents',
      );
      setErrorMessage(message);

      if (message !== 'Directory not found or you do not have access to it!') {
        showErrorToast(error, 'Failed to fetch directory contents');
      }
    }
  }

  useEffect(() => {
    getDirectoryItems();
    // Reset context menu
    setActiveContextMenu(null);
  }, [dirId]);

  /**
   * Decide file icon
   */
  function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video';
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return 'archive';
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
        return 'code';
      default:
        return 'alt';
    }
  }

  /**
   * Click row to open directory or file
   */
  function handleRowClick(type, id) {
    if (type === 'directory') {
      navigate(`/directory/${id}`);
    } else {
      window.location.href = `${BASE_URL}/file/${id}`;
    }
  }

  /**
   * Select multiple files
   */
  const uploadQueueRef = useRef([]);
  const isUploadingRef = useRef(false);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    for (const file of files) {
      if (file.size > availableSpace) {
        toast.error(`Not enough space to upload ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File is too large: ${file.name}`, {
          description: `Maximum file size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
          duration: 6000,
        });
        continue;
      }

      const item = {
        file,
        name: file.name,
        size: file.size,
        id: `temp-${Date.now()}-${Math.random()}`,
        isUploading: false,
      };
      setFilesList((prev) => [item, ...prev]);
      uploadQueueRef.current.push(item);
    }
    processUploadQueue();
  }

  function cleanupUpload(id) {
    setUploadXhrMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setProgressMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function processUploadQueue() {
    if (isUploadingRef.current) return;
    const currentItem = uploadQueueRef.current.shift();
    if (!currentItem) {
      setIsUploading(false);
      await getDirectoryItems();
      return;
    }

    isUploadingRef.current = true;
    setIsUploading(true);
    setFilesList((prev) =>
      prev.map((file) =>
        file.id === currentItem.id ? { ...file, isUploading: true } : file,
      ),
    );

    const finish = () => {
      cleanupUpload(currentItem.id);
      isUploadingRef.current = false;
      setIsUploading(false);
      processUploadQueue();
    };

    try {
      const { uploadSignedUrl, fileId } = await uploadInitiate({
        name: currentItem.name,
        size: currentItem.size,
        contentType: currentItem.file.type || 'application/octet-stream',
        parentDirId: dirId || '',
      });
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadSignedUrl);
      xhr.setRequestHeader(
        'Content-Type',
        currentItem.file.type || 'application/octet-stream',
      );
      xhr.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) return;
        setProgressMap((prev) => ({
          ...prev,
          [currentItem.id]: (event.loaded / event.total) * 100,
        }));
      });
      xhr.addEventListener('load', () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          const message =
            xhr.responseText || `Upload failed with status ${xhr.status}`;
          setUploadErrorMap((prev) => ({
            ...prev,
            [currentItem.id]: 'Upload to storage failed. Try again.',
          }));
          showErrorToast({ message }, `Failed to upload ${currentItem.name}`);
        } else {
          api
            .post(`/file/upload/${fileId}/complete`)
            .then(() => {
              setFilesList((prev) =>
                prev.filter((file) => file.id !== currentItem.id),
              );
              getDirectoryItems();
            })
            .catch((error) => {
              setUploadErrorMap((prev) => ({
                ...prev,
                [currentItem.id]: getErrorMessage(
                  error,
                  'Upload saved, but could not finalize it. Refresh the folder.',
                ),
              }));
              showErrorToast(error, `Could not finalize ${currentItem.name}`);
            })
            .finally(finish);
          return;
        }
        finish();
      });
      xhr.addEventListener('error', () => {
        setUploadErrorMap((prev) => ({
          ...prev,
          [currentItem.id]:
            'Could not reach storage. Check your connection and try again.',
        }));
        showErrorToast(
          { message: 'Please check your connection and try again.' },
          `Failed to upload ${currentItem.name}`,
        );
        finish();
      });
      xhr.addEventListener('abort', () => {
        api.delete(`/file/upload/${fileId}`).catch((error) => {
          showErrorToast(error, `Could not cancel ${currentItem.name}`);
        });
        setFilesList((prev) =>
          prev.filter((file) => file.id !== currentItem.id),
        );
        toast.info('Upload cancelled', { description: currentItem.name });
        finish();
      });
      setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
      xhr.send(currentItem.file);
    } catch (error) {
      setUploadErrorMap((prev) => ({
        ...prev,
        [currentItem.id]: getErrorMessage(
          error,
          'Could not start this upload. Try again.',
        ),
      }));
      showErrorToast(error, `Failed to start upload for ${currentItem.name}`);
      finish();
    }
  }

  /**
   * Cancel an in-progress upload
   */
  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];

    if (xhr) {
      xhr.abort();
      return;
    }

    // Item hasn't started uploading yet
    uploadQueueRef.current = uploadQueueRef.current.filter(
      (item) => item.id !== tempId,
    );

    cleanupUpload(tempId);

    setFilesList((prev) => prev.filter((file) => file.id !== tempId));
  }

  /**
   * Delete a file/directory
   */
  async function handleDeleteFile(id) {
    setErrorMessage('');
    try {
      await api.delete(`/file/${id}`);
      getDirectoryItems();
      return true;
    } catch (error) {
      showErrorToast(error, 'Failed to delete file');
      return false;
    }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage('');
    try {
      await api.delete(`/directory/${id}`);
      getDirectoryItems();
      return true;
    } catch (error) {
      showErrorToast(error, 'Failed to delete folder');
      return false;
    }
  }

  function requestDelete(type, id) {
    const source = type === 'directory' ? directoriesList : filesList;
    const item = source.find((entry) => String(entry.id) === String(id));
    if (!item) return;
    setActiveContextMenu(null);
    setDeleteTarget({ type, id, name: item.name });
  }

  async function confirmDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const deleted = deleteTarget.type === 'directory'
      ? await handleDeleteDirectory(deleteTarget.id)
      : await handleDeleteFile(deleteTarget.id);
    setIsDeleting(false);
    if (deleted) setDeleteTarget(null);
  }

  /**
   * Create a directory
   */
  async function handleCreateDirectory(e) {
    e.preventDefault();
    setErrorMessage('');

    try {
      await api.post(`/directory/${dirId || ''}`, {
        dirname: newDirname,
      });

      setNewDirname('New Folder');
      setShowCreateDirModal(false);

      await getDirectoryItems();
    } catch (error) {
      showErrorToast(error, 'Failed to create folder');
    }
  }

  /**
   * Rename
   */
  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    try {
      const url =
        renameType === 'file' ? `/file/${renameId}` : `/directory/${renameId}`;

      const payload =
        renameType === 'file'
          ? { newFileName: renameValue }
          : { newDirName: renameValue };

      await api.patch(url, payload);

      setShowRenameModal(false);
      setRenameValue('');
      setRenameType(null);
      setRenameId(null);

      await getDirectoryItems();
    } catch (error) {
      showErrorToast(error, 'Failed to rename');
    }
  }

  /**
   * Context Menu
   */
  function handleContextMenu(e, id) {
    e.stopPropagation();
    e.preventDefault();

    if (activeContextMenu === id) {
      setActiveContextMenu(null);
    } else {
      const trigger = e.currentTarget;
      const bounds = trigger.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = 190;
      const left = Math.max(8, Math.min(bounds.right - menuWidth, window.innerWidth - menuWidth - 8));
      const top = Math.max(8, Math.min(bounds.bottom + 6, window.innerHeight - menuHeight - 8));
      setActiveContextMenu(id);
      setContextMenuPos({ x: left, y: top });
    }
  }

  function openDetailsPopup(item) {
    setDetailsItem(item);
    setShowDetailsPopup(true);
    setActiveContextMenu(null);
  }

  function closeDetailsPopup() {
    setShowDetailsPopup(false);
    setDetailsItem(null);
  }

  useEffect(() => {
    function handleDocumentClick() {
      setActiveContextMenu(null);
    }
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Combine directories & files into one list for rendering
  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  return (
    <div className="drive-app-shell">
      <DirectoryHeader
        directoryName={directoryName}
        onCreateFolderClick={() => setShowCreateDirModal(true)}
        onUploadFilesClick={() => fileInputRef.current.click()}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        // Disable if the user doesn't have access
        disabled={
          errorMessage ===
          'Directory not found or you do not have access to it!'
        }
      />

      <main className="drive-main">
      <div className="drive-page-heading">
        <div>
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h1>{directoryName}</h1>
          <p>A calm place for everything you want to keep.</p>
        </div>
        <button className="drive-new-folder" onClick={() => setShowCreateDirModal(true)} disabled={errorMessage === 'Directory not found or you do not have access to it!'}><Plus size={16} /> New folder</button>
      </div>
      <section className="drive-content-panel">
      <div className="drive-content-toolbar">
        <Breadcrumb path={path} userRootDirId={userRootDirId} />
        <div className="drive-item-count"><Files size={15} /> {combinedItems.length} {combinedItems.length === 1 ? 'item' : 'items'}</div>
      </div>

      {/* Create Directory Modal */}
      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {deleteTarget && createPortal(
        <DeleteConfirmModal
          item={deleteTarget}
          busy={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />,
        document.body,
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setShowRenameModal(false)}
          onRenameSubmit={handleRenameSubmit}
        />
      )}

      {/* Details Popup */}
      {showDetailsPopup && (
        <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
      )}

      {combinedItems.length === 0 ? (
        // Check if the error is specifically the "no access" error
        errorMessage ===
        'Directory not found or you do not have access to it!' ? (
          <div className="drive-empty-state"><span className="empty-state-icon"><FolderOpen size={25} /></span><h2>We can’t find this folder</h2><p>It may have been moved, deleted, or you may not have access.</p></div>
        ) : (
          <div className="drive-empty-state"><span className="empty-state-icon"><HardDriveUpload size={25} /></span><h2>This folder is empty</h2><p>Upload something new or create a folder to get started.</p><div className="empty-state-actions"><button className="drive-upload-button" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Upload files</button><button className="drive-icon-button" onClick={() => setShowCreateDirModal(true)} title="New folder"><FolderPlus size={17} /></button></div></div>
        )
      ) : (
        <DirectoryList
          items={combinedItems}
          handleRowClick={handleRowClick}
          activeContextMenu={activeContextMenu}
          contextMenuPos={contextMenuPos}
          handleContextMenu={handleContextMenu}
          getFileIcon={getFileIcon}
          progressMap={progressMap}
          uploadErrorMap={uploadErrorMap}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={(id) => requestDelete('file', id)}
          handleDeleteDirectory={(id) => requestDelete('directory', id)}
          openRenameModal={openRenameModal}
          onOpenDetails={openDetailsPopup}
          BASE_URL={BASE_URL}
        />
      )}
      </section>
      <footer className="drive-footer"><span>Private by design</span><span className="footer-dot" /> Your files, organized your way</footer>
      </main>
    </div>
  );
}

export default DirectoryView;
