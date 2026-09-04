import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// root = app/ ; static source = app/public/ (dev and prod share the same URL semantics).
// Build goes to an untrusted staging dir; scripts/publish-build.mjs promotes it to the
// repo root only after verification, with rollback. Never point outDir at the repo root.
export default defineConfig({
  root: 'app',
  plugins: [react()],
  build: {
    outDir: '../build-stage',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020',
  },
});
