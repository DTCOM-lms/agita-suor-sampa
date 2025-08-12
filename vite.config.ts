import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react()];
  if (mode === 'development') {
    try {
      const mod = await import('lovable-tagger');
      if (mod?.componentTagger) {
        plugins.push(mod.componentTagger());
      }
    } catch {
      // Plugin opcional; ignora se não estiver instalado
    }
  }
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
