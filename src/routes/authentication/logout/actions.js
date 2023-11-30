const postSchema = {
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
  fastify.post("/", { schema: postSchema }, async (request, reply) => {
    await request.session.destroy();
    return { status: "Logout succesfully" };
  });
}
