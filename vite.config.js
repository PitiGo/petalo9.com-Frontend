import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// El proyecto venía de Create React App: todos los componentes usan JSX dentro
// de archivos .js y leen la API desde process.env.REACT_APP_API_URL. Esta
// configuración mantiene ambas convenciones para no tener que reescribir el
// código ni el pipeline de despliegue (Docker/GitHub Actions siguen usando la
// variable REACT_APP_API_URL y la carpeta de salida "build").
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    // Permite que los .env y las variables del entorno con prefijo REACT_APP_
    // sigan funcionando igual que en CRA.
    envPrefix: 'REACT_APP_',
    define: {
      // Shims para el código heredado que usa process.env.*
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || ''),
      'process.env.PUBLIC_URL': JSON.stringify(''),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
    },
    esbuild: {
      // Trata los .js como .jsx para soportar JSX en archivos .js (estilo CRA).
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' }
      }
    },
    server: {
      port: 3000,
      open: true
    },
    build: {
      // CRA generaba en "build/"; lo mantenemos para no tocar Docker/Nginx/CI.
      outDir: 'build',
      sourcemap: false,
      chunkSizeWarningLimit: 2000
    }
  };
});
