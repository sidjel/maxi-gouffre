import { defineConfig, devices } from '@playwright/test';

// Tests navigateur : la version construite (vite build) servie par vite preview.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173/', trace: 'off' },
  webServer: {
    command: 'npx vite build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [
    { name: 'pc', use: { viewport: { width: 1920, height: 1080 } } },
    { name: 'pc-petit', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'telephone', use: { ...devices['Pixel 7 landscape'] } },
  ],
});
