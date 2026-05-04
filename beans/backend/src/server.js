const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { createApp } = require("./app");
const { connectDb } = require("./db");

async function main() {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

  await connectDb();

  const app = createApp();
  const port = Number(process.env.PORT) || 5000;

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
