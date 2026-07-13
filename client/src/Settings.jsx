import { useSearchParams } from "react-router-dom";

export default function Settings() {
  const [searchParams] = useSearchParams();

  const connected = searchParams.get("drive") === "connected";

  return (
    <>
      {connected && <p>Google Drive connected successfully.</p>}
    </>
  );
}