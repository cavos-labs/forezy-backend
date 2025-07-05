import { createServer } from './infrastructure/web/server';
import { Container } from './infrastructure/container';

const container = Container.getInstance();
const config = container.getConfig();
const app = createServer();

if (process.env['NODE_ENV'] !== 'production' && process.env['VERCEL'] !== '1') {
  app.listen(config.port, () => {
    console.log(`🚀 Forezy Backend server running on port ${config.port}`);
    console.log(`📱 API available at: http://localhost:${config.port}`);
    console.log(`🏗️  Hexagonal Architecture implemented`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });
}

export default app; 