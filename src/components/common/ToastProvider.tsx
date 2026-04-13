"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#101722",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0.75rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
        },
        success: {
          style: {
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          },
          icon: "✅",
        },
        error: {
          style: {
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          },
          icon: "❌",
        },
        loading: {
          style: {
            background: "rgba(13, 108, 242, 0.1)",
            color: "#0d6cf2",
            border: "1px solid rgba(13, 108, 242, 0.3)",
          },
        },
      }}
    />
  );
}
