import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <DirectoryView />,
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
      </ThemeProvider>
    </>
  );
};

export default App;
