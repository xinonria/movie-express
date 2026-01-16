import { Router } from "express";
import { getImageProxy } from "./image.controller";

const router = Router();

router.get('/', getImageProxy);

export default router;
