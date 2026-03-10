/**
 * Server Entry Point
 */

process.on("uncaughtException", (err) => {
  console.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  process.exit(1);
});

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

// ── Guard: fail fast if critical env vars are missing ──────────────────────
const REQUIRED_ENV = ["DB_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n❌  Missing required environment variables: ${missing.join(", ")}`);
  console.error(`    Copy .env.example to .env and fill in the values.\n`);
  process.exit(1);
}

const app = require("./app");
const connectDB = require("./config/database");

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`UNHANDLED REJECTION: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  server.close(() => console.log("Process terminated."));
});
