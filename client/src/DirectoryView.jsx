import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const { availableSpace } = useStorageStore();

  /**
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    setErrorMessage("");

    try {
      const { data } = await api.get(`/directory/${dirId || ""}`);

      setDirectoryName(dirId ? data.name : "My Drive");

      // New items on top
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
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
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (selectedFiles.some((file) => file.size > availableSpace)) {
      toast.error(`Not enough space to upload this big file`);
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE_BYTES,
    );
    const validFiles = selectedFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
    );

    if (oversizedFiles.length > 0) {
      const rejectedNames = oversizedFiles.map((file) => file.name).join(", ");

      toast.error(
        `${oversizedFiles.length} ${
          oversizedFiles.length === 1 ? "file is" : "files are"
        } too large`,
        {
          description: `Maximum file size is 50 MB. Rejected: ${rejectedNames}`,
          duration: 6000,
        },
      );
    }

    setErrorMessage("");

    // Clear file input so the same file can be chosen again if needed
    e.target.value = "";

    if (validFiles.length === 0) return;

    // Build a list of "temp" items
    const newItems = validFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return {
        file,
        name: file.name,
        size: file.size,
        id: tempId,
        isUploading: false,
      };
    });

    // Put them at the top of the existing list
    setFilesList((prev) => [...newItems, ...prev]);

    // Initialize progress=0 for each
    newItems.forEach((item) => {
      setProgressMap((prev) => ({ ...prev, [item.id]: 0 }));
    });

    // Add them to the uploadQueue
    setUploadQueue((prev) => [...prev, ...newItems]);

    // Start uploading queue if not already uploading
    if (!isUploading) {
      setIsUploading(true);
      // begin the queue process
      processUploadQueue([...uploadQueue, ...newItems.reverse()]);
    }
  }

  /**
   * Upload items in queue one by one
   */
  function processUploadQueue(queue) {
    if (queue.length === 0) {
      setIsUploading(false);
      setUploadQueue([]);

      setTimeout(() => {
        getDirectoryItems();
      }, 1000);

      return;
    }

    // Take first item
    const [currentItem, ...restQueue] = queue;

    // Mark as uploading
    setFilesList((prev) =>
      prev.map((f) =>
        f.id === currentItem.id ? { ...f, isUploading: true } : f,
      ),
    );

    // Create XHR
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);

    // Send cookies
    xhr.withCredentials = true;

    // Send filename
    xhr.setRequestHeader("filename", currentItem.name);
    xhr.setRequestHeader("filesize", currentItem.size);

    // Upload progress
    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;

        setProgressMap((prev) => ({
          ...prev,
          [currentItem.id]: progress,
        }));
      }
    });

    // Upload completed
    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        showErrorToast(
          {
            message:
              xhr.responseText || `Upload failed with status ${xhr.status}`,
          },
          `Failed to upload ${currentItem.name}`,
        );
      }

      // Continue queue
      processUploadQueue(restQueue);
    });

    // Upload failed
    xhr.addEventListener("error", () => {
      showErrorToast(
        { message: "Please check your connection and try again." },
        `Failed to upload ${currentItem.name}`,
      );

      // Continue queue
      processUploadQueue(restQueue);
    });

    // Upload cancelled
    xhr.addEventListener("abort", () => {
      toast.info("Upload cancelled", {
        description: currentItem.name,
      });
    });

    // Store XHR so it can be cancelled
    setUploadXhrMap((prev) => ({
      ...prev,
      [currentItem.id]: xhr,
    }));

    // Send the actual File/Blob
    xhr.send(currentItem.file);
  }
  /**
   * Cancel an in-progress upload
   */
  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];

    if (xhr) {
      xhr.abort();
    }

    // Remove from queue
    setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));

    // Remove from files list
    setFilesList((prev) => prev.filter((file) => file.id !== tempId));

    // Remove progress
    setProgressMap((prev) => {
      const { [tempId]: _, ...rest } = prev;
      return rest;
    });

    // Remove XHR reference
    setUploadXhrMap((prev) => {
      const copy = { ...prev };
      delete copy[tempId];
      return copy;
    });
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
