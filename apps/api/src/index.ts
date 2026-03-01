import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { config } from './config';
import { authPlugin } from './plugins/auth';
import { errorHandlerPlugin } from './plugins/error-handler';
import { rateLimitPlugin } from './plugins/rate-limit';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';
import { syncRoutes } from './routes/sync';
import { revisionsRoutes } from './routes/revisions';
import { exportRoutes } from './routes/export';

export async function buildApp() {
  const app = Fastify();
  await app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });
  await app.register(cookie);
  await app.register(rateLimitPlugin);
  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes);
  await app.register(adminRoutes);
  await app.register(syncRoutes);
  await app.register(revisionsRoutes);
  await app.register(exportRoutes);

  return app;
}

if (process.env.VITEST !== 'true') {
  const app = await buildApp();
  app.listen({ port: config.PORT, host: '0.0.0.0' }).catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
}
