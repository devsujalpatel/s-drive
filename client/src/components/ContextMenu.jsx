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
        onClick={(event) => event.stopPropagation()}
        style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
      >
        <button type="button"
          className="context-menu-item"
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          Rename
        </button>
        <button type="button"
          className="context-menu-item"
          onClick={() => handleDeleteDirectory(item.id)}
        >
          Delete
        </button>
        <button type="button" className="context-menu-item" onClick={() => onOpenDetails(item)}>
          Details
        </button>
      </div>
    );
  } else {
    // File context menu
    if (isUploadingItem && item.isUploading) {
      // Only show "Cancel"
      return (
        <div
          className="context-menu"
          onClick={(event) => event.stopPropagation()}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <button type="button"
            className="context-menu-item"
            onClick={() => handleCancelUpload(item.id)}
          >
            Cancel
          </button>
        </div>
      );
    } else {
      // Normal file
      return (
        <div
          className="context-menu"
          onClick={(event) => event.stopPropagation()}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <button type="button"
            className="context-menu-item"
            onClick={() =>
              (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
            }
          >
            Download
          </button>
          <button type="button"
            className="context-menu-item"
            onClick={() => openRenameModal("file", item.id, item.name)}
          >
            Rename
          </button>
          <button type="button"
            className="context-menu-item"
            onClick={() => handleDeleteFile(item.id)}
          >
            Delete
          </button>
          <button type="button"
            className="context-menu-item"
            onClick={() => onOpenDetails(item)}
          >
            Details
          </button>
        </div>
      );
    }
  }
}

export default ContextMenu;
