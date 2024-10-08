import express from "express";
import { Request, Response } from "express";
import { seriesRouter } from "./routes/series.routes";
import ipTrackerMiddleware from "./middlewares/ipTracker.middleware";
import searchRouter from "./routes/search.routes";
import { AppDataSource } from "./data-source";
import distroRouter from "./routes/distro.routes";
import { getUserController } from "./controllers/blog.controllers";
import blogRouter from "./routes/blog.routes";

AppDataSource.initialize()
  .then(() => {
    const app = express();
    app.set("trust proxy", "loopback");
    app.use(express.json());
    app.use(ipTrackerMiddleware);
    app.use((req: Request, res: Response, next) => {
      const allowedOrigins = [
        "http://localhost:6969",
        "https://manga.eclipselunaria.dev",
        "https://mangaflux.net",
        "http://10.0.0.232:6969"
      ];
      const origin = req.headers.origin as string;
      if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      }
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }
      next();
    });
    app.use("/blog", blogRouter);
    app.use("/manga", seriesRouter);
    app.use("/fetch", distroRouter);
    app.use("/search", searchRouter);

    // basic operation to check if the gateway is working
    app.get("/", (req: Request, res: Response) => {
      res.send("Gateway is online.");
    });
    const PORT = process.env.PORT || 6900;

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
