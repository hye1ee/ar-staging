// vite.config.ts
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    mkcert({ certFileName: './localhost.pem', keyFileName: './localhost-key.pem' })
  ],
  publicDir: "public",
  server: {
    port: 3000,
    https: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
});
