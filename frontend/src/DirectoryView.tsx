import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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

  const { "*": dirPath } = useParams();

  async function getDirectoryItems() {
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
    setLoading(false);
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirPath]);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${BASE_URL}/files/${file.name}`, true);

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
    setEditingFile(name); // store old file
    setNewFilename(name); // prefill input
  }

  async function saveFilename() {
    if (!editingFile) return;

    await fetch(`${BASE_URL}/files/${dirPath}/${editingFile}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFilename: `${dirPath}/${newFilename}` }),
    });

    setEditingFile(null);
    setNewFilename("");
    getDirectoryItems();
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">My Files</h1>

          <label>
            <Button asChild className="gap-2 cursor-pointer">
              <span>
                <Upload size={16} /> Upload
              </span>
            </Button>
            <input type="file" hidden onChange={uploadFile} />
          </label>
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
                  className="hover:shadow-md transition-all border-neutral-400 cursor-pointer"
                >
                  <Link
                    to={`${!isDirectory ? `${BASE_URL}/files/${dirPath}/${item}?action=open` : `./${item}`}`}
                  >
                    <CardContent className="flex items-center justify-between">
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        {isDirectory ? (
                          <Folder size={20} className="text-muted-foreground" />
                        ) : (
                          <FileText
                            size={20}
                            className="text-muted-foreground"
                          />
                        )}
                        <span className="font-medium truncate">{item}</span>
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
                    </CardContent>
                  </Link>
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
