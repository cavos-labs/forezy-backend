import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class SupabaseUserRepository implements UserRepository {
  constructor(private supabase: SupabaseClient) { }

  async findByUserId(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('user_id_cavos', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id_cavos,
      email: data.email,
      address: data.address,
      ...(data.created_at && { createdAt: new Date(data.created_at) })
    };
  }

  async createUser(user: User, publicKey: string, privateKey: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        public_key: publicKey,
        encripted_private_key: privateKey,
        user_id_cavos: user.userId,
        email: user.email,
        address: user.address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return {
      id: data.id,
      ...(data.created_at && { createdAt: new Date(data.created_at) })
    };
  }

  async findByAddress(address: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('address', address)
      .maybeSingle();


    if (error) {
      throw new Error(`Error fetching wallet by address: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id_cavos,
      publicKey: data.public_key,
      encryptedPrivateKey: data.encripted_private_key,
      address: data.address,
      ...(data.created_at && { createdAt: new Date(data.created_at) })
    };
  }

  async deleteUserById(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('User ID is required for deletion');
    }
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

export * from './SupabaseUserRepository';
