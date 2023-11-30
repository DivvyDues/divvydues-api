import fp from "fastify-plugin";
import argon2 from "argon2";

export default fp(async function (fastify, options) {
  fastify.decorate("argon2", {
    hash: async (password) => {
      return await argon2.hash(password);
    },
    verify: async (hash, password) => {
      return await argon2.verify(hash, password);
    },
  });
});
