import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    // exclude: ['@kaoniqiwa/my-trina'],
  },
});
