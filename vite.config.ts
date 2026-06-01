import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";

  const wsTarget = env.VITE_API_PROXY_TARGET?.includes("railway.app")
    ? "http://127.0.0.1:8000"
    : proxyTarget;

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
        "/did": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: wsTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 550,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (id.includes("firebase")) return "firebase";
            if (id.includes("pdfjs-dist")) return "pdfjs";
            if (id.includes("@tensorflow-models/face-detection")) return "tf-face-model";
            if (id.includes("@tensorflow/tfjs-backend-webgl")) return "tf-webgl";
            if (id.includes("@tensorflow/tfjs-converter")) return "tf-converter";
            if (id.includes("@tensorflow/tfjs-core")) return "tf-core";
            if (id.includes("@tensorflow/tfjs")) return "tfjs";
            if (id.includes("@mediapipe")) return "mediapipe";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("@tanstack/react-query")) return "query";
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("scheduler")
            ) {
              return "react-vendor";
            }
          },
        },
      },
    },
  };
});
