import type { FastifyPluginAsync } from 'fastify';
import { exportJson, exportMarkdown } from '../services/export.service';

export const exportRoutes: FastifyPluginAsync = async (app) => {
  app.get('/export/json', { preHandler: app.authenticate }, async (request) => exportJson(request.auth.userId));
  app.get('/export/markdown', { preHandler: app.authenticate }, async (request, reply) => {
    const markdown = await exportMarkdown(request.auth.userId);
    reply.type('text/markdown').send(markdown);
  });
};
