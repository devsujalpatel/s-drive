import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
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
    path: "/users",
    element: <UsersPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
