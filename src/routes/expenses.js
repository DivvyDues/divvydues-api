async function expenseRoutes(fastify, options) {
  fastify.post(
    "/expense-sheets/:expenseSheetId/expenses",
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
    async (request, reply) => {
      const userId = request.session.user.id;
      const { expenseSheetId } = request.params;
      const { description, amount, categoryId, date, payerId, beneficiaryIds } =
        request.body;

      try {
        // Fetch the expense sheet to validate members
        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
        }

        // Check if user is member of expense sheet
        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          return reply
            .status(403)
            .send({ message: "User is not a member of the expense sheet" });
        }

        // Check if all beneficiaries are members of the expense sheet
        const memberIds = expenseSheet.members.map((member) => member.id);
        const allBeneficiariesAreMembers = beneficiaryIds.every((id) =>
          memberIds.includes(id)
        );

        if (!allBeneficiariesAreMembers) {
          return reply.status(400).send({
            message: "All beneficiaries must be members of the expense sheet",
          });
        }

        // Create the new expense
        const newExpense = await fastify.prisma.expense.create({
          data: {
            description,
            amount,
            category: { connect: { id: parseInt(categoryId) } },
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
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
    async (request, reply) => {
      const { expenseSheetId } = request.params;
      const userId = request.session.user.id;

      try {
        // Fetch the expense sheet to validate members
        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
        }

        // Check if user is member of expense sheet
        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          return reply
            .status(403)
            .send({ message: "User is not a member of the expense sheet" });
        }

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
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
    async (request, reply) => {
      const { id, expenseSheetId } = request.params;
      const { description, amount, categoryId, date, payerId, beneficiaryIds } =
        request.body;

      const userId = request.session.user.id;

      try {
        // Fetch the expense sheet to validate members and payer
        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
        }

        // Check if user is member of expense sheet
        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          return reply
            .status(403)
            .send({ message: "User is not a member of the expense sheet" });
        }

        // Check if all beneficiaries are members of the expense sheet
        if (beneficiaryIds) {
          const memberIds = expenseSheet.members.map((member) => member.id);
          const allBeneficiariesAreMembers = beneficiaryIds.every((id) =>
            memberIds.includes(id)
          );
          if (!allBeneficiariesAreMembers) {
            return reply.status(400).send({
              message: "All beneficiaries must be members of the expense sheet",
            });
          }
        }

        // Update the expense
        const updatedExpense = await fastify.prisma.expense.update({
          where: { id: parseInt(id) },
          data: {
            description,
            amount,
            category: { connect: { id: parseInt(categoryId) } },
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

module.exports = expenseRoutes;
