import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Upload,
  FileText,
  MoreVertical,
  Trash,
  Pencil,
  Download,
  ExternalLink,
  Folder,
  Plus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "./components/ui/badge";

interface FileItem {
  id: string;
  name: string;
  extension: string;
  parentDirId: string;
}

interface DirectoryItem {
  id: string;
  parentDirId: string;
  name: string;
}

type Item =
  | (FileItem & { type: "file" })
  | (DirectoryItem & { type: "directory" });

export default function DirectoryView() {
  const URL = import.meta.env.VITE_API_URL;
  const BASE_URL = `${URL}/api/v1`;

  const [directoriesList, setDirectoriesList] = useState<DirectoryItem[]>([]);
  const [filesList, setFilesList] = useState<FileItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [newFilename, setNewFilename] = useState("");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [directoryName, setDirectoryName] = useState("");

  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const { "*": dirPath } = useParams();

  useEffect(() => {
    const merged: Item[] = [
      ...directoriesList.map(
        (d): Item => ({
          ...d,
          type: "directory",
        }),
      ),
      ...filesList.map(
        (f): Item => ({
          ...f,
          type: "file",
        }),
      ),
    ];

    setItems(merged);
  }, [directoriesList, filesList]);

  const getDirectoryItems = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/directory/${dirPath || ""}`);

      if (res.status === 404) {
        setDirectoriesList([]);
        return;
      }

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setDirectoriesList(data.directories);
      setFilesList(data.files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dirPath]);

  useEffect(() => {
    getDirectoryItems();
  }, [getDirectoryItems]);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${BASE_URL}/file/${file.name}`, true);
    // xhr.setRequestHeader("parentDirId", null)
    xhr.upload.addEventListener("progress", (e) => {
      setProgress(Number(((e.loaded / e.total) * 100).toFixed(0)));
    });

    xhr.addEventListener("load", () => {
      getDirectoryItems();
      setProgress(0);
      e.target.value = "";
    });

    xhr.send(file);
  }

  async function handleDelete(fileId: string) {
    await fetch(`${BASE_URL}/file/${fileId}`, {
      method: "DELETE",
    });
    getDirectoryItems();
  }

  function renameFile(id: string) {
    setEditingFileId(id); // ONLY filename
    // setNewFilename();
  }

  async function saveFilename(fileId: string) {
    if (!editingFileId) return;

    await fetch(`${BASE_URL}/file/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename: `${newFilename}` }),
    });

    setEditingFileId(null);
    setNewFilename("");
    getDirectoryItems();
  }

  function openCreateDirectoryModal() {
    setIsCreatingDirectory(true);
  }

  async function createDirectory(parentDirId: string) {
    if (!directoryName.trim()) return;

    try {
      const res = await fetch(
        `${BASE_URL}/directory/${!!parentDirId ? parentDirId : ""}`,
        {
          method: "POST",
          headers: { dirname: `${directoryName}` },
        },
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Directory created successfully");

      setDirectoryName("");
      setIsCreatingDirectory(false);
      getDirectoryItems();
    } catch (err) {
      console.error(err);
      toast.error("Error creating directory");
    } finally {
      setDirectoryName("");
      setIsCreatingDirectory(false);
    }
  }

  return (
    <div className="min-h-screen relative bg-muted/40 dark:bg-neutral-950 p-6 flex justify-center overflow-hidden">
      <ModeToggle />
      <Dialog
        open={isCreatingDirectory}
        onOpenChange={() => setIsCreatingDirectory(false)}
      >
        <DialogContent className="sm:max-w-[320px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createDirectory("");
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>

            <input
              type="text"
              value={directoryName}
              onChange={(e) => setDirectoryName(e.target.value)}
              className="border border-gray-300 dark:border-neutral-600 w-full rounded-md p-2 text-base"
              placeholder="Folder name"
              autoFocus
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="w-full max-w-4xl space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <h1 className="text-3xl font-semibold tracking-tight">My Files</h1>
          </Link>
          <div className="flex gap-4 justify-center items-center">
            <Button
              onClick={openCreateDirectoryModal}
              asChild
              variant={"ghost"}
              className="gap-2 cursor-pointer border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <span>
                <Plus size={16} /> Create File
              </span>
            </Button>
            <label>
              <Button asChild className="gap-2 cursor-pointer">
                <span>
                  <Upload size={16} /> Upload File
                </span>
              </Button>
              <input type="file" hidden onChange={uploadFile} />
            </label>
          </div>
        </div>

        {/* RENAME INPUT */}
        {!!editingFileId && (
          <Card>
            <CardContent className="p-4 flex gap-2">
              <Input
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
              />
              <Button onClick={() => saveFilename(editingFileId)}>Save</Button>
            </CardContent>
          </Card>
        )}

        {/* PROGRESS */}
        {progress > 0 && progress < 100 && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Uploading... {progress}%
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {loading ? (
            <div>Loading...</div>
          ) : items.length > 0 ? (
            items.map(({ name: item, id, type }) => (
              <Card
                key={id}
                className="hover:shadow-md transition-all border-neutral-300 dark:border-neutral-800"
              >
                <CardContent className="flex items-center justify-between">
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {type === "directory" ? (
                      <Folder size={20} className="text-muted-foreground" />
                    ) : (
                      <FileText size={20} className="text-muted-foreground" />
                    )}

                    <span className="font-medium truncate">{item}</span>

                    {/* <Badge variant="secondary" className="ml-2">
                      {type}
                    </Badge> */}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      className="dark:border-neutral-800 border-neutral-300 py-2 px-4 flex gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 items-center justify-center border rounded-xl"
                      to={
                        type === "file"
                          ? `${BASE_URL}/${type}/${id}`
                          : `/${id}`
                      }
                    >
                      <ExternalLink size={14} />
                      Open
                    </Link>

                    {/* ACTION MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <Link
                          to={
                            type === "file"
                              ? `${BASE_URL}/${type}/${id}`
                              : `/${id}`
                          }
                          target="_blank"
                        >
                          <DropdownMenuItem>
                            <ExternalLink size={14} className="mr-2" />
                            Open
                          </DropdownMenuItem>
                        </Link>

                        {type === "file" && (
                          <Link to={`${BASE_URL}/file/${id}?action=download`}>
                            <DropdownMenuItem>
                              <Download size={14} className="mr-2" />
                              Download
                            </DropdownMenuItem>
                          </Link>
                        )}

                        <DropdownMenuItem onClick={() => renameFile(id)}>
                          <Pencil size={14} className="mr-2" />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDelete(id)}
                          className="text-red-500"
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div>No Files or Folder Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
