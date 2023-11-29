module.exports = async function (fastify, options) {
  fastify.get("/healthcheck", async (request, reply) => {
    return "OK";
  });
};
