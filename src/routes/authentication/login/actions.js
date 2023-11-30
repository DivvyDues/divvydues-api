const postSchema = {
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
    },
    required: ["username", "password"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        csrfToken: { type: "string" },
      },
    },
    400: { $ref: "HttpError" },
    500: { $ref: "HttpError" },
  },
};

export default async function (fastify, options) {
  fastify.post("/", { schema: postSchema }, async (request, reply) => {
    const { username, password } = request.body;

    try {
      const user = await fastify.prisma.user.findUnique({
        where: { username },
      });
      if (!user || !(await fastify.argon2.verify(user.password, password))) {
        return reply.badRequest("Invalid username or password");
      }

      request.session.user = { id: user.id, username: user.username };
      request.session.authenticated = true;
      const csrfToken = await reply.generateCsrf();
      return { csrfToken };
    } catch (error) {
      return reply.internalServerError();
    }
  });
}
