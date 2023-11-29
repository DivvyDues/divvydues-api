async function healthCheckRoutes(fastify, options) {
  fastify.get("/healthcheck", async (request, reply) => {
    return "OK";
  });
}

module.exports = healthCheckRoutes;
