import { useState, useEffect } from "react";

export const GoogleCode = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) return;

    const fetchGoogleAuthCallback = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${BASE_URL}/auth/google-auth-callback?code=${encodeURIComponent(code)}`,
          {
            method: "POST",
          }
        );

        if (!res.ok) throw new Error("Authentication failed");

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleAuthCallback();
  }, [BASE_URL]);

  const code = new URLSearchParams(window.location.search).get("code");

  return (
    <div>
      {loading && <p>Authenticating...</p>}

      {!loading && (
        <>
          <p>Code: {code}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </div>
  );
};