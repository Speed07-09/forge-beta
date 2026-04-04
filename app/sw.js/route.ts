import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function resolveBuildId(): string {
  if (process.env.VERCEL_DEPLOYMENT_ID) return process.env.VERCEL_DEPLOYMENT_ID
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  if (process.env.FORGE_BUILD_ID) return process.env.FORGE_BUILD_ID
  try {
    return readFileSync(join(process.cwd(), '.next', 'BUILD_ID'), 'utf8').trim()
  } catch {
    return 'development'
  }
}

function sanitizeCacheSegment(id: string): string {
  const s = id.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-')
  return s.slice(0, 64) || 'default'
}

function serviceWorkerSource(cacheName: string): string {
  return `const CACHE_NAME = '${cacheName}';

const urlsToCache = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/app-icon.png',
  '/manifest.json',
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
`
}

export async function GET() {
  const buildId = resolveBuildId()
  const cacheName = `forge-${sanitizeCacheSegment(buildId)}`
  const body = `// FORGE build: ${buildId}\n${serviceWorkerSource(cacheName)}`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  })
}
