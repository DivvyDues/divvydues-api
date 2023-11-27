const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//TODO Refactor Prisma to use fastify plugin
//TODO Create more robust checks for endpoints

async function expenseSheetRoutes(fastify, options) {
  // Create Expense Sheet
  fastify.post(
    "/expense-sheets",
    { preHandler: fastify.auth([fastify.verifyUserSession]) },
    async (request, reply) => {
      const { title } = request.body;
      const userId = request.session.user.id;

      console.log("Hello");

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
  fastify.get("/expense-sheets", async (request, reply) => {
    try {
      const expenseSheets = await prisma.expenseSheet.findMany();
      return expenseSheets;
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Add Members to Expense Sheet
  fastify.post("/expense-sheets/:id/members", async (request, reply) => {
    const { id } = request.params;
    const { memberIds } = request.body;

    try {
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
  });
}

module.exports = expenseSheetRoutes;
