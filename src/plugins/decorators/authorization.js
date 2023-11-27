// Auth decorators
const fp = require("fastify-plugin");

async function authorizationDecorators(fastify, options) {
  fastify
    .decorate(
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
        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          reply.code(403);
          throw new Error(ERROR_MESSAGE);
        }
      }
    )
    .decorate(
      "verifyPayerAndBeneficiariesAreMembers",
      async function (request, reply) {
        const { expenseSheetId } = request.params;
        const { payerId, beneficiaryIds } = request.body;

        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        // Check if all beneficiaries are members of the expense sheet
        if (beneficiaryIds) {
          const memberIds = expenseSheet.members.map((member) => member.id);
          const allBeneficiariesAreMembers = beneficiaryIds.every((id) =>
            memberIds.includes(id)
          );
          const payerIsMember = memberIds.includes(payerId);

          if (!payerIsMember) {
            reply.code(403);
            throw new Error("Payer must be a member of the expense sheet");
          }
          if (!allBeneficiariesAreMembers) {
            reply.code(403);
            throw new Error(
              "All beneficiaries must be members of the expense sheet"
            );
          }
        }
      }
    );
}

module.exports = fp(authorizationDecorators);
