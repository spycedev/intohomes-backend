import express, { Request, Response, NextFunction } from "express";
import searchListingsRoutes from "./routes/listings/searchListings.routes";

import cors from "cors";
import offersRoutes from "./routes/offers/offers.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/listings", searchListingsRoutes);
app.use("/api/offers", offersRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
