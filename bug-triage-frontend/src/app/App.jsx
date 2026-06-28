import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { BugProvider } from "./contexts/BugContext";
import { router } from "./routes";

export default function App() {
  return (
    <BugProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </BugProvider>
  );
}
