//TODO Add schema validation for endpoints

async function expenseSheetRoutes(fastify, options) {
  // Create Expense Sheet
  fastify.post(
    "/expense-sheets",
    { onRequest: fastify.verifyUserSession },
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

  // List Expense Sheets
  fastify.get(
    "/expense-sheets",
    { onRequest: fastify.verifyUserSession },
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
      onRequest: [
        fastify.verifyUserSession,
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
  fastify.post(
    "/expense-sheets/:expenseSheetId/expenses",
    {
      onRequest: [
        fastify.verifyUserSession,
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
        reply.status(500).send({ error: error.message }); //TODO Remove backend error messages
      }
    }
  );

  fastify.get(
    "/expense-sheets/:expenseSheetId/expenses",
    {
      onRequest: [
        fastify.verifyUserSession,
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
        reply.status(500).send({ error: error.message }); //TODO Remove backend error messages
      }
    }
  );

  fastify.put(
    "/expense-sheets/:expenseSheetId/expenses/:id",
    {
      onRequest: [
        fastify.verifyUserSession,
        fastify.verifyUserIsExpenseSheetMember,
      ],
      preHandler: [fastify.verifyPayerAndBeneficiariesAreMembers],
    },
    async (request, reply) => {
      const { id, expenseSheetId } = request.params;
      const {
        description,
        amount,
        expenseSheetCategoryId,
        date,
        payerId,
        beneficiaryIds,
      } = request.body;

      const userId = request.session.user.id;

      try {
        // Fetch the expense sheet to validate members and payer
        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        // Update the expense
        const updatedExpense = await fastify.prisma.expense.update({
          where: { id: parseInt(id) },
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
        reply.status(500).send({ error: error.message }); //TODO Remove backend error messages
      }
    }
  );
}

module.exports = expenseSheetRoutes;
