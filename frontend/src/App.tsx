import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const URL: string = "http://localhost:4000";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");

  async function getDirectoryItems() {
    const response = await fetch(URL);
    const data = await response.json();
    setDirectoryItems(data);
  }
  useEffect(() => {
    getDirectoryItems();
  }, []);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    
    if(!e.target.files){
      throw new Error("No File found");
    } 

    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${URL}/${file.name}`, true);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = Number(((e.loaded / e.total) * 100).toFixed(2));
      setProgress(totalProgress);
    });
    xhr.send(file);
  }

  async function handleDelete(filename: string) {
    const response = await fetch(`${URL}/${filename}`, {
      method: "DELETE",
      body: filename,
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename: string) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(oldFilename: string) {
    setNewFilename(oldFilename);
    const response = await fetch(`${URL}/${oldFilename}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFilename }),
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  return (
    <>
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <p>Progress: {progress}%</p>
      {directoryItems.map((item, i) => (
        <div key={i}>
          {item} <a href={`${URL}/${item}?action=open`}>Open</a> {" "}
          <a href={`${URL}${item}?action=download`}>Download</a>
          <button onClick={() => renameFile(item)}>Rename</button>
          <button onClick={() => saveFilename(item)}>Save</button>
          <button
            onClick={() => {
              handleDelete(item);
            }}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
    </>
  );
}

export default App;
