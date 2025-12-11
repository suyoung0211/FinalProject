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
        target: "https://finalproject-backend-9rdo.onrender.com",   // ⭐ 백엔드 스프링부트 주소
        // target: "http://localhost:8080",   // ⭐ 백엔드 스프링부트 주소
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:8080",   // ⭐ 백엔드 스프링부트 주소 (이미지/동영상 파일)
        changeOrigin: true,
        secure: false,
      }
    }
  }
})