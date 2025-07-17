import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { Container } from '../../container';


const router = Router();

// Get dependencies from container
const container = Container.getInstance();
const registerUserUseCase = container.getRegisterUserUseCase();
const loginUserUseCase = container.getLoginUserUseCase();
const deleteUserUseCase = container.getDeleteUserUseCase();
const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  deleteUserUseCase,
  container.getSupabaseUserRepository(),
  container.getBetRepository()
);

// POST /api/users/register
router.post('/register', (req, res) => userController.registerUser(req, res));
// POST /api/users/login
router.post('/login', (req, res) => userController.loginUser(req, res));
// GET /api/users/:address/balance
router.get('/:address/balance', (req, res) => userController.getUserBalance(req, res));

// GET /api/users/:address/shares
router.get('/:address/shares', (req, res) => userController.getUserShares(req, res));

// DELETE /api/users/:address
router.delete('/:address', (req, res) => userController.deleteUser(req, res));

export default router; 