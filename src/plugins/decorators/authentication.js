// Auth decorators
const fp = require("fastify-plugin");

async function authenticationDecorators(fastify, options) {
  fastify.decorate("verifyUserSession", function (request, reply, done) {
    if (!request.session.user) {
      reply.code(401);
      return done(new Error("Not authenticated"));
    }

    done();
  });
}

module.exports = fp(authenticationDecorators);
