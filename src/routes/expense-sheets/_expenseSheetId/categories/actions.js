//TODO Add validation schema
export default async function (fastify, options) {
  fastify.post(
    "/",
    {
      onRequest: [
        fastify.verifyUserSession,
        fastify.csrfProtection,
        fastify.verifyUserIsExpenseSheetMember,
      ],
    },
    async (request, reply) => {
      const { name } = request.body;

      try {
        const expenseSheetCategory =
          await fastify.prisma.expenseSheetCategory.create({
            data: {
              name,
              expenseSheet: {
                connect: {
                  id: parseInt(request.params.expenseSheetId),
                },
              },
            },
          });

        return expenseSheetCategory;
      } catch (error) {
        return reply.internalServerError();
      }
    }
  );

  fastify.get(
    "/",
    {
      onRequest: [
        fastify.verifyUserSession,
        fastify.csrfProtection,
        fastify.verifyUserIsExpenseSheetMember,
      ],
    },
    async (request, reply) => {
      try {
        const categories = await fastify.prisma.expenseSheetCategory.findMany({
          where: {
            expenseSheetId: parseInt(request.params.expenseSheetId),
          },
        });
        return categories;
      } catch (error) {
        return reply.internalServerError();
      }
    }
  );
}
