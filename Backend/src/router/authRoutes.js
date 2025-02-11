import { Router } from 'express';
import { register, login, getAllUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();

router.get('/', (req, res) => {
    res.send("Bienvenido")
})

router.post('/auth/register', register);

router.post('/auth/login', login);

router.get('/users', authenticateToken, getAllUsers);

export default router;
