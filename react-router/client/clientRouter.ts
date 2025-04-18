import { AnchorHTMLAttributes, createElement, DetailedHTMLProps, FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Path, { dirname } from "path-browserify"
import { components, modules, dynamic_routes } from '@react-router/client/routes.ts';
import NotDefined from "./NotDefined";


type RouterCtx = {
  location: string;
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
    slug: [],
    params: {},
    get_ctx() {

      const ctx = {
        location: this.location,
        slug: this.slug,
        params: this.params
      }

      Object.freeze(ctx);

      return ctx;
    }
  }, {
    set(t, k, v) {

      Reflect.set(t, k, v);

      if (k == 'location') {
        history.pushState({ location: t.location }, "", t.location);
      }

      if (k == 'location') {

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

        reg.lastIndex = 0;
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

        if (result && score > output.score) {

          let [_, ...slug] = result;

          slug = slug[0]
            .split('/')
            .filter(str => str != '')

          output.route = route;
          output.slug = slug;
          output.score = score;

        }

        reg.lastIndex = 0; // reset reg state
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
        update.route = result.route;
        update.slug = result.slug;
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

  // INIT ROUTER STATE
  change_location(window.location.pathname);


  const subscribe = (fn: () => void) => {
    const index = listeners.push(fn) - 1;

    return () => {
      listeners.splice(index, 1);
    };
  };


  function popstate(ev: PopStateEvent) {
    if (ev.state.location != router.location) {
      change_location(ev.state.location);
    }
  }


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

      window.addEventListener('popstate', popstate);

      return () => {
        unsubscribe();
        window.removeEventListener('popstate', popstate);
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


  const Redirect = <T extends string>({ to, code }: { to: T, code?: number }) => {

    navigate(to, code);
    return null;
  }

  type NavLinkProps<T extends string> = Omit<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'href'>
    & { to: T, children: ReactNode }

  const NavLink = <T extends string>(
    { to, children, ...props }: NavLinkProps<T>
  ) => {

    const { location } = useParams();

    const base = 'nav-link';

    const className = useMemo(() => location == to ? `${base} active` : base, [location]);

    function onClick(ev: Event) {
      ev.preventDefault();
      navigate(to);
    }

    return (
      createElement('a', { children, className, href: to, onClick, ...props })
    )
  }


  // HOOKS

  const useParams = () => {

    const [state, setState] = useState(router.get_ctx())

    function update() {
      setState(() => ({ ...router.get_ctx() }));
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

  return {
    Router,
    Redirect,
    NavLink,
    useParams,
    navigate
  }

}

export default clientRouter;