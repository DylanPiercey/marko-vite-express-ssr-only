import { Router } from "express";
import indexPage from "./pages/index";

const router = Router();
router.get("/", indexPage);
export default router;
