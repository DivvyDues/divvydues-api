export default async function (fastify, options) {
  fastify.post(
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
      const { expenseSheetId } = request.params;
      const {
        description,
        amount,
        expenseSheetCategoryId,
        date,
        payerId,
        beneficiaryIds,
      } = request.body;

      try {
        // Create the new expense
        const newExpense = await fastify.prisma.expense.create({
          data: {
            description,
            amount,
            expenseSheetCategory: {
              connect: { id: parseInt(expenseSheetCategoryId) },
            },
            date: new Date(date),
            payer: { connect: { id: payerId } },
            expenseSheet: { connect: { id: parseInt(expenseSheetId) } },
            beneficiaries: {
              connect: beneficiaryIds.map((id) => ({ id })),
            },
          },
        });

        return newExpense;
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
      const { expenseSheetId } = request.params;

      try {
        const expenses = await fastify.prisma.expense.findMany({
          where: { expenseSheetId: parseInt(expenseSheetId) },
          include: {
            beneficiaries: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        return expenses;
      } catch (error) {
        return reply.internalServerError();
      }
    }
  );
}
