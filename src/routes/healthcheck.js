async function healthCheckRoutes(fastify, options) {
  fastify.get("/healthcheck", async (request, reply) => {
    return { message: "Success" };
  });
}

module.exports = healthCheckRoutes;
