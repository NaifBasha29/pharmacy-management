import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  // Load env variables so the dev proxy can respect VITE_API_URL when present
  const env = loadEnv(mode, process.cwd(), "");
  // VITE_API_URL may include a trailing /api. The proxy target must be the host
  // (without the /api suffix). Fall back to the previous render host if empty.
  const apiBase = env.VITE_API_URL || "";
  const proxyTarget = apiBase.replace(/\/api\/?$/i, "") || "https://pharmacy-management-qss1.onrender.com";

  return defineConfig({
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          // In some dev setups with HTTPS backends, disabling strict SSL helps.
          secure: false,
        },
      },
    },
  });
};
