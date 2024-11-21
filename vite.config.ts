// vite.config.ts
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import path from "path"

export default defineConfig({
  plugins: [
    mkcert({ certFileName: './localhost.pem', keyFileName: './localhost-key.pem' })
  ],
  publicDir: "public",
  server: {
    port: 3000,
    https: false as any,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "./src"), // `@`를 `src/`로 설정
    },
  },
});
