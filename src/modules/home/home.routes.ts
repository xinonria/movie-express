import { Router } from "express";
import { getHome, getHomeMovies } from "./home.controller";

const router = Router();

router.get('/', getHome);
router.get('/movies', getHomeMovies);

export default router;