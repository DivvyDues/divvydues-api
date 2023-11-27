//TODO Add a strategy to which users are allowed to create categories

async function categoryRoutes(fastify, options) {
  fastify.post("/categories", async (request, reply) => {
    const { name } = request.body;

    try {
      const category = await fastify.prisma.category.create({
        data: { name },
      });

      return category;
    } catch (error) {
      reply.status(500).send({ error: error.message }); //TODO remove backend error messages
    }
  });

  fastify.get("/categories", async (request, reply) => {
    try {
      const categories = await fastify.prisma.category.findMany();
      return categories;
    } catch (error) {
      reply.status(500).send({ error: error.message }); //TODO remove backend error messages
    }
  });
}

module.exports = categoryRoutes;
