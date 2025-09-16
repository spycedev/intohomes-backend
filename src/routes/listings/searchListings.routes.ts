import Express from "express";
import { searchListingsController } from "../../controllers/listings/searchListings.controller";
import { getListingController } from "../../controllers/listings/getListing.controller";
import { getSimilarListingsController } from "../../controllers/listings/getSimilarListings.controller";

const Router = Express.Router();

Router.post("/search", searchListingsController);
Router.get("/:mlsNumber", getListingController);
Router.get("/similar/:mlsNumber", getSimilarListingsController);

export default Router;
