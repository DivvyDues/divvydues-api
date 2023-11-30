export default async function (fastify, options) {
  fastify.post(
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
      await request.session.destroy();
      return { status: "Logout succesfully" };
    }
  );
}
