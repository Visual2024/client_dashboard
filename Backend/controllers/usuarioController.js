const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/usuarios', async (req, res) => {
  const usuarios = await prisma.usuario.findMany();
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  const { nombre, email } = req.body;
  const nuevoUsuario = await prisma.usuario.create({
    data: { nombre, email },
  });
  res.json(nuevoUsuario);
});