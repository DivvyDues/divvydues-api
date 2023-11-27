// Auth decorators
const fp = require("fastify-plugin");

async function authorizationDecorators(fastify, options) {
  fastify.decorate(
    "verifyUserIsExpenseSheetMember",
    async function (request, reply) {
      const userId = request.session.user.id;
      const { expenseSheetId } = request.params;
      // Use same message to avoid information leakage
      const ERROR_MESSAGE = "User is not a member of the expense sheet";

      const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
        where: { id: parseInt(expenseSheetId) },
        include: { members: true },
      });

      if (!expenseSheet) {
        reply.code(403);
        throw new Error(ERROR_MESSAGE);
      }

      // Check if user is member of expense sheet
      const existingMemberIds = expenseSheet.members.map((member) => member.id);
      const userIsMember = existingMemberIds.includes(userId);
      if (!userIsMember) {
        reply.code(403);
        throw new Error(ERROR_MESSAGE);
      }
    }
  );
}

module.exports = fp(authorizationDecorators);
