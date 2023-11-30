export default async function (fastify, options) {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return { status: "OK" };
    }
  );
}
