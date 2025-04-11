// import { Router } from "./Router";
import type { Routes } from "./.local/types";
import clientRouter from "./src/clientRouter";


const {
  Router,
  useParams,
  navigate
} = clientRouter()


export {
  Router,
  useParams,
  navigate
}

declare namespace Route {
  type Ctx = {
    location: string;
    params: { [key: string]: string };
  }
  type before = (ctx: Ctx) => any;
}

export type {
  Route
}