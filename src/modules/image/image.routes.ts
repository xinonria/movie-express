import { Router } from "express";
import { getImageProxy } from "./image.controller";

const router = Router();

router.get('/proxy', getImageProxy);

export default router;
