// import { Router } from "./Router";
import type { Routes } from "./.local/types";
import reactRouter from "./reactRouter";


const {
  Router,
  useParams,
  navigate
} = reactRouter()


export {
  Router,
  useParams,
  navigate
}

export type {
  Routes
}