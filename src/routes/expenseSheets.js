const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//TODO Refactor Prisma to use fastify plugin
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
        const expenseSheet = await prisma.expenseSheet.create({
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
        const expenseSheets = await prisma.expenseSheet.findMany({
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
    "/expense-sheets/:id/members",
    { onRequest: fastify.auth([fastify.verifyUserSession]) },
    async (request, reply) => {
      const userId = request.session.user.id;
      const { id } = request.params;
      const { memberIds } = request.body;

      try {
        const expenseSheet = await prisma.expenseSheet.findUnique({
          where: { id: parseInt(id) },
          include: { members: true },
        });

        if (!expenseSheet) {
          return reply.status(404).send({ message: "Expense sheet not found" });
        }

        // Check if all beneficiaries are members of the expense sheet
        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          return reply
            .status(403)
            .send({ message: "User is not a member of the expense sheet" });
        }

        const updatedExpenseSheet = await prisma.expenseSheet.update({
          where: { id: parseInt(id) },
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
