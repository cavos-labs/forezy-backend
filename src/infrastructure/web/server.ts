import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiResponse } from '../../shared/types/ApiResponse';
import walletRoutes from './routes/walletRoutes';
import marketRoutes from './routes/marketRoutes';
// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

export function createServer(): Express {
  const app: Express = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger JSON docs (debe ir antes de la UI)
  app.get('/docs/swagger.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Basic routes
  app.get('/', (_req: Request, res: Response) => {
    const response: ApiResponse = {
      message: 'Welcome to Forezy Backend API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    };
    res.json(response);
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check
   *     description: Returns the status of the API.
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: OK
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  app.get('/health', (_req: Request, res: Response) => {
    const response: ApiResponse = {
      status: 'OK',
      timestamp: new Date().toISOString()
    };
    res.json(response);
  });

  // API routes with v1/api prefix
  app.use('/v1/api/wallets', walletRoutes);
  app.use('/v1/api/markets', marketRoutes);

  // Error handling
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    const response: ApiResponse = {
      error: 'Something went wrong!',
      message: err.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  });

  // 404 route
  app.use('*', (_req: Request, res: Response) => {
    const response: ApiResponse = {
      error: 'Route not found',
      timestamp: new Date().toISOString()
    };
    res.status(404).json(response);
  });

  return app;
} 