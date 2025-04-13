import { createElement, useEffect, useState } from "react";
import Path, { dirname } from "path-browserify"
import { components, modules, dynamic_routes } from '@react-router/src/build.ts';


type RouterCtx = {
  location: string;
  state: { [key: string]: any };
  slug: string[];
  params: { [key: string]: string };
}

type Fn = () => void;

function clientRouter() {

  const history = window.history;

  const listeners: Fn[] = [];

  const router = new Proxy<RouterCtx & { route: string, get_ctx(): RouterCtx }>({
    route: '',
    // ROUTER CTX
    location: '',
    state: {},
    slug: [],
    params: {},
    get_ctx() {

      const ctx = {
        location: this.location,
        state: this.state,
        slug: this.slug,
        params: this.params
      }

      Object.freeze(ctx);

      return ctx;
    }
  }, {
    set(t, k, v) {

      Reflect.set(t, k, v);

      if (k == 'state') {
        t.state = v;
        history.pushState(t.state, "");
      }

      if (k == 'location') {
        history.pushState(t.state, "", t.location);
      }

      if (k == 'location' || k == 'state') {

        // update to react
        for (const notify of listeners) {
          notify();
        }

      }

      return true;
    }
  });


  function get_code_route(path: string, code = 404) {

    const path_code = Path.join(path, `${code}`);

    if (components[path_code]) {
      return path_code;
    } else if (path != '/') {
      return get_code_route(dirname(path), code);
    }
  }


  function change_location(location: string, code?: number) {

    location = location.endsWith('/')
      ? location.slice(0, -1)
      : location

    // console.log('change location', location)
    const update: Omit<typeof router, "state" | "get_ctx"> = {
      route: '',
      location,
      slug: [],
      params: {}
    }

    let [path, params = window.location.search] = location.split('?');

    if (params) {

      const url_params = new URLSearchParams(params);
      for (const [name, value] of url_params.entries()) {
        update.params[name] = value;
      }

      if (!params.startsWith("?")) {
        params += '?'
      }

    }


    if (components.hasOwnProperty(path)) {
      update.route = path;
    } else {

      // resolve dynamic route
      const slug: string[] = [];
      let curr = path;
      // let rest = '';
      let slug_size = 0;

      while (curr != '/') {
        let dirname = Path.dirname(curr);
        let basename = Path.basename(curr)


        slug_size = slug.unshift(basename);

        if (dynamic_routes.hasOwnProperty(dirname)) {
          const data = dynamic_routes[dirname];

          if (data.catch_all || slug_size == 1) {
            update.route = data.route;
            update.slug = slug;
          }

          break;
        }

        curr = dirname;
      }
      // loop end
    }

    if (code) {
      update.route = get_code_route(location, code) || '';
    }

    if (!update.route) {
      update.route = get_code_route(location, 404) || '';
    }

    router.params = update.params;
    router.route = update.route;
    router.slug = update.slug;

    router.location = update.location;

  }


  // INIT ROUTER STATE
  change_location(window.location.pathname);

  function update_state(state: any) {
    if (state) {
      if (typeof state == 'function') {
        state = state(router.state);
      }
      router.state = state;
    }
  };

  const subscribe = (fn: () => void) => {
    const index = listeners.push(fn) - 1;

    return () => {
      listeners.splice(index, 1);
    };
  };

  // REACT

  const Router = () => {

    const [state, setState] = useState(router.route);

    function update() {
      setState(() => router.route);
    }

    useEffect(() => {
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    if (components[state]) {
      return createElement(components[state]);
    }
    return null;

  }

  // HOOKS

  const useParams = () => {

    const [state, setState] = useState(router.get_ctx())

    function update() {
      // TODO delete route
      setState(() => router.get_ctx());
    }

    useEffect(() => {
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    return state;
  }

  // API

  const navigate = async (
    to: string,
    code?: number
  ) => {
    change_location(to, code);
  };

  const setState = <T extends { [key: string]: any }>(
    state?: ((prev: T) => Partial<T>) | Partial<T>
  ) => {
    update_state(state)
  }

  return {
    Router,
    useParams,
    navigate,
    setState
  }

}






export default clientRouter;