import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import createHttpErrors from "http-errors";
import apiRoutes from "./routes/index.js";

const app = express();
dotenv.config();

// --------- Middleware -----------------

if (process.env.NODE_ENV != "production") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------- Routes -----------------

app.get("/", (req, res) => {
  res.json({
    status: "Running",
  });
});

app.use("/api/v1", apiRoutes);

app.use(async (req, res, next) => {
  next(createHttpErrors.NotFound("This route does not exits"));
});

app.use(async (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// --------- Server Start -----------------

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", (err) => {
  if (err) throw err;
  console.log(`server is running: ${PORT}`);
});
