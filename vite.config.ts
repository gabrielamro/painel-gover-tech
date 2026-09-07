import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: '/',
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
    },
    build: {
      rollupOptions: {
        input: { index: 'react-index.html' },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('node_modules/@dnd-kit')) {
              return 'vendor-dnd';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'vendor-charts';
            }
          },
        },
      },
      outDir: 'react-dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 800,
    },
  };
});
