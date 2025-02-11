import { authService } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await authService.login(email, password);

    if (!result) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Login exitoso',
      token: result.token,
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json({
      message: 'Usuarios encontrados',
      users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
  }
};

