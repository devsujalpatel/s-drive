import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

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

interface DirectoryItems {
  name: string;
  isDirectory: boolean;
}

export default function DirectoryView() {
  const URL = "http://localhost:4000";
  const BASE_URL = `${URL}/api/v1`;
  const [directoryItems, setDirectoryItems] = useState<DirectoryItems[]>([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [directoryName, setDirectoryName] = useState("");

  const { "*": dirPath } = useParams();

  async function getDirectoryItems() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/directory/${dirPath || ""}`);
      // ❌ Folder not found
      if (res.status === 404) {
        setDirectoryItems([]);
        setLoading(false);
        return "Folder Not Found";
      }

      // ❌ Other server errors
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      const data: DirectoryItems[] = await res.json();
      setDirectoryItems(data);
    } catch (err) {
      toast.error("Error in loading directory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirPath]);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${BASE_URL}/files/${dirPath}/${file.name}`, true);

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

  async function handleDelete(filename: string) {
    await fetch(`${BASE_URL}/files/${dirPath}/${filename}`, {
      method: "DELETE",
    });
    getDirectoryItems();
  }

  function renameFile(name: string) {
    setEditingFile(name); // ONLY filename
    setNewFilename(name);
  }

  async function saveFilename() {
    if (!editingFile) return;

    await fetch(`${BASE_URL}/files/${dirPath}/${editingFile}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename: `${newFilename}` }),
    });

    setEditingFile(null);
    setNewFilename("");
    getDirectoryItems();
  }

  function openCreateDirectoryModal() {
    setIsCreatingDirectory(true);
  }

  async function createDirectory() {
    if (!directoryName.trim()) return;

    try {
      const res = await fetch(
        `${BASE_URL}/directory/${dirPath ? "/" + dirPath : ""}/${directoryName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity",
          isCreatingDirectory
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createDirectory();
          }}
          className="flex gap-3 bg-white w-80 items-center justify-center flex-col rounded-xl p-6 border border-gray-300 shadow-lg"
        >
          <input
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            className="border border-gray-300 w-full rounded-md p-2 text-lg"
            placeholder="Folder name"
            autoFocus
          />

          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </div>
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
        {editingFile && (
          <Card>
            <CardContent className="p-4 flex gap-2">
              <Input
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
              />
              <Button onClick={saveFilename}>Save</Button>
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

        {/* FILE LIST */}
        <div className="grid gap-3">
          {loading ? (
            <div>Loading...</div>
          ) : directoryItems.length > 0 ? (
            directoryItems.map(
              ({ name: item, isDirectory }: DirectoryItems) => (
                <Card
                  key={item}
                  className="hover:shadow-md transition-all border-neutral-300 dark:border-neutral-800 cursor-pointer"
                >
                  <CardContent className="flex items-center justify-between">
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      {isDirectory ? (
                        <Folder size={20} className="text-muted-foreground" />
                      ) : (
                        <FileText size={20} className="text-muted-foreground" />
                      )}
                      <span className="font-medium truncate">{item}</span>
                    </div>

                    <div className="flex">
                      <div className="w-50 mr-10">
                        {!isDirectory ? (
                          <Link
                            className="w-full dark:border-neutral-800 border-neutral-300 py-2 px-4 flex gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 items-center justify-center border  rounded-xl"
                            to={`${BASE_URL}/files/${dirPath}/${item}?action=open`}
                            target="_blank"
                          >
                            <ExternalLink size={14} className="mr-2" />
                            Open
                          </Link>
                        ) : (
                          <Link
                            className="w-full dark:border-neutral-800 border-neutral-300 py-2 px-4 flex gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 items-center justify-center border  rounded-xl"
                            to={`./${item}`}
                          >
                            <ExternalLink size={14} className="mr-2" />
                            Open
                          </Link>
                        )}
                      </div>

                      {/* RIGHT ACTION MENU */}
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
                          {!isDirectory ? (
                            <Link
                              to={`${BASE_URL}/files/${dirPath}/${item}?action=open`}
                              target="_blank"
                            >
                              <DropdownMenuItem>
                                <ExternalLink size={14} className="mr-2" />
                                Open
                              </DropdownMenuItem>
                            </Link>
                          ) : (
                            <Link to={`./${item}`} target="_blank">
                              <DropdownMenuItem>
                                <ExternalLink size={14} className="mr-2" />
                                Open
                              </DropdownMenuItem>
                            </Link>
                          )}

                          {!isDirectory && (
                            <Link
                              to={`${BASE_URL}/files/${dirPath}/${item}?action=download`}
                            >
                              <DropdownMenuItem>
                                <Download size={14} className="mr-2" />
                                Download
                              </DropdownMenuItem>
                            </Link>
                          )}

                          <DropdownMenuItem onClick={() => renameFile(item)}>
                            <Pencil size={14} className="mr-2" />
                            Rename
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
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
              ),
            )
          ) : (
            <div>No Files or Folder Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
