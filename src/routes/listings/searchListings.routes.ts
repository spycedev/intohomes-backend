import Express from "express";
import { searchListingsController } from "../../controllers/listings/searchListings.controller";

const Router = Express.Router();

Router.post("/search", searchListingsController);

export default Router;
