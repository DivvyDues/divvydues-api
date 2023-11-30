//TODO Add validation schema
export default async function (fastify, options) {
  fastify.put(
    "/",
    {
      onRequest: [
        fastify.verifyUserSession,
        fastify.csrfProtection,
        fastify.verifyUserIsExpenseSheetMember,
      ],
      preHandler: [fastify.verifyPayerAndBeneficiariesAreMembers],
    },
    async (request, reply) => {
      const { expenseId, expenseSheetId } = request.params;
      const {
        description,
        amount,
        expenseSheetCategoryId,
        date,
        payerId,
        beneficiaryIds,
      } = request.body;

      try {
        // Fetch the expense sheet to validate members and payer
        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        // Update the expense
        const updatedExpense = await fastify.prisma.expense.update({
          where: { id: parseInt(expenseId) },
          data: {
            description,
            amount,
            expenseSheetCategory: {
              connect: { id: parseInt(expenseSheetCategoryId) },
            },
            date: new Date(date),
            payer: { connect: { id: payerId } },
            beneficiaries: {
              set: beneficiaryIds.map((id) => ({ id })),
            },
          },
        });

        return updatedExpense;
      } catch (error) {
        return reply.internalServerError();
      }
    }
  );
}
