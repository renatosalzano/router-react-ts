import { createElement, useEffect, useRef, useState } from "react";
import Path, { dirname } from "path-browserify"
import { components, modules, dynamic_routes } from '@react-router/client/routes.ts';
import NotDefined from "./NotDefined";


type RouterCtx = {
  location: string;
  state: { [key: string]: any };
  slug: string[];
  params: { [key: string]: string };
}

type Fn = () => void;

function clientRouter() {

  const history = window.history;
  const dynamic_route_cache = new Map<string, { slug: string[], route: string }>();

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


  function resolve_dynamic_route(path: string) {

    if (dynamic_route_cache.has(path)) {
      return dynamic_route_cache.get(path);
    }

    const segments = path == '/'
      ? 1
      : path.split('/').length - 1;

    if (dynamic_routes[segments]) {
      for (const { reg, route } of dynamic_routes[segments]) {
        const result = reg.exec(path);

        if (result != null && result.length >= 2) {
          const [_, ...slug] = result;

          dynamic_route_cache.set(path, {
            slug,
            route
          });

          return {
            slug,
            route
          }
        }
      }
    }

    if (dynamic_routes.catch_all) {

      const output: { route: string, slug: string[], score: number } = {
        route: '',
        slug: [],
        score: 0
      }

      for (const { reg, route, score } of dynamic_routes.catch_all) {
        const result = reg.exec(path);

        // console.log(result, reg)

        if (result) {

          const [_, ...slug] = result;

          if (score > output.score) {
            output.route = route;
            output.slug = slug;
            output.score = score;
          }

        }
      }

      if (output.route) {

        dynamic_route_cache.set(path, {
          slug: output.slug,
          route: output.route
        });

        return {
          slug: output.slug,
          route: output.route
        }

      }

    }

    return null;
  }


  function change_location(location: string, code?: number) {

    console.log('change location', location)
    const update: Omit<typeof router, "state" | "get_ctx"> = {
      route: '',
      location,
      slug: [],
      params: {}
    }

    let [path, params] = location.split('?');

    path ||= '/';
    params ||= window.location.search;

    if (params) {

      const url_params = new URLSearchParams(params);
      for (const [name, value] of url_params.entries()) {
        update.params[name] = value;
      }

      if (!params.startsWith("?")) {
        params += '?';
      }

    }

    // console.log('path', path)

    if (components.hasOwnProperty(path)) {
      update.route = path;
    } else {

      const result = resolve_dynamic_route(path);

      if (result) {
        update.route = result.route
        // console.log(result)
      }

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

  // {
  //   for (const route in modules) {

  //   }
  // }

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

    const is_not_defined = useRef(false);

    const check_route_component = (route: string) => {

      is_not_defined.current = (components[router.route] == undefined)

      return route;
    }

    const [state, setState] = useState(check_route_component(router.route));

    function update() {
      setState(check_route_component(router.route));
    }

    useEffect(() => {
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    if (is_not_defined.current) {
      return createElement(NotDefined, { route: router.route })
    }

    if (components[state]) {
      return createElement(components[state]);
    }
    return null;

  }


  const Redirect = <T extends string>(to: T, code?: number) => {

    navigate(to, code);
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

  const navigate = async <T extends string>(
    to: T,
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
    Redirect,
    useParams,
    navigate,
    setState
  }

}

export default clientRouter;