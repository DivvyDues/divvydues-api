export default async function (fastify, options) {
  fastify.patch(
    "/",
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
}
