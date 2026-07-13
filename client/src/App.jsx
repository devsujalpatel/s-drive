import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import VerifyOtp from "./VerifyOtp";
import Settings from "./Settings";
import UsersPage from "./UsersPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/users",
    element: <UsersPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
