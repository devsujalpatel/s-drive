function ContextMenu({
  item,
  contextMenuPos,
  isUploadingItem,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  onOpenDetails,
  openRenameModal,
  BASE_URL,
}) {
  // Directory context menu
  if (item.isDirectory) {
    return (
      <div
        className="context-menu"
        style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
      >
        <div
          className="context-menu-item"
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          Rename
        </div>
        <div
          className="context-menu-item"
          onClick={() => handleDeleteDirectory(item.id)}
        >
          Delete
        </div>
        <div className="context-menu-item" onClick={() => onOpenDetails(item)}>
          Details
        </div>
      </div>
    );
  } else {
    // File context menu
    if (isUploadingItem && item.isUploading) {
      // Only show "Cancel"
      return (
        <div
          className="context-menu"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <div
            className="context-menu-item"
            onClick={() => handleCancelUpload(item.id)}
          >
            Cancel
          </div>
        </div>
      );
    } else {
      // Normal file
      return (
        <div
          className="context-menu"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <div
            className="context-menu-item"
            onClick={() =>
              (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
            }
          >
            Download
          </div>
          <div
            className="context-menu-item"
            onClick={() => openRenameModal("file", item.id, item.name)}
          >
            Rename
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleDeleteFile(item.id)}
          >
            Delete
          </div>
          <div
            className="context-menu-item"
            onClick={() => onOpenDetails(item)}
          >
            Details
          </div>
        </div>
      );
    }
  }
}

export default ContextMenu;
