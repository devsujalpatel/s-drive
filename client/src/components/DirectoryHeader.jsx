import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFolderPlus,
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaGoogleDrive,
} from "react-icons/fa";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [profile, setProfile] = useState(null);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // -------------------------------------------
  // 1. Fetch user info from /user on mount
  // -------------------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${BASE_URL}/user`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Set user info if logged in
          setUserName(data.name);
          setUserEmail(data.email);
          setProfile(data.profile);
          setLoggedIn(true);
        } else if (response.status === 401) {
          // User not logged in
          setUserName("Guest User");
          setUserEmail("guest@example.com");
          setProfile(null);
          setLoggedIn(false);
        } else {
          // Handle other error statuses if needed
          console.error("Error fetching user info:", response.status);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
    fetchUser();
  }, [BASE_URL]);

  // -------------------------------------------
  // 2. Toggle user menu
  // -------------------------------------------
  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  // -------------------------------------------
  // 3. Logout handler
  // -------------------------------------------
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setProfile(null);
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout-all`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setProfile(null);
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  // -------------------------------------------
  // 4. Close menu on outside click
  // -------------------------------------------
  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-3 cursor-pointer">
        <FaGoogleDrive className="text-2xl text-blue-600" />
        <h1 className="text-2xl font-semibold tracking-tight">
          {directoryName}
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        {/* Create Folder (icon button) */}

        <button
          onClick={onCreateFolderClick}
          disabled={disabled}
          className="flex cursor-pointer h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all  hover:border-blue-500/20 hover:bg-blue-50/60 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaFolderPlus />
        </button>

        <button
          onClick={onUploadFilesClick}
          disabled={disabled}
          className="flex h-11 cursor-pointer w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all  hover:border-green-500/20 hover:bg-green-50/60 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaUpload />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple
          onChange={handleFileSelect}
        />

        {/* User Icon & Dropdown Menu */}
        <div className="user-menu-container" ref={userMenuRef}>
          <button
            onClick={handleUserIconClick}
            className="overflow-hidden rounded-full cursor-pointer ring-2 ring-transparent transition hover:ring-blue-500"
          >
            {profile ? (
              <img
                src={profile}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-neutral-100">
                <FaUser />
              </div>
            )}
          </button>

          {showUserMenu && (
            <div>
              {loggedIn ? (
                <>
                  <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                    <div className="flex items-center gap-3 border-b p-4">
                      <img
                        src={profile}
                        className="h-12 w-12 rounded-full object-cover"
                      />

                      <div>
                        <p className="font-medium">{userName}</p>
                        <p className="text-sm text-neutral-500">{userEmail}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex cursor-pointer w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-100"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>

                    <button
                      onClick={handleLogoutAll}
                      className="flex cursor-pointer w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                    >
                      <FaSignOutAlt />
                      Logout All Devices
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Show Login if not logged in */}
                  <div
                    className="user-menu-item login-btn"
                    onClick={() => {
                      navigate("/login");
                      setShowUserMenu(false);
                    }}
                  >
                    <FaSignInAlt className="menu-item-icon" />
                    <span>Login</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;
