import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(() => {
  const port = Number(process.env.PORT ?? '') || 3000;

  return {
    server: {
      host: "::",
      port,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'web3-vendor': ['wagmi', 'viem'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'utils-vendor': ['sonner'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable minification with esbuild (faster than terser)
      minify: 'esbuild',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
