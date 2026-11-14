import { defineConfig } from 'vite';
import { copyFile, mkdir } from 'node:fs/promises';
import pages from './src/pages.json' with { type: 'json' };
import { pagePath } from './src/routes.js';

const apiProxy = {
  target: 'http://127.0.0.1:3001',
  configure(proxy) {
    proxy.on('error', (_error, _request, response) => {
      if (response && 'writeHead' in response && !response.headersSent) {
        response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: 'The local API is unavailable. Start the API and MongoDB, then try again.' }));
      }
    });
  },
};
export default defineConfig({
  server: { proxy: { '/api': apiProxy } },
  preview: { proxy: { '/api': apiProxy } },
  plugins: [{
    name: 'static-page-entries',
    async writeBundle() {
      for (const entry of ['business/join','business/sign-in','business/dashboard']) { await mkdir(`dist/${entry}`, { recursive: true }); await copyFile('dist/index.html', `dist/${entry}/index.html`); }
      await Promise.all([...Object.keys(pages), 'profile', 'notifications', 'saved'].map(async (slug) => {
        const directory = `dist${pagePath(slug)}`;
        await mkdir(directory, { recursive: true });
        await Promise.all([
          copyFile('dist/index.html', `${directory}/index.html`),
          copyFile('dist/index.html', `dist/${slug}.html`),
        ]);
      }));
    },
  }],
});
