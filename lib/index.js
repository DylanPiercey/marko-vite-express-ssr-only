import { Router } from "express";
import indexPage from "../views/index/index";

const router = Router();
router.get("/", indexPage);
export default router;
