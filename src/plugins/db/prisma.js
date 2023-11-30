import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

const prisma = new PrismaClient();

export default fp(async function (fastify, options) {
  fastify.decorate("prisma", prisma);
});
