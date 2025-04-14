import { ComponentType } from "react";
/* IMPORTS */

type Module = {
  config?: object;
}

export type RouterLinks = { href: string, dynamic: boolean, slug?: string[], children?: RouterLinks[] }[]

const modules: { [key: string]: Module } = {/* MODULES */
};
const components: { [key: string]: ComponentType } = {/* COMPONENTS */
};
const dynamic_routes: { catch_all?: { reg: RegExp, route: string, score: number }[], [key: number]: { reg: RegExp, route: string }[] } = {/* DYNAMIC_ROUTES */
};
const routes: RouterLinks = [/* ROUTES */
];

export {
  modules,
  routes,
  components,
  dynamic_routes
}

/* HMR */