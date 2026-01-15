import { Router } from "express";
import { getMovieList } from "./movie.controller";

const router = Router();

router.get('/list', getMovieList);

export default router;