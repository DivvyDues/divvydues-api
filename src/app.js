const fastify = require("fastify")({ logger: true });
const { PrismaClient } = require("@prisma/client");
const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");
const fastifyAuth = require("@fastify/auth");

const argon2Plugin = require("./plugins/fastify-argon2");

const expenseSheetRoutes = require("./routes/expenseSheets");
const healthCheckRoutes = require("./routes/healthcheck");

const prisma = new PrismaClient();
fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  cookie: { secure: false }, //TODO mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
});

fastify.register(fastifyAuth);

fastify.decorate("verifyUserSession", function (request, reply, done) {
  //TODO Check if there are possible security risk (like a user session reuse after destroy)
  if (!request.session.user) {
    return done(new Error("Not authenticated"));
  }
  done();
});

fastify.register(argon2Plugin);

fastify.register(healthCheckRoutes);

// User Registration Endpoint
fastify.post("/register", async (request, reply) => {
  const { username, password } = request.body;
  //TODO Add rules for secure passwords

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
fastify.post("/login", async (request, reply) => {
  const { username, password } = request.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await fastify.argon2.verify(user.password, password))) {
      return reply.status(401).send({ error: "Invalid username or password" });
    }

    // Set up user session
    request.session.user = { id: user.id, username: user.username };
    return { message: "Logged in successfully" };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

// User Logout Endpoint
fastify.post("/logout", async (request, reply) => {
  request.session.destroy((err) => {
    if (err) {
      return reply.status(500).send({ error: "Failed to log out" });
    }
    reply.send({ message: "Logged out successfully" });
  });
});

// Register routes
fastify.register(expenseSheetRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 }); //TODO add mechanism to change port for production
    console.log(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
