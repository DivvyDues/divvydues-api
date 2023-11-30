import fp from "fastify-plugin";

export default fp(async function (fastify, options) {
  fastify.addSchema({
    $id: "ExpenseSheet",
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      createdAt: { type: "string" },
    },
    additionalProperties: false,
  });
});
