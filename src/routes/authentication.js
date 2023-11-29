module.exports = async function (fastify, options) {
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
      reply.status(500).send({ error: error.message }); //TODO remove backend error messages
    }
  });

  // User Login Endpoint
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

      // Set up user session
      request.session.user = { id: user.id, username: user.username };
      const csrfToken = await reply.generateCsrf();
      return { csrfToken };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // User Logout Endpoint
  fastify.post("/logout", async (request, reply) => {
    request.session.destroy((err) => {
      if (err) {
        return reply.status(500).send({ error: "Failed to log out" });
      }
      reply.send({ message: "Logged out successfully" });
    });
  });
};
