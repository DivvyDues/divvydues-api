const fp = require('fastify-plugin');
const argon2 = require('argon2');

async function argon2Plugin(fastify, options) {
  fastify.decorate('argon2', {
    hash: async (password) => {
      return await argon2.hash(password);
    },
    verify: async (hash, password) => {
      return await argon2.verify(hash, password);
    }
  });
}

module.exports = fp(argon2Plugin);