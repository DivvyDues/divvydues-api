export default async function (fastify, options) {
  fastify.get("/", async (request, reply) => {
    return "OK";
  });
}
