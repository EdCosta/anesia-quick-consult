import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: '::',
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('react-router-dom') || id.includes('@tanstack')) {
            return 'react-vendor';
          }
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }
          if (
            id.includes('lucide-react') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority') ||
            id.includes('sonner') ||
            id.includes('vaul')
          ) {
            return 'ui-vendor';
          }
          if (id.includes('fuse.js')) {
            return 'search-vendor';
          }
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod')
          ) {
            return 'form-vendor';
          }
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          return 'vendor';
        },
      },
    },
  },
}));
