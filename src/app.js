// Importing environment variables
import dotenv from "dotenv";
dotenv.config(); // Research safer alternatives for production code

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import Sensible from "@fastify/sensible";
import Autoload from "@fastify/autoload";
import Helmet from "@fastify/helmet";
import Cookie from "@fastify/cookie";
import Session from "@fastify/session";
import Csrf from "@fastify/csrf-protection";

// ESM-specific adjustments
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Fastify instance
const fastify = Fastify({ logger: true });

// Register Core plugins
fastify.register(Sensible, {
  sharedSchemaId: "HttpError",
});
fastify.register(Helmet, { global: true }); // Set appropriate rules for REST API
fastify.register(Cookie);
fastify.register(Session, {
  cookie: { secure: false }, // Mechanism to set to true in prod
  secret: process.env.SESSION_SECRET,
  rolling: false,
  saveUninitialized: false,
});
fastify.register(Csrf, {
  sessionPlugin: "@fastify/session",
});

// Autoload plugins and routes
fastify.register(Autoload, {
  dir: join(__dirname, "plugins"),
});

fastify.register(Autoload, {
  dir: join(__dirname, "routes"),
  routeParams: true,
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 }); // Add mechanism to change port for production
    console.log(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
