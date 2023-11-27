const { PrismaClient } = require("@prisma/client");
const fp = require("fastify-plugin");

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient();

  fastify.decorate("prisma", prisma);
}

module.exports = fp(prismaPlugin);
