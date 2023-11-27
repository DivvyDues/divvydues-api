//TODO Add schema validation for endpoints

async function expenseSheetRoutes(fastify, options) {
  // Create Expense Sheet
  fastify.post(
    "/expense-sheets",
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
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

        return expenseSheet;
      } catch (error) {
        reply.status(500).send({ error: error.message });
      }
    }
  );

  // List Expense Sheets
  fastify.get(
    "/expense-sheets",
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
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

  // Add Members to Expense Sheet
  fastify.patch(
    "/expense-sheets/:expenseSheetId/members",
    {
      onRequest: fastify.auth(
        [fastify.verifyUserSession, fastify.verifyUserExpenseSheetMembership],
        {
          relation: "and",
          run: "all",
        }
      ),
    },
    async (request, reply) => {
      const userId = request.session.user.id;
      const { expenseSheetId } = request.params;
      const { memberIds } = request.body;

      try {
        const updatedExpenseSheet = await fastify.prisma.expenseSheet.update({
          where: { id: parseInt(expenseSheetId) },
          data: {
            members: {
              connect: memberIds.map((userId) => ({ id: userId })),
            },
          },
        });

        return updatedExpenseSheet;
      } catch (error) {
        reply.status(500).send({ error: error.message });
      }
    }
  );
}

module.exports = expenseSheetRoutes;
