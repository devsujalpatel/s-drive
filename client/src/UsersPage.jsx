import { useState } from "react";
import "./UsersPage.css";
import { useEffect } from "react";


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const logoutUser = (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isLoggedIn: false } : user,
      ),
    );
  };

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const response = await fetch(`${BASE_URL}/admin/users`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Error fetching users:", response.statusText)
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchAllUsers();
  }, []);

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th> {/* Logout button column */}
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
  );
}
