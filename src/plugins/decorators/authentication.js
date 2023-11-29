// Auth decorators
import fp from "fastify-plugin";

async function authenticationDecorators(fastify, options) {
  fastify.decorate("verifyUserSession", function (request, reply, done) {
    if (!request.session.user) {
      reply.code(401);
      return done(new Error("Not authenticated"));
    }

    done();
  });
}

export default fp(authenticationDecorators);
