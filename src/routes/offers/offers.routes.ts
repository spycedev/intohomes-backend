import { Router } from "express";
import { createOffer } from "../../controllers/offers/createOffer.controller";
import { withdrawOffer } from "../../controllers/offers/withdrawOffer.controller";

const router = Router();

router.post("/create", createOffer);
router.delete("/withdraw/:offerId", withdrawOffer);

export default router;
