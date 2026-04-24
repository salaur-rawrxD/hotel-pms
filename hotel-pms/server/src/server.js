import "dotenv/config";

import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT) || 3001;

const server = app.listen(port, () => {
  console.log(`🏨 Hotel PMS API listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Closing server…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
