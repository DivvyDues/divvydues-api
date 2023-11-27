// Auth decorators
const fp = require("fastify-plugin");

async function authDecorators(fastify, options) {
  fastify
    .decorate("verifyUserSession", function (request, reply, done) {
      if (!request.session.user) {
        return done(new Error("Not authenticated"));
      }
      done();
    })
    .decorate(
      "verifyUserExpenseSheetMembership",
      async function (request, reply, done) {
        // Use same message to prevent leaking information about database structure
        const errorMessage = "User is not a member of the expense sheet";

        const userId = request.session.user.id;
        const { expenseSheetId } = request.params;

        const expenseSheet = await fastify.prisma.expenseSheet.findUnique({
          where: { id: parseInt(expenseSheetId) },
          include: { members: true },
        });

        if (!expenseSheet) {
          reply.code(403);
          done(new Error(errorMessage));
        }

        const existingMemberIds = expenseSheet.members.map(
          (member) => member.id
        );
        const userIsMember = existingMemberIds.includes(userId);
        if (!userIsMember) {
          reply.code(403);
          done(new Error(errorMessage));
        }
        done();
      }
    );
}

module.exports = fp(authDecorators);
