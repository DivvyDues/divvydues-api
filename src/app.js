require("dotenv").config();
const fastify = require("fastify")({ logger: true });

// Register Core plugins
fastify.register(require("@fastify/helmet", { global: true }));
fastify.register(require("@fastify/cookie"));
fastify.register(require("@fastify/session"), {
  cookie: { secure: false }, //TODO mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
});
fastify.register(require("@fastify/csrf-protection"), {
  sessionPlugin: "@fastify/session",
});

// Register Custom Plugins
fastify.register(require("./plugins/fastify-argon2"));
fastify.register(require("./plugins/fastify-prisma"));

// Register Decorators
fastify.register(require("./plugins/decorators/authentication"));
fastify.register(require("./plugins/decorators/authorization"));

// Register Hooks

// Register Routes
fastify.register(require("./routes/healthcheck"));
fastify.register(require("./routes/authentication"));
fastify.register(require("./routes/expenseSheets/expenseSheetsCategories"));
fastify.register(require("./routes/expenseSheets/expenseSheets"));

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
