require("dotenv").config(); //TODO Research safer alternatives for production code
const path = require("path");

const fastify = require("fastify")({ logger: true });
const autoload = require("@fastify/autoload");

// Register Core plugins
fastify.register(require("@fastify/helmet", { global: true })); //TODO Set appropriate rules for REST API
fastify.register(require("@fastify/cookie"));
fastify.register(require("@fastify/session"), {
  //TODO Use Redis for production code
  cookie: { secure: false }, //TODO mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
});
fastify.register(require("@fastify/csrf-protection"), {
  sessionPlugin: "@fastify/session",
});

fastify.register(autoload, {
  dir: path.join(__dirname, "plugins"),
});

fastify.register(autoload, {
  dir: path.join(__dirname, "routes"),
  dirNameRoutePrefix: false,
});

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
