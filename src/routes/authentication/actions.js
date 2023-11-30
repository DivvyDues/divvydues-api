export default async function (fastify, options) {
  fastify.post("/register", async (request, reply) => {
    const { username, password } = request.body;
    //TODO Add rules for secure passwords

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
      return reply.internalServerError();
    }
  });

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    try {
      const user = await fastify.prisma.user.findUnique({
        where: { username },
      });
      if (!user || !(await fastify.argon2.verify(user.password, password))) {
        return reply
          .status(401)
          .send({ error: "Invalid username or password" });
      }

      // Set up user session and csrf token
      request.session.user = { id: user.id, username: user.username };
      request.session.authenticated = true;
      const csrfToken = await reply.generateCsrf();
      return { csrfToken };
    } catch (error) {
      return reply.internalServerError();
    }
  });

  fastify.post("/logout", async (request, reply) => {
    await request.session.destroy();
    return "Logout succesful";
  });
}
