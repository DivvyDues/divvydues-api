const fastify = require("fastify")({ logger: true });

const fastifySession = require("@fastify/session");
const fastifyCookie = require("@fastify/cookie");
const fastifyAuth = require("@fastify/auth");

const argon2Plugin = require("./plugins/fastify-argon2");

const expenseSheetRoutes = require("./routes/expenseSheets");
const healthCheckRoutes = require("./routes/healthcheck");
const authenticationRoutes = require("./routes/authentication");

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
fastify.register(argon2Plugin);

// Register Routes
fastify.register(healthCheckRoutes);
fastify.register(authenticationRoutes);
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
