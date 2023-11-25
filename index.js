const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
  return { message: "Hello from Fastify!" };
});

const start = async () => {
  try {
    await fastify.listen(3000);
    console.log(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();