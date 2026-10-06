import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    } catch (error) {
      showErrorToast(error, 'Failed to delete file');
    }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage('');
    try {
      await api.delete(`/directory/${id}`);
      getDirectoryItems();
    } catch (error) {
      showErrorToast(error, 'Failed to delete folder');
    }
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
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (activeContextMenu === id) {
      setActiveContextMenu(null);
    } else {
      setActiveContextMenu(id);
      setContextMenuPos({ x: clickX - 110, y: clickY });
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
    <div className="directory-view">
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

      <Breadcrumb path={path} userRootDirId={userRootDirId} />

      {/* Create Directory Modal */}
      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
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
          <p className="no-data-message">
            Directory not found or you do not have access to it!
          </p>
        ) : (
          <p className="no-data-message">
            This folder is empty. Upload files or create a folder to see some
            data.
          </p>
        )
      ) : (
        <DirectoryList
          items={combinedItems}
          handleRowClick={handleRowClick}
          activeContextMenu={activeContextMenu}
          contextMenuPos={contextMenuPos}
          handleContextMenu={handleContextMenu}
          getFileIcon={getFileIcon}
          isUploading={isUploading}
          progressMap={progressMap}
          uploadErrorMap={uploadErrorMap}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          openRenameModal={openRenameModal}
          onOpenDetails={openDetailsPopup}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
}

export default DirectoryView;
