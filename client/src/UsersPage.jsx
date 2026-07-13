import { useState } from "react";
import "./UsersPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
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
    fetchAllUsers();
  }, []);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="users-container">
          <h1 className="title">All Users</h1>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
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
                      disabled={!user.isLoggedIn}
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
