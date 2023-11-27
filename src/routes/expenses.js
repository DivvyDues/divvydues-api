const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function expenseRoutes(fastify, options) {
  fastify.post(
    "/expense-sheets/:expenseSheetId/expenses",
    async (request, reply) => {
      const { expenseSheetId } = request.params;
      const { description, amount, categoryId, date, payerId, beneficiaryIds } =
        request.body;

      try {
        // Fetch the expense sheet to validate members
        const expenseSheet = await prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
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
        const newExpense = await prisma.expense.create({
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
    async (request, reply) => {
      //TODO Check logic if the user is a member of the sheet
      const { expenseSheetId } = request.params;

      try {
        const expenses = await prisma.expense.findMany({
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
    async (request, reply) => {
      const { id, expenseSheetId } = request.params;
      const { description, amount, categoryId, date, payerId, beneficiaryIds } =
        request.body;

      try {
        // Fetch the expense sheet to validate members and payer
        const expenseSheet = await prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
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
        const updatedExpense = await prisma.expense.update({
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
