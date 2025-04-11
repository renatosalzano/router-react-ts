import { createElement, useEffect, useState } from "react";
import Path from "path-browserify"
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


  function log(...args: any[]) { console.log(...args) }

  const router = new Proxy<RouterCtx & { route: string }>({
    route: '',
    // ROUTER CTX
    location: '',
    state: {},
    slug: [],
    params: {}
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

  let processing = {} as ReturnType<typeof Processing>

  async function change_location(location: string) {

    processing = Processing(location)

    console.log('change location', location)

    const update: Omit<typeof router, "state"> = {
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

      update.route = path;

      // resolve dynamic route
      const slug: string[] = [];
      let curr = path;
      let rest = '';
      let slug_size = 0;

      while (curr != '/') {
        let dirname = Path.dirname(curr);
        let basename = Path.basename(curr)

        rest = Path.join(curr, basename)
        slug_size = slug.unshift(basename);

        if (dynamic_routes.hasOwnProperty(dirname)) {
          const data = dynamic_routes[dirname];

          if (data.slug_size == 0 || data.slug_size <= slug_size) {
            update.route = data.route;
            update.slug = slug;
          }

          break;
        }

        curr = dirname;
      }
      // loop end
    }


    if (modules[update.route]) {
      const mod = modules[update.route];

      if (mod.before) {
        const ctx = { ...update } as Partial<typeof update>;
        delete ctx.route;
        Object.freeze(ctx)

        const not_allowed = await mod.before(ctx);
        log('resolve before', not_allowed)
        if (not_allowed) {
          update.route = '401';
        };
      }
    }

    router.params = update.params;
    router.route = update.route;
    router.slug = update.slug;

    router.location = update.location;

    processing.done()
  }


  // INIT ROUTER STATE
  change_location(window.location.pathname);

  const subscribe = (fn: () => void) => {
    const index = listeners.push(fn) - 1;

    return () => {
      listeners.splice(index, 1);
    };
  };

  // REACT

  const Router = () => {

    const [state, setState] = useState(router.route)

    function update() {
      setState(() => router.location);
    }

    useEffect(() => {
      log(router)
      const unsubscribe = subscribe(update);

      return () => {
        unsubscribe();
      }

    }, []);

    if (components[state]) {
      return createElement(components[state]);
    } else if (components["404"]) {
      return createElement(components["404"]);
    } else return null;

  }

  // HOOKS

  const useParams = () => {

    const [state, setState] = useState(router)

    function update() {
      // TODO delete route
      setState(() => ({ ...router }));
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

  const navigate = async <T extends { [key: string]: any }>(to: string, state?: ((prev: T) => Partial<T>) | Partial<T>) => {

    if (processing.path == to) {
      log('same path abort navigate');
      return;
    }

    if (processing.pending) await processing.pending;

    if (state) {

      if (typeof state == 'function') {
        state = state(router.state as T);
      }
      router.state = state;
    }

    change_location(to)
  };


  const redirect = (to?: string) => {
    if (to) {
      navigate(to)
    } else {
      console.log(history)
    }
  }

  return {
    Router,
    useParams,
    navigate
  }

}


function Processing(path: string) {
  let done = () => undefined;
  const pending = new Promise(res => (done as any) = res);
  return {
    pending,
    path,
    done
  };
}



export default clientRouter;