const fastify = require("fastify")({ logger: true });
const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");

const fastifyArgon2Plugin = require("./plugins/fastify-argon2");
const fastifyPrismaPlugin = require("./plugins/fastify-prisma");

const authenticationDecorators = require("./plugins/decorators/authentication");
const authorizationDecorators = require("./plugins/decorators/authorization");

const expenseSheetRoutes = require("./routes/expenseSheets");
const healthCheckRoutes = require("./routes/healthcheck");
const authenticationRoutes = require("./routes/authentication");
const categoryRoutes = require("./routes/categories");

// Register Core plugins
fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  cookie: { secure: false }, //TODO mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
});

// Register Custom Plugins
fastify.register(fastifyArgon2Plugin);
fastify.register(fastifyPrismaPlugin);

// Register Decorators
fastify.register(authenticationDecorators);
fastify.register(authorizationDecorators);

// Register Hooks

// Register Routes
fastify.register(healthCheckRoutes);
fastify.register(authenticationRoutes);
fastify.register(categoryRoutes);
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
