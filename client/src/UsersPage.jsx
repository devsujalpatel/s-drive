import { useState } from "react";
import "./UsersPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/axios";
import { showErrorToast } from "./lib/errorToast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [deletingUserSoft, setDeletingUserSoft] = useState("");
  const [deletingUserHard, setDeletingUserHard] = useState("");
  const [userRecovering, setUserRecovering] = useState("");
  const [userName, setUserName] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const logoutUser = async (userId) => {
    try {
      await api.post("/admin/logout", {
        userId,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isLoggedIn: false } : user,
        ),
      );
    } catch (error) {
      showErrorToast(error, "Failed to log out user");
    }
  };
  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      showErrorToast(error, "Failed to delete user");
    }
  };
  const hardDeleteUser = async (userId) => {
    try {
      await api.delete(`/owner/users/${userId}/hard`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      showErrorToast(error, "Failed to permanently delete user");
    }
  };
  const recoverUser = async (userId) => {
    try {
      await api.post(`/owner/users/${userId}/recover`);
      fetchAllUsers();
    } catch (error) {
      showErrorToast(error, "Failed to recover user");
    }
  };

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get("/admin/users");

      setUsers(data);
    } catch (error) {
      showErrorToast(error, "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/user");

      setUserRole(data.role);
      setUserName(data.name);
      setCurrentUserId(data.id);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        setUserRole("");
        setUserName("");
        setCurrentUserId(null);
        return;
      }

      showErrorToast(error, "Failed to fetch user info");
    }
  };

  const canLogout = (targetUser) => {
    if (!targetUser.isLoggedIn) return false;
    if (String(targetUser.id) === String(currentUserId)) return false;
    if (targetUser.role === "OWNER") return false;

    if (userRole === "OWNER") return true;

    if (userRole === "ADMIN" || userRole === "MANAGER") {
      return targetUser.role !== "ADMIN";
    }

    return false;
  };

  const canRecover = (targetUser) => {
    if (userRole !== "ADMIN" && userRole !== "OWNER") return false;
    if (targetUser.role === "OWNER") return false;
    if (String(targetUser.id) === String(currentUserId)) return false;
    if (!targetUser.isDeleted) return false;

    return true;
  };

  const canDelete = (targetUser) => {
    if (userRole !== "ADMIN" && userRole !== "OWNER") return false;
    if (targetUser.role === "OWNER") return false;
    if (String(targetUser.id) === String(currentUserId)) return false;

    return true;
  };

  const canSoftDelete = (targetUser) => {
    if (userRole !== "ADMIN" && userRole !== "OWNER") return false;
    if (targetUser.role === "OWNER") return false;
    if (String(targetUser.id) === String(currentUserId)) return false;
    if (targetUser.isDeleted) return false;

    return true;
  };

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

  const handleRecoverUser = async (userId) => {
    setUserRecovering(userId);
  };

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="min-h-screen bg-neutral-100 py-10">
          <div className="mx-auto max-w-7xl px-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                  User Management
                </h1>
                <p className="mt-2 text-neutral-500">
                  Manage users, sessions, and account permissions.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Logged in as
                </p>

                <p className="mt-1 text-lg font-semibold">{userName}</p>

                <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Session</th>

                    {(userRole === "ADMIN" || userRole === "OWNER") && (
                      <th className="px-6 py-4">Soft Delete</th>
                    )}

                    {userRole === "OWNER" && (
                      <th className="px-6 py-4">Hard Delete</th>
                    )}

                    {userRole === "OWNER" && (
                      <th className="px-6 py-4">Recover</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-neutral-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-neutral-100 transition hover:bg-neutral-50"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-neutral-900">
                                {user.name}
                              </p>

                              <p className="text-sm text-neutral-500">
                                {user.role}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-5 text-neutral-600">
                          {user.email}
                        </td>

                        {/* Login Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.isLoggedIn
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.isLoggedIn ? "Online" : "Offline"}
                          </span>
                        </td>

                        {/* Logout */}
                        <td className="px-6 py-5">
                          <button
                            onClick={() => logoutUser(user.id)}
                            disabled={!canLogout(user)}
                            className="rounded-lg border border-neutral-400/20 ring-1 ring-neutral-300/20 px-4 py-2 text-sm font-medium transition hover:bg-neutral-200 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-20 cursor-pointer"
                          >
                            Logout
                          </button>
                        </td>

                        {/* Soft Delete */}
                        {(userRole === "ADMIN" || userRole === "OWNER") && (
                          <td className="px-6 py-5">
                            <button
                              onClick={() => handleDeleteSoft(user.id)}
                              disabled={!canSoftDelete(user)}
                              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            >
                              Soft Delete
                            </button>
                          </td>
                        )}

                        {/* Hard Delete */}
                        {userRole === "OWNER" && (
                          <td className="px-6 py-5">
                            <button
                              onClick={() => handleHardDeleteUser(user.id)}
                              disabled={!canDelete(user)}
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        )}

                        {/* Recover */}
                        {userRole === "OWNER" && (
                          <td className="px-6 py-5">
                            <button
                              onClick={() => handleRecoverUser(user.id)}
                              disabled={!canRecover(user)}
                              className="rounded-lg cursor-pointer bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Recover
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
              Are you sure you want to permanently delete this user? This action{" "}
              <span className="text-red-600 font-bold">cannot be undone.</span>
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
      {userRecovering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-120 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold">Recover User</h2>

            <p className="mb-6">Are you sure you want to recover this user?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserRecovering("")}
                className="rounded border px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await recoverUser(userRecovering);
                  setUserRecovering("");
                }}
                className="rounded bg-blue-600 px-4 py-2 text-white cursor-pointer"
              >
                Recover User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
