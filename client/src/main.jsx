import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadProvider } from "./context/UploadContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UploadProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </UploadProvider>
    </BrowserRouter>
  </StrictMode>
);
