/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import fs from 'node:fs/promises';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envFile = loadEnv(mode, process.cwd());
  const env = { ...process.env, ...envFile };

  const isDevelopmentMode = mode === 'development';
  const { VITE_LEGACY_BROWSER_SUPPORT, VITE_GENERATE_SOURCEMAP } = env;
  const isLegacyBrowserSupportEnabled = VITE_LEGACY_BROWSER_SUPPORT === 'true';
  const generateSourceMap = VITE_GENERATE_SOURCEMAP === 'true';

  return {
    define: isDevelopmentMode ? { global: {} } : { process: {} },
    plugins: [
      commonjs({}),
      react({}),
      isLegacyBrowserSupportEnabled &&
        legacy({
          targets: ['defaults', 'fully supports es6-module', '>0.3%', 'not dead'],
        }),
    ],
    build: {
      sourcemap: generateSourceMap,
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
      supported: {
        'top-level-await': true,
      },
    },
    server: {
      port: env.VITE_PORT || 5173,
      fs: {
        strict: true,
      },
    },
    resolve: {
      alias: isDevelopmentMode
        ? []
        : [{ find: 'moment', replacement: 'moment/min/moment-with-locales.min' }],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'load-js-files-as-jsx',
            setup(build) {
              build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8'),
              }));
            },
          },
        ],
      },
    },
  };
});
