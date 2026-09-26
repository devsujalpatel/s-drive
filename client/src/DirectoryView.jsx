import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import "./DirectoryView.css";
import api from "./lib/axios";
import { getErrorMessage, showErrorToast } from "./lib/errorToast";
import { DetailsPopup } from "./components/DetailsPopup";
import useStorageStore from "./store/useStorageStore";
import Breadcrumb from "./components/breadcrumb";

function DirectoryView() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
  const { dirId } = useParams();
  const navigate = useNavigate();

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState("My Drive");

  // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Error state
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); // "directory" or "file"
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Uploading states
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
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
    setErrorMessage("");

    try {
      const { data } = await api.get(`/directory/${dirId || ""}`);

      setDirectoryName(dirId ? data.name : "My Drive");
      setPath(data.path);

      // New items on top
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
      setUserRootDirId(data.path[0].id);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      const message = getErrorMessage(
        error,
        "Failed to fetch directory contents",
      );
      setErrorMessage(message);

      if (message !== "Directory not found or you do not have access to it!") {
        showErrorToast(error, "Failed to fetch directory contents");
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
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "video";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code";
      default:
        return "alt";
    }
  }

  /**
   * Click row to open directory or file
   */
  function handleRowClick(type, id) {
    if (type === "directory") {
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

function handleFileSelect(e) {
  const file = e.target.files?.[0];

  if (!file) return;

  if (file.size > availableSpace) {
    toast.error("Not enough space to upload this file");
    e.target.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error("File is too large", {
      description: `Maximum file size is ${
        MAX_FILE_SIZE_BYTES / (1024 * 1024)
      } MB.`,
      duration: 6000,
    });

    e.target.value = "";
    return;
  }

  const newItem = {
    file,
    name: file.name,
    size: file.size,
    id: `temp-${Date.now()}-${Math.random()}`,
    isUploading: false,
  };

  setFilesList((prev) => [newItem, ...prev]);

  uploadQueueRef.current.push(newItem);

  if (!isUploadingRef.current) {
    processUploadQueue();
  }

  e.target.value = "";
}
  /**
   * Upload items in queue one by one
   */
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
   function processUploadQueue() {
  if (isUploadingRef.current) return;

  const currentItem = uploadQueueRef.current.shift();

  if (!currentItem) {
    isUploadingRef.current = false;
    setIsUploading(false);

    getDirectoryItems();
    return;
  }

  isUploadingRef.current = true;
  setIsUploading(true);

  setFilesList((prev) =>
    prev.map((file) =>
      file.id === currentItem.id
        ? { ...file, isUploading: true }
        : file
    )
  );

  const xhr = new XMLHttpRequest();

  xhr.open(
    "POST",
    `${BASE_URL}/file/${dirId || ""}`,
    true
  );

  xhr.withCredentials = true;

  xhr.setRequestHeader("filename", currentItem.name);
  xhr.setRequestHeader("filesize", String(currentItem.size));

  xhr.upload.addEventListener("progress", (event) => {
    if (!event.lengthComputable) return;

    const progress = (event.loaded / event.total) * 100;

    setProgressMap((prev) => ({
      ...prev,
      [currentItem.id]: progress,
    }));
  });

  xhr.addEventListener("load", () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      showErrorToast(
        {
          message:
            xhr.responseText ||
            `Upload failed with status ${xhr.status}`,
        },
        `Failed to upload ${currentItem.name}`
      );
    }

    cleanupUpload(currentItem.id);
    isUploadingRef.current = false;
    setIsUploading(false);

    processUploadQueue();
  });

  xhr.addEventListener("error", () => {
    showErrorToast(
      { message: "Please check your connection and try again." },
      `Failed to upload ${currentItem.name}`
    );

    cleanupUpload(currentItem.id);

    isUploadingRef.current = false;
    setIsUploading(false);

    processUploadQueue();
  });

  xhr.addEventListener("abort", () => {
    toast.info("Upload cancelled", {
      description: currentItem.name,
    });

    cleanupUpload(currentItem.id);

    isUploadingRef.current = false;
    setIsUploading(false);

    processUploadQueue();
  });

  setUploadXhrMap((prev) => ({
    ...prev,
    [currentItem.id]: xhr,
  }));

  xhr.send(currentItem.file);
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
    (item) => item.id !== tempId
  );

  cleanupUpload(tempId);

  setFilesList((prev) =>
    prev.filter((file) => file.id !== tempId)
  );
}

  /**
   * Delete a file/directory
   */
  async function handleDeleteFile(id) {
    setErrorMessage("");
    try {
      await api.delete(`/file/${id}`);
      getDirectoryItems();
    } catch (error) {
      showErrorToast(error, "Failed to delete file");
    }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage("");
    try {
      await api.delete(`/directory/${id}`);
      getDirectoryItems();
    } catch (error) {
      showErrorToast(error, "Failed to delete folder");
    }
  }

  /**
   * Create a directory
   */
  async function handleCreateDirectory(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      await api.post(`/directory/${dirId || ""}`, {
        dirname: newDirname,
      });

      setNewDirname("New Folder");
      setShowCreateDirModal(false);

      await getDirectoryItems();
    } catch (error) {
      showErrorToast(error, "Failed to create folder");
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
    setErrorMessage("");

    try {
      const url =
        renameType === "file" ? `/file/${renameId}` : `/directory/${renameId}`;

      const payload =
        renameType === "file"
          ? { newFileName: renameValue }
          : { newDirName: renameValue };

      await api.patch(url, payload);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);

      await getDirectoryItems();
    } catch (error) {
      showErrorToast(error, "Failed to rename");
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
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
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
          "Directory not found or you do not have access to it!"
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
        "Directory not found or you do not have access to it!" ? (
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
