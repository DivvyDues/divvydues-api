// Auth decorators
const fp = require("fastify-plugin");

async function authDecorators(fastify, options) {
  fastify.decorate("verifyUserSession", function (request, reply, done) {
    if (!request.session.user) {
      return done(new Error("Not authenticated"));
    }
    done();
  });
}

module.exports = fp(authDecorators);
