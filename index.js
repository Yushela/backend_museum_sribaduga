import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import db from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import museumRoutes from "./routes/museum.js";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// middleware
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// endpoint
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api/v1/", userRoutes, museumRoutes);
app.get("/", (req, res) => {
  res.send('hallo');
})

// database
db();

// server
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

