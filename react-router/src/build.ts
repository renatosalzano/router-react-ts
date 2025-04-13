import { ComponentType } from "react";
/* IMPORTS */

type Module = {
  before?: (ctx: any) => Promise<void | boolean>;
}

const modules: { [key: string]: Module } = {/* MODULES */
};
const components: { [key: string]: ComponentType } = {/* COMPONENTS */
};
const dynamic_routes: { [key: string]: { route: string, catch_all: boolean } } = {/* DYNAMIC_ROUTES */
};

export {
  modules,
  components,
  dynamic_routes
}

/* HMR */