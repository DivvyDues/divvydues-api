const fastify = require("fastify")({ logger: true });
const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");
const fastifyAuth = require("@fastify/auth");

const fastifyArgon2Plugin = require("./plugins/fastify-argon2");
const fastifyPrismaPlugin = require("./plugins/fastify-prisma");

const expenseSheetRoutes = require("./routes/expenseSheets");
const healthCheckRoutes = require("./routes/healthcheck");
const authenticationRoutes = require("./routes/authentication");
const categoryRoutes = require("./routes/categories");
const expenseRoutes = require("./routes/expenses");

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  cookie: { secure: false }, //TODO mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
});

fastify.register(fastifyAuth);

// Auth decorators
fastify.decorate("verifyUserSession", function (request, reply, done) {
  //TODO Check if there are possible security risk (like a user session reuse after destroy)
  if (!request.session.user) {
    return done(new Error("Not authenticated"));
  }
  done();
});

// Register Custom Plugins
fastify.register(fastifyArgon2Plugin);
fastify.register(fastifyPrismaPlugin);

// Register Routes
fastify.register(healthCheckRoutes);
fastify.register(authenticationRoutes);
fastify.register(categoryRoutes);
fastify.register(expenseSheetRoutes);
fastify.register(expenseRoutes);

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
