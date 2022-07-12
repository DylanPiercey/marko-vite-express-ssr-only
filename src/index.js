import { Router } from "express";
import indexPage from "./pages/index";

export default Router().get("/", indexPage);
