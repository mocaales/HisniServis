import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import popravilaRoutes from "./routes/popravila.js";
import ponudbeRoutes from "./routes/ponudbe.js";

// Dovoljeni izvori frontenda (CORS_ORIGIN, več vrednosti ločenih z vejico).
const dovoljeniIzvori = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((izvor) => izvor.trim())
  .filter(Boolean);

const app = express();

app.use(cors({ origin: dovoljeniIzvori }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/popravila", popravilaRoutes);
app.use("/api/ponudbe", ponudbeRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "HišniServis API deluje!",
    database:
      mongoose.connection.readyState === 1
        ? "Povezana"
        : "Ni povezana",
    databaseMode: process.env.DB_MODE || "local"
  });
});

export default app;
