import express from "express";

import { getMe } from "../../controllers/me/getMe.controller";
import { authRequired } from "../../helpers/auth";
import { getOffers } from "../../controllers/me/getOffers.controller";

const router = express.Router();

router.get("/", authRequired, getMe);
router.get("/offers", authRequired, getOffers);

export default router;
