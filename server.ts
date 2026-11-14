import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { openDatabase, seedDatabase } from './server/db/database';
import { createApiRouter } from './server/routes/api';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  const db = openDatabase();
  const seedResult = seedDatabase(db);
  console.log(
    `[DuckOJ] Database ready (${seedResult.skipped ? 'cached' : 'seeded'}: ${JSON.stringify(seedResult.stats)})`
  );

  const app = express();

  // Security headers (§11)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, service: 'duckoj' });
  });

  app.get('/readyz', (_req, res) => {
    try {
      const row = db.prepare('SELECT COUNT(*) AS c FROM lessons').get() as { c: number };
      res.json({ ok: row.c === 74, lessons: row.c });
    } catch (err) {
      res.status(503).json({ ok: false, error: err instanceof Error ? err.message : 'db_error' });
    }
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n');
  });

  app.get('/sitemap.xml', (_req, res) => {
    const lessons = db.prepare("SELECT slug FROM lessons WHERE status = 'published'").all() as { slug: string }[];
    const urls = [
      '/',
      '/roadmap',
      '/learn',
      '/problems',
      '/contests',
      ...lessons.map((l) => `/learn/${l.slug}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join('\n')}\n</urlset>`;
    res.type('application/xml').send(xml);
  });

  app.use('/api/v1', createApiRouter(db));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DuckOJ] Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[DuckOJ] Fatal startup error:', err);
  process.exit(1);
});
