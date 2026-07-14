import { useState } from "react";
import "./UsersPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [deletingUserSoft, setDeletingUserSoft] = useState("");
  const [deletingUserHard, setDeletingUserHard] = useState("");
  const [userName, setUserName] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const logoutUser = async (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    try {
      const response = await fetch(`${BASE_URL}/admin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isLoggedIn: false } : user,
          ),
        );
      } else {
        console.error("Error logging out:", response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        console.error("Error Deleting user:", response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const hardDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/hard`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        console.error("Error Hard Deleting user:", response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const canLogout = (targetUser) => {
    if (!targetUser.isLoggedIn) return false;

    // Nobody can logout themselves
    if (targetUser.id === currentUserId) return false;
    if (targetUser.role === "OWNER") return false;

    switch (userRole) {
      case "ADMIN":
      case "MANAGER":
        return targetUser.role !== "ADMIN";

      default:
        return false;
    }
  };

  const canDelete = (targetUser) => {
    if (userRole !== "ADMIN" && userRole !== "OWNER") return false;
    if (targetUser.role === "OWNER") return false;
    if (String(targetUser.id) === String(currentUserId)) return false;

    return true;
  };

  async function fetchAllUsers() {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/admin/users`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401) {
        console.error("Unauthorized: ", response.statusText);
        setIsLoading(false);
        navigate("/");
      } else {
        setIsLoading(false);
        console.error("Error fetching users:", response.statusText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  async function fetchUser() {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Set user info if logged inconst data = await response.json();
        setUserRole(data.role);
        setUserName(data.name);
        setCurrentUserId(data.id);
      } else if (response.status === 401) {
        // User not logged in
        navigate("/login");
        setUserRole("");
        setUserName("");
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  useEffect(() => {
    fetchAllUsers();
    fetchUser();
  }, []);

  const handleDeleteSoft = async (userId) => {
    setDeletingUserSoft(userId);
  };
  const handleHardDeleteUser = async (userId) => {
    setDeletingUserHard(userId);
  };

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="users-container">
          <h1 className="title">All Users</h1>
          <p>
            {userName}: {userRole}
          </p>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
                {(userRole === "ADMIN" || userRole === "OWNER") && (
                  <th>Soft Delete</th>
                )}
                {userRole === "OWNER" && <th>Hard Delete</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
                  <td>
                    <button
                      className="logout-button"
                      onClick={() => logoutUser(user.id)}
                      disabled={!canLogout(user)}
                    >
                      Logout
                    </button>
                  </td>
                  {(userRole === "ADMIN" || userRole === "OWNER") && (
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteSoft(user.id)}
                        disabled={!canDelete(user)}
                      >
                        Soft Delete User
                      </button>
                    </td>
                  )}
                  {userRole === "OWNER" && (
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleHardDeleteUser(user.id)}
                        disabled={!canDelete(user)}
                      >
                        Hard Delete User
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deletingUserSoft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-120 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold">Soft Delete User?</h2>

            <p className="mb-6">This action can only be undone by the Owner.</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingUserSoft("")}
                className="rounded border px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await deleteUser(deletingUserSoft);
                  setDeletingUserSoft("");
                }}
                className="rounded bg-red-600 px-4 py-2 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingUserHard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-120 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold">Hard Delete User?</h2>

            <p className="mb-6">
              Are you sure you want to permanently delete this user? This
              action <span className="text-red-600 font-bold">cannot be undone.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingUserHard("")}
                className="rounded border px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await hardDeleteUser(deletingUserHard);
                  setDeletingUserHard("");
                }}
                className="rounded bg-red-600 px-4 py-2 text-white cursor-pointer"
              >
                Delete User Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
