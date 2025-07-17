import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/RegisterUserUseCase';
import { RegisterUserRequestDto, RegisterUserResponseDto, RegisterUserErrorResponseDto } from '../../../application/dto/UserDto';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';
import { LoginUserRequestDto } from '../../../application/dto/UserDto';
import { DeleteUserUseCase } from '../../../application/use-cases/DeleteUserUseCase';
import { getStrkBalance } from '../../../infrastructure/external/starknetBalance';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { SupabaseBetRepository } from '../../../infrastructure/database/SupabaseBetRepository';

function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{63}$/.test(address);
}
export class UserController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private userRepository: UserRepository,
    private betRepository: SupabaseBetRepository
  ) {}

  /**
 * @swagger
 * /v1/api/users/register:
 *   post:
 *     summary: Register a new user and wallet
 *     description: Registers a new user and deploys a wallet.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "user_123"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 address:
 *                   type: string
 *                   example: "0x123..."

 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "email and password are required"
*                 message:
*                   type: string
*                   example: "Missing required fields"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 message:
 *                   type: string
 *                   example: "Unknown error"
 */
  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const requestData: RegisterUserRequestDto = req.body;

      // Validate required fields
      if (!requestData.email || !requestData.password) {
        const errorResponse: RegisterUserErrorResponseDto = {
          error: 'email and password are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Execute use case
      const result: RegisterUserResponseDto = await this.registerUserUseCase.execute(requestData);

      // Return success response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error registering user:', error);
      const errorResponse: RegisterUserErrorResponseDto = {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * @swagger
   * /v1/api/users/login:
   *   post:
   *     summary: Login user with Cavos
   *     description: Authenticates a user using Cavos and returns user and wallet info.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 address:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
      }
      const requestData: LoginUserRequestDto = { email, password };
      const result = await this.loginUserUseCase.execute(requestData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error?.status === 404) {
        res.status(404).json({ error: 'User not found in the database' });
        return;
      }
      if (error?.response?.status === 401) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      console.error('Error logging in user:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /v1/api/users/{address}:
   *   delete:
   *     summary: Delete a user account
   *     description: Deletes a user from Forezy and Cavos Authentication Database.
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Starknet wallet address of the user
   *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cavosResult:
 *                   type: object
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params['address'];
      if (!address) {
        res.status(400).json({ error: 'address is required' });
        return;
      }
      const user = await this.userRepository.findByAddress(address);
      if (!user || !user.id || !user.userId) {
        res.status(404).json({ error: 'User not found in database' });
        return;
      }
      
      const result = await this.deleteUserUseCase.execute(user.id, user.userId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * @swagger
   * /v1/api/users/{address}/balance:
   *   get:
   *     summary: Get user's STRK balance
   *     description: Retrieves the STRK token balance for a given Starknet address.
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Starknet wallet address
   *     responses:
   *       200:
   *         description: Balance retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 address:
   *                   type: string
   *                   example: "0x123..."
   *                 balance:
   *                   type: string
   *                   example: "1000000000000000000"
   *                 token:
   *                   type: string
   *                   example: "STRK"
   *       400:
   *         description: Invalid address format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Invalid address format"
   *       500:
   *         description: Error fetching balance
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Error fetching on-chain balance"
   *                 message:
   *                   type: string
   */
  async getUserBalance(req: Request, res: Response) {
    const { address } = req.params;
    if (!address || !isValidStarknetAddress(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    try {
      const balance = await getStrkBalance(address);
      return res.json({ address, balance, token: 'STRK' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Error fetching on-chain balance', message: err.message });
    }
  }

  /**
   * @swagger
   * /v1/api/users/{address}/shares:
   *   get:
   *     summary: Get user's shares
   *     description: Retrieves all shares/bets for a given user address with pagination.
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Starknet wallet address
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Shares retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 address:
   *                   type: string
   *                   example: "0x123..."
   *                 shares:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       market_id:
   *                         type: string
   *                       outcome:
   *                         type: string
   *                       shares:
   *                         type: string
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     hasMore:
   *                       type: boolean
   *       400:
   *         description: Invalid address format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Invalid address format"
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "User not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   *                 message:
   *                   type: string
   */
  async getUserShares(req: Request, res: Response) {
    const { address } = req.params;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const offset = (page - 1) * limit;
    if (!address || !isValidStarknetAddress(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    try {
      const user = await this.userRepository.findByAddress(address);
      if (!user || !user.id) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { data: shares, total } = await this.betRepository.findSharesByUserId(user.id, limit, offset);
      // Formatear respuesta
      const formatted = shares.map((s: any) => ({
        market_id: s.market_id,
        outcome: s.selected_option,
        shares: s.amount
      }));
      return res.json({
        address,
        shares: formatted,
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + formatted.length < total
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
  }
} 
