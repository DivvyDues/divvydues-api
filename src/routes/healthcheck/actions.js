const getSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string" },
      },
    },
  },
};

export default async function (fastify, options) {
  fastify.get("/", { schema: getSchema }, async (request, reply) => {
    return { status: "OK" };
  });
}
