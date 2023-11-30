import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export default fp(async function (fastify, options) {
  const prisma = new PrismaClient();

  fastify.decorate("prisma", prisma);
});
