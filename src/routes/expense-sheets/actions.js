export default async function (fastify, options) {
  fastify.post(
    "/",
    { onRequest: [fastify.verifyUserSession, fastify.csrfProtection] },
    async (request, reply) => {
      const { title } = request.body;
      const userId = request.session.user.id;

      try {
        const expenseSheet = await fastify.prisma.expenseSheet.create({
          data: {
            title,
            members: {
              connect: [{ id: userId }],
            },
          },
        });

        // Populate expense sheet with default categories
        const defaultCategory = await fastify.prisma.defaultCategory.findMany();
        for (const category of defaultCategory) {
          await fastify.prisma.expenseSheetCategory.create({
            data: {
              name: category.name,
              expenseSheet: { connect: { id: parseInt(expenseSheet.id) } },
            },
          });
        }

        return expenseSheet;
      } catch (error) {
        reply.status(500).send({ error: error.message });
      }
    }
  );

  fastify.get(
    "/",
    { onRequest: [fastify.verifyUserSession, fastify.csrfProtection] },
    async (request, reply) => {
      const userId = request.session.user.id;

      try {
        const expenseSheets = await fastify.prisma.expenseSheet.findMany({
          where: {
            members: {
              some: {
                id: userId,
              },
            },
          },
        });

        return expenseSheets;
      } catch (error) {
        reply.status(500).send({ error: error.message });
      }
    }
  );
}
