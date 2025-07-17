import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Forezy API',
    version: '1.0.0',
    description: 'Forezy API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
    {
      url: 'https://forezy-backend.vercel.app/',
      description: 'Production server (Vercel)',
    },
  ],
  components: {
    schemas: {
      MarketResponseDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          description: { type: 'string' },
          creatorId: { type: 'string' },
          status: { type: 'string' },
          resolutionTime: { type: 'string', format: 'date-time' },
          sourceOfTruth: { type: 'string', nullable: true },
          resultOption: { type: 'string', nullable: true },
          onchainAddress: { type: 'string', nullable: true },
          createTms: { type: 'string', format: 'date-time' }
        }
      },
      MarketListResponseDto: {
        type: 'object',
        properties: {
          markets: {
            type: 'array',
            items: { $ref: '#/components/schemas/MarketResponseDto' }
          },
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
          hasMore: { type: 'boolean' }
        }
      },
      MarketErrorResponseDto: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      CreateWalletRequestDto: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          network: { type: 'string' }
        },
        required: ['user_id']
      },
      CreateWalletResponseDto: {
        type: 'object',
        properties: {
          public_key: { type: 'string' },
          private_key: { type: 'string' },
          address: { type: 'string' }
        }
      },
      RegisterUserErrorResponseDto: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  // Rutas a los archivos donde están los endpoints documentados
  apis: [
    './src/infrastructure/web/controllers/*.ts',
    './src/infrastructure/web/routes/*.ts',
    './src/application/dto/*.ts',
    './src/infrastructure/web/server.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 