module.exports = async function (fastify, options) {
  fastify.post(
    "/expense-sheets",
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
    "/expense-sheets",
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

  fastify.patch(
    "/expense-sheets/:expenseSheetId/members",
    {
      onRequest: [
        fastify.verifyUserSession,
        fastify.csrfProtection,
        fastify.verifyUserIsExpenseSheetMember,
      ],
    },
    async (request, reply) => {
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
        if (error.code === "P2025") {
          reply.status(400).send({ error: "Invalid members provided" });
        } else {
          reply.status(500).send({ error });
        }
      }
    }
  );
};
