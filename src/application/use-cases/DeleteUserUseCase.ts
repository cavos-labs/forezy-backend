import { CavosWalletProvider } from '../../infrastructure/external/CavosWalletProvider';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class DeleteUserUseCase {
  constructor(
    private cavosWalletProvider: CavosWalletProvider,
    private userRepository: UserRepository
  ) { }

  async execute(id: string, userId: string): Promise<{ message: string }> {
    try {
      await this.userRepository.deleteUserById(id);
      await this.cavosWalletProvider.deleteUser(userId);
    } catch (error) {
      throw error;
    }
    return {
      message: 'User deleted from Forezy',
    };
  }
} 