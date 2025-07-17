import { SupabaseUserRepository } from '../infrastructure/database/SupabaseUserRepository';
import { SupabaseMarketRepository } from './database/SupabaseMarketRepository';
import { CavosWalletProvider } from './external/CavosWalletProvider';
import { MarketService } from '../domain/services/MarketService';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { GetMarketsUseCase } from '../application/use-cases/GetMarketsUseCase';
import { GetMarketByIdUseCase } from '../application/use-cases/GetMarketByIdUseCase';
import { getAppConfig } from './config/app';
import { createSupabaseClient } from './database/supabase';
import { SupabaseBetRepository } from './database/SupabaseBetRepository';
import { LoginUserUseCase } from '../application/use-cases/LoginUserUseCase';
import { DeleteUserUseCase } from '../application/use-cases/DeleteUserUseCase';

export class Container {
  private static instance: Container;
  private config: ReturnType<typeof getAppConfig>;
    private supabaseClient: any;
  private userRepository!: SupabaseUserRepository;
  private marketRepository!: SupabaseMarketRepository;
  private cavosWalletProvider!: CavosWalletProvider;
  private marketService!: MarketService;
  private registerUserUseCase!: RegisterUserUseCase;
  private getMarketsUseCase!: GetMarketsUseCase;
  private getMarketByIdUseCase!: GetMarketByIdUseCase;
  private betRepository!: SupabaseBetRepository;
  private loginUserUseCase!: import('../application/use-cases/LoginUserUseCase').LoginUserUseCase;
  private deleteUserUseCase!: DeleteUserUseCase;

  private constructor() {
    try {
      this.config = getAppConfig();
      this.validateConfig();
      this.initializeDependencies();
    } catch (error) {
      console.error('❌ Error initializing container:', error);
      throw error;
    }
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private validateConfig(): void {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }
    if (!this.config.cavosApiKey) {
      throw new Error('CAVOS_API_KEY is missing');
    }

  }

  private initializeDependencies(): void {
    console.log('🔧 Initializing dependencies...');
    this.supabaseClient = createSupabaseClient(this.config.supabaseUrl, this.config.supabaseKey);
    this.userRepository = new SupabaseUserRepository(this.supabaseClient);
    this.marketRepository = new SupabaseMarketRepository(this.supabaseClient);
    this.betRepository = new SupabaseBetRepository(this.supabaseClient);
    this.cavosWalletProvider = new CavosWalletProvider(this.config.cavosApiKey);
    this.marketService = new MarketService(this.marketRepository);
    this.registerUserUseCase = new RegisterUserUseCase(this.cavosWalletProvider, this.userRepository);
    this.getMarketsUseCase = new GetMarketsUseCase(this.marketService);
    this.getMarketByIdUseCase = new GetMarketByIdUseCase(this.marketService);
    this.loginUserUseCase = new (require('../application/use-cases/LoginUserUseCase').LoginUserUseCase)(this.cavosWalletProvider, this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.cavosWalletProvider, this.userRepository);
    console.log('🎉 All dependencies initialized successfully');
  }

  public getConfig() {
    return this.config;
  }

  public getRegisterUserUseCase(): RegisterUserUseCase {
    return this.registerUserUseCase;
  }

  public getGetMarketsUseCase(): GetMarketsUseCase {
    return this.getMarketsUseCase;
  }

  public getGetMarketByIdUseCase(): GetMarketByIdUseCase {
    return this.getMarketByIdUseCase;
  }

  public getCavosWalletProvider(): CavosWalletProvider {
    return this.cavosWalletProvider;
  }

  public getLoginUserUseCase(): LoginUserUseCase {
    return this.loginUserUseCase;
  }

  public getBetRepository(): SupabaseBetRepository {
    return this.betRepository;
  }

  public getSupabaseUserRepository(): SupabaseUserRepository {
    return this.userRepository;
  }

  public getDeleteUserUseCase(): DeleteUserUseCase {
    return this.deleteUserUseCase;
  }
} 