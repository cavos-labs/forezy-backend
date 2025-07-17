# Hexagonal Architecture - Forezy Backend

## General Description

This project implements **Hexagonal Architecture (Ports & Adapters)** using TypeScript, following Clean Architecture and Domain-Driven Design principles. The current implementation focuses on wallet management functionality.

## Project Structure

```
src/
├── domain/                    # 🎯 Domain Layer (Business Core)
│   ├── entities/             # Domain entities
│   │   └── Wallet.ts         # Wallet entity with business rules
│   ├── repositories/         # Repository interfaces (Ports)
│   │   └── WalletRepository.ts
│   └── services/             # Domain services
│       └── WalletService.ts  # Pure business logic
│
├── application/              # 📋 Application Layer (Use Cases)
│   ├── use-cases/           # Application use cases
│   │   └── CreateWalletUseCase.ts
│   └── dto/                 # Data transfer objects
│       └── WalletDto.ts
│
├── infrastructure/           # 🔧 Infrastructure Layer (Adapters)
│   ├── config/              # Configuration
│   │   ├── app.ts           # App configuration
│   │   └── environment.ts   # Environment variables
│   ├── database/            # Database adapters
│   │   ├── SupabaseWalletRepository.ts
│   │   └── supabase.ts
│   ├── external/            # External services
│   │   └── CavosWalletProvider.ts
│   ├── web/                 # Web adapters
│   │   ├── controllers/
│   │   │   └── WalletController.ts
│   │   ├── routes/
│   │   │   └── walletRoutes.ts
│   │   └── server.ts        # Express server setup
│   └── container.ts         # Dependency injection container
│
├── shared/                  # 🔄 Shared code
│   ├── errors/              # Error handling
│   │   └── DomainError.ts
│   └── types/               # Shared types
│       └── ApiResponse.ts
│
└── index.ts                 # Application entry point
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **External Services**: Cavos Wallet Provider
- **Security**: Helmet, CORS, Morgan
- **Development**: Nodemon, ESLint, Jest

## Architecture Principles

### 1. **Separation of Concerns**
- **Domain**: Contains pure business logic, without external dependencies
- **Application**: Orchestrates use cases using the domain
- **Infrastructure**: Implements adapters for external services

### 2. **Dependency Inversion**
- Domain defines interfaces (ports)
- Infrastructure implements those interfaces (adapters)
- Dependencies point towards the domain

### 3. **Framework Independence**
- Domain doesn't know about Express, Supabase, or any framework
- Adapters encapsulate external dependencies

## Main Components

### 🎯 Domain

#### Entities
```typescript
// src/domain/entities/Wallet.ts
export interface Wallet {
  id?: string;
  userIDCavos: string;
  publicKey: string;
  encryptedPrivateKey: string;
  address: string;
  createdAt?: Date;
}

export interface WalletCreationRequest {
  userIDCavos: string;
  network: string;
}

export interface WalletCreationResponse {
  publicKey: string;
  privateKey: string;
  address: string;
}
```

#### Repositories (Ports)
```typescript
// src/domain/repositories/WalletRepository.ts
export interface WalletRepository {
  create(wallet: Wallet): Promise<Wallet>;
  findById(id: string): Promise<Wallet | null>;
  findByuserIDCavos(userIDCavos: string): Promise<Wallet | null>;
  // ... more methods
}
```

#### Domain Services
```typescript
// src/domain/services/WalletService.ts
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}
  
  async createWallet(request: WalletCreationRequest): Promise<WalletCreationResponse> {
    // Domain validations
    // Pure business logic
  }
}
```

### 📋 Application

#### Use Cases
```typescript
// src/application/use-cases/CreateWalletUseCase.ts
export class CreateWalletUseCase {
  constructor(
    private walletService: WalletService,
    private cavosWalletProvider: CavosWalletProvider
  ) {}
  
  async execute(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    // Orchestrates business logic
  }
}
```

### 🔧 Infrastructure

#### Configuration
```typescript
// src/infrastructure/config/environment.ts
export interface Environment {
  NODE_ENV: string;
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CAVOS_API_KEY: string;
}
```

#### Database Adapters
```typescript
// src/infrastructure/database/SupabaseWalletRepository.ts
export class SupabaseWalletRepository implements WalletRepository {
  // Implements repository interface using Supabase
}
```

#### External Services
```typescript
// src/infrastructure/external/CavosWalletProvider.ts
export class CavosWalletProvider {
  // Handles external wallet creation via Cavos API
}
```

#### Web Adapters
```typescript
// src/infrastructure/web/controllers/WalletController.ts
export class WalletController {
  constructor(private createWalletUseCase: CreateWalletUseCase) {}
  
  async createWallet(req: Request, res: Response): Promise<void> {
    // Handles HTTP requests
  }
}
```

#### Dependency Container
```typescript
// src/infrastructure/container.ts
export class Container {
  private static instance: Container;
  
  // Configures all dependencies
  // Implements Singleton pattern
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}
```

## API Endpoints

### Current Endpoints
- `GET /` - API information
- `GET /health` - Server health status
- `POST /v1/api/wallets/create` - Create a new wallet

### API Response Format
```typescript
// src/shared/types/ApiResponse.ts
export interface ApiResponse {
  message?: string;
  version?: string;
  status?: string;
  timestamp: string;
  error?: string;
  data?: any;
}
```

## Environment Configuration

### Required Environment Variables
```bash
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
CAVOS_API_KEY=your_cavos_api_key
```

## Refactoring Benefits

### ✅ **Testability**
- Business logic can be tested in isolation
- Adapters can be easily mocked
- Unit testing without external dependencies

### ✅ **Maintainability**
- Code organized by responsibilities
- Easy to locate functionalities
- Isolated changes by layers

### ✅ **Flexibility**
- Easy to change database (Supabase → PostgreSQL)
- Easy to change web framework (Express → Fastify)
- Easy to add new adapters

### ✅ **Scalability**
- Structure prepared for growth
- New functionalities follow the same pattern
- Clear separation of responsibilities

## Data Flow

```
HTTP Request → Controller → Use Case → Domain Service → Repository → Database
                ↓              ↓           ↓              ↓
              Response ←    Result ←    Business ←    Data
```

## Testing

### Unit Test Example
```typescript
// Domain service test
describe('WalletService', () => {
  let walletService: WalletService;
  let mockRepository: jest.Mocked<WalletRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    walletService = new WalletService(mockRepository);
  });

  it('should create wallet with valid data', async () => {
    // Arrange
    const request = createValidWalletRequest();
    mockRepository.create.mockResolvedValue(createMockWallet());

    // Act
    const result = await walletService.createWallet(request);

    // Assert
    expect(result.address).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Testing
npm test

# Linting
npm run lint
npm run lint:fix
```

This architecture provides a solid and scalable foundation for the Forezy Backend project, with a focus on wallet management and blockchain integration. 