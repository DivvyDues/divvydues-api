export default async function (fastify, options) {
  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          additionalProperties: false,
          required: ["username", "password"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
            },
          },
          400: { $ref: "HttpError" },
          500: { $ref: "HttpError" },
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      if (!(password.length >= 8 && password.length <= 40)) {
        return reply.badRequest("Password must be between 8 and 40 characters");
      }

      try {
        const hashedPassword = await fastify.argon2.hash(password);
        const user = await fastify.prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        return { id: user.id, username: user.username };
      } catch (error) {
        if (error.code === "P2002") {
          return reply.badRequest("User already exists");
        }
        return reply.internalServerError();
      }
    }
  );
}
