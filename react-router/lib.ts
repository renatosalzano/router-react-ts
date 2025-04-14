import clientRouter from "./client/clientRouter";

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
  type config = {
    alias: string
  }
}

export type {
  Route
}