# Forezy Backend

Backend API for the Forezy project developed with Node.js, TypeScript, and Express using Hexagonal Architecture.

## 🚀 Features

- **Hexagonal Architecture** with Clean Architecture principles
- TypeScript for type safety and better development experience
- Express server with security configuration (CORS, Helmet, Morgan)
- Supabase integration for database operations
- Cavos Wallet Provider integration for blockchain wallet creation
- Centralized error handling and dependency injection
- Environment variables configuration
- Modular and scalable structure

## 🏗️ Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** principles:

- **Domain Layer**: Pure business logic and entities
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External adapters (database, web, external services)

For detailed architecture documentation, see [ARCHITECTURE.md](.cursor/rules/ARCHITECTURE.md).

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account and project
- Cavos API key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forezy-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit the .env file with your configurations
```

### Required Environment Variables

```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CAVOS_API_KEY=your_cavos_api_key
```

## 🏃‍♂️ Execution

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 Available Endpoints

### Base Endpoints
- `GET /` - API information and version
- `GET /health` - Server health status
- `GET /docs` - Swagger UI documentation
- `GET /docs/swagger.json` - Swagger JSON specification

### User Management
- `POST /v1/api/users/register` - Register a new user and deploy wallet
- `POST /v1/api/users/login` - Login user with Cavos authentication
- `DELETE /v1/api/users/{address}` - Delete user account
- `GET /v1/api/users/{address}/balance` - Get user's STRK balance
- `GET /v1/api/users/{address}/shares` - Get user's shares/bets with pagination

### Market Management
- `GET /v1/api/markets` - Get all markets
- `GET /v1/api/markets/{id}` - Get market by ID

### Example API Responses

#### Base API Response
```json
{
  "message": "Welcome to Forezy Backend API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testing

```bash
npm test
```

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI. You can access the interactive documentation at:

- **Swagger UI**: `http://localhost:3000/docs`
- **Swagger JSON**: `http://localhost:3000/docs/swagger.json`

The documentation includes:
- All available endpoints with detailed descriptions
- Request/response schemas and examples
- Error responses and status codes
- Authentication requirements
- Query parameters and path variables

## 🔧 Development Tools

### Linting
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
npm run build
```

## 📁 Project Structure

```
forezy-backend/
├── src/
│   ├── domain/              # Business logic and entities
│   │   ├── entities/        # Domain entities (Wallet)
│   │   ├── repositories/    # Repository interfaces
│   │   └── services/        # Domain services
│   ├── application/         # Use cases and DTOs
│   │   ├── use-cases/       # Application use cases
│   │   └── dto/            # Data transfer objects
│   ├── infrastructure/      # External adapters
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database adapters
│   │   ├── external/       # External services
│   │   ├── web/            # Web controllers and routes
│   │   └── container.ts    # Dependency injection
│   ├── shared/             # Shared types and errors
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── nodemon.json           # Development configuration
└── README.md              # Project documentation
```

## 🔧 Available Scripts

- `npm start` - Starts the server in production mode
- `npm run dev` - Starts the server in development mode with hot reload
- `npm run build` - Compiles TypeScript to JavaScript
- `npm test` - Runs the test suite
- `npm run lint` - Runs ESLint for code quality
- `npm run lint:fix` - Fixes auto-fixable linting issues

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Morgan**: HTTP request logging
- **Input validation**: Request data validation
- **Error handling**: Centralized error management

## 🔄 Dependencies

### Production Dependencies
- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `cavos-service-sdk` - Cavos wallet service
- `starknet` - StarkNet integration
- `cors`, `helmet`, `morgan` - Security and logging middleware

### Development Dependencies
- `typescript` - TypeScript compiler
- `nodemon` - Development server with hot reload
- `eslint` - Code linting
- `jest` - Testing framework
- `@types/*` - TypeScript type definitions

## 📝 License

MIT

## 👥 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 