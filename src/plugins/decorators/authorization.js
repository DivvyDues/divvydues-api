import fp from "fastify-plugin";

async function authorizationDecorators(fastify, options) {
  // Common function to validate membership
  async function validateMembership(expenseSheetId, userIds) {
    const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
      where: { id: parseInt(expenseSheetId) },
      include: { members: true },
    });

    if (!expenseSheet) {
      return false;
    }

    const memberIds = expenseSheet.members.map((member) => member.id);
    return userIds.every((id) => memberIds.includes(id));
  }

  fastify.decorate(
    "verifyUserIsExpenseSheetMember",
    async function (request, reply) {
      const userId = request.session.user.id;
      const { expenseSheetId } = request.params;

      if (!(await validateMembership(expenseSheetId, [userId]))) {
        reply.code(403);
        throw new Error("User is not a member of the expense sheet");
      }
    }
  );

  fastify.decorate(
    "verifyPayerAndBeneficiariesAreMembers",
    async function (request, reply) {
      const { expenseSheetId } = request.params;
      const { payerId, beneficiaryIds } = request.body;

      const userIds = [payerId, ...beneficiaryIds];
      if (!(await validateMembership(expenseSheetId, userIds))) {
        reply.code(403);
        throw new Error(
          "Payer and all beneficiaries must be members of the expense sheet"
        );
      }
    }
  );
}

export default fp(authorizationDecorators);
