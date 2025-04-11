import { createElement, useEffect, useState } from "react";
import Path from "path-browserify"
import { COMPONENTS, DYNAMIC_ROUTES } from '@react-router/build';

const dynamic_routes: any = DYNAMIC_ROUTES;

function get_params(url: string) {
  const params = new URLSearchParams(url)
}

type Fn = () => void;

function reactRouter() {

  const history = window.history;

  const listeners: Fn[] = [];

  const initial_state = {
    location: '',
    route: '',
    slug: {} as any,
    params: {} as any,
  }

  function check_location(path: string, output: any) {
    if (!COMPONENTS.hasOwnProperty(path)) {

      const path_split = path.split('/').filter((p) => !!p);

      // TODO add caching system?
      path_split.reduce((prev, curr, index) => {
        prev = `${prev}${curr}/`
        if (dynamic_routes[prev]) {
          output.route = dynamic_routes[prev].route;

          const slug_key: string = dynamic_routes[prev].slug;
          output.slug[slug_key] = path_split[index + 1];
        }
        return prev;
      }, "")
    } else {
      output.route = path
    }

    output.location = path;
  }

  function log(...args: any[]) { console.log(...args) }

  const router_state = new Proxy({
    route: '',
    location: '',
    slug: {} as any,
    params: {} as any,
  }, {
    set(t, k, v) {

      t.params = {};
      t.slug = {};

      if (k == 'location') {
        let [path, params = window.location.search] = v.split('?');

        if (params) {
          const url_params = new URLSearchParams(params);
          for (const [name, value] of url_params.entries()) {
            t.params[name] = value;
          }
        }


        if (COMPONENTS.hasOwnProperty(path)) {
          t.location = path;
          t.route = path;
        } else {

          t.location = path;
          t.route = path;

          let curr = path;

          while (curr != '/') {
            let dirname = Path.dirname(curr);
            let basename = Path.basename(curr);

            // log(dirname, basename)
            if (dynamic_routes.hasOwnProperty(dirname)) {
              log('route found')
              t.location = Path.join(dirname, basename);
              t.route = dynamic_routes[dirname].route;
              t.slug = { [dynamic_routes[dirname].slug]: basename }
              break;
            }

            curr = dirname;
          }
        }
      }

      // Reflect.set(t, k, v);

      for (const notify of listeners) {
        notify();
      }

      return true;
    }
  });

  router_state.location = '/user/renato?test=bar';


  const subscribe = (fn: () => void) => {
    const index = listeners.push(fn) - 1;

    return () => {
      listeners.splice(index, 1);
    };
  };


  const Router = () => {

    const [state, setState] = useState(router_state.route)

    function update() {
      setState(() => router_state.location);
    }

    useEffect(() => {
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    const pages: any = COMPONENTS;

    if (pages[state]) {
      return createElement(pages[state]);
    } else if (pages["404"]) {
      return createElement(pages["404"]);
    } else return null;

  }


  const useParams = () => {

    const [state, setState] = useState(router_state)

    function update() {
      // TODO delete route
      setState(() => ({ ...router_state }));
    }

    useEffect(() => {
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    return state;
  }


  const navigate = (to: string, params: { [key: string]: any } = {}) => {

    check_location(to, router_state);

    history.pushState(null, "", router_state.location);
  }

  return {
    Router,
    useParams,
    navigate
  }

}

export default reactRouter;