import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";
import { formatBytes } from "../lib/formatBytes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function DirectoryItem({
  item,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  getFileIcon,
  isUploading,
  uploadProgress,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  onOpenDetails,
  BASE_URL,
}) {
  // Convert the file icon string to the actual Icon component
  function renderFileIcon(iconString) {
    switch (iconString) {
      case "pdf":
        return <FaFilePdf className="text-xl text-red-500" />;

      case "image":
        return <FaFileImage className="text-xl text-emerald-500" />;

      case "video":
        return <FaFileVideo className="text-xl text-violet-500" />;

      case "archive":
        return <FaFileArchive className="text-xl text-yellow-500" />;

      case "code":
        return <FaFileCode className="text-xl text-sky-500" />;

      default:
        return <FaFileAlt className="text-xl text-neutral-500" />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");
  const itemSize = item.isDirectory ? (item.totalSize ?? item.size) : item.size;
  const tooltipLabel = item.isDirectory ? "Folder size" : "File size";
  const formattedSize = formatBytes(itemSize);

  return (
    <div
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
      className="group relative flex w-full flex-col rounded-2xl cursor-pointer border border-neutral-200/60 ring-1 ring-neutral-100/20 bg-white px-4 py-3 transition-all duration-200  hover:border-neutral-200 hover:shadow-xs "
    >
      {/* Main Row */}
      <div className="flex items-center justify-between">
        {/* Left */}
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
              renderFileIcon(getFileIcon(item.name))
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">{item.name}</p>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="w-fit text-sm text-neutral-500">
                    {item.isDirectory ? "Folder" : "File"}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {tooltipLabel}: {formattedSize}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Three Dots */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, item.id);
          }}
          className="rounded-lg p-2 text-neutral-500 opacity-0 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900 group-hover:opacity-100"
        >
          <BsThreeDotsVertical className="text-lg" />
        </button>
      </div>

      {/* Upload Progress */}
      {isUploadingItem && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>
              {uploadProgress === 100 ? "Finishing..." : "Uploading..."}
            </span>

            <span>{Math.floor(uploadProgress)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadProgress === 100 ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{
                width: `${uploadProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Context Menu */}
      {activeContextMenu === item.id && (
        <ContextMenu
          item={item}
          contextMenuPos={contextMenuPos}
          isUploadingItem={isUploadingItem}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          onOpenDetails={onOpenDetails}
          openRenameModal={openRenameModal}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
}

export default DirectoryItem;
