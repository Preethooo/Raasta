import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  // Lets a tunnel URL (for testing on a phone) reach `vite preview`.
  preview: { allowedHosts: ['.loca.lt'] },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
