import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        // target: "https://makgorabackend-makgora.up.railway.app",   // ⭐ 백엔드 스프링부트 주소
        target: "http://localhost:8080",   // ⭐ 백엔드 스프링부트 주소
        changeOrigin: true,
        secure: false,
      },
      // 🔥 추가: /uploads 경로도 백엔드로 프록시
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})