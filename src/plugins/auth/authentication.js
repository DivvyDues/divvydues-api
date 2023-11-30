import fp from "fastify-plugin";

export default fp(async function authenticationDecorators(fastify, options) {
  fastify.decorate("verifyUserSession", async function (request, reply) {
    if (!request.session.user) {
      return reply.unauthorized("Not authenticated");
    }
  });
});
