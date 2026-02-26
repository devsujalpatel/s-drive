import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <DirectoryView />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
