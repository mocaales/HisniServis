// dotenv/config se mora naložiti pred app.js, ki ob uvozu bere CORS_ORIGIN.
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Izbira podatkovne baze
const DB_MODE = process.env.DB_MODE || "local";

const MONGO_URI =
  DB_MODE === "local"
    ? process.env.MONGO_URI_LOCAL
    : process.env.MONGO_URI_ATLAS;

async function startServer() {
  try {
    if (!["local", "atlas"].includes(DB_MODE)) {
      throw new Error("DB_MODE mora biti 'local' ali 'atlas'.");
    }

    if (!MONGO_URI) {
      throw new Error(
        `Povezava za MongoDB (${DB_MODE}) ni nastavljena v .env`
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET ni nastavljen.");
    }

    await mongoose.connect(MONGO_URI);

    console.log(
      DB_MODE === "local"
        ? "Lokalna MongoDB povezana!"
        : "MongoDB Atlas povezan!"
    );

    app.listen(PORT, () => {
      console.log(`Server deluje na http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(
      "Napaka pri povezavi z MongoDB:",
      error.message
    );
    process.exit(1);
  }
}

startServer();
