import express from "express";
import { swaggerDocs, swaggerUi } from "./swagger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/sesion_routes/auth.routes.js";
import apiRoutes from "./routes/api_routes/index.routes.js";
import userRoutes from "./routes/api_routes/user.routes.js";
import { authRequired, staffRequired } from "./middlewares/validateToken.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

const clientDistPath = path.resolve( path.dirname(fileURLToPath(import.meta.url)),  "../../client/dist");

//app.use(cors({ origin: "http://172.16.44.190:5173", credentials: true }));
//app.use(cors({
//origin: "http://172.20.136.164:5173",
//credentials: true
//}));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.2.11:5173",
    "http://172.20.136.164:5173",
    "http://172.20.150.40:5173"
  ],
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", authRequired, staffRequired);

apiRoutes.forEach(route => {
  app.use("/api", route);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.static(clientDistPath));app.get("*", (req, res, next) => { if (req.path.startsWith("/api")) return next();  return res.sendFile(path.join(clientDistPath, "index.html"));});

export default app;
