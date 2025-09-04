import express, { Request, Response } from "express";
import searchListingsRoutes from "./routes/listings/searchListings.routes";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use("/api/listings", searchListingsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
