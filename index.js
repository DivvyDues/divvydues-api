const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const argon2Plugin = require('./argon2plugin');

const prisma = new PrismaClient();

//Plugins
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
})

fastify.register(argon2Plugin);

fastify.get('/', async (request, reply) => {
  return { message: "Hello from Fastify!" };
});

// User Registration Endpoint
fastify.post('/register', async (request, reply) => {
  const { username, password } = request.body;

  try {
    const hashedPassword = await fastify.argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return { id: user.id, username: user.username };
  } catch (error) {
    reply.status(500).send({ error: error.message }); //TODO remove backend error messages
  }
});

// User Login Endpoint
fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await fastify.argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }

    const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '1h' });
    return { token };
  } catch (error) {
    reply.status(500).send({ error: error.message }); //TODO remove backend error messages
  }
});

const start = async () => {
  try {
    await fastify.listen(3000);
    console.log(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();