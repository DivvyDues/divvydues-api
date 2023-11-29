import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient();

  fastify.decorate("prisma", prisma);
}

export default fp(prismaPlugin);
