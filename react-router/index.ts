
import { createFilter, normalizePath } from 'vite';
import type {
  Plugin,
  ViteDevServer
} from "vite"
import { dirname, extname, join, parse, posix, relative, resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { print, time } from './utils/shortcode';
import { build_routes } from './src/build_routes';
import { readFile } from 'fs/promises';


function reactRouter(): Plugin {


  const src_routes = 'src/pages';

  let dev_server: ViteDevServer;
  let cmd: string;

  const routes: { [key: string]: string } = {};
  const dynamic_routes = new Set<string>();
  // const route_components = new Map<string, string>();
  // const cache = new Map<string, string>();

  // const is_src = createFilter(
  //   `src/**/*.{js,ts,jsx,tsx}`,
  //   'node_modules/**'
  // );

  const is_route = createFilter(
    `${src_routes}/**/*.{jsx,tsx}`,
    'node_modules/**'
  );


  function build() {

    print(time(';1'), '[react-router];c', 'build routes.')

    const routes_for_check = new Set<string>();

    // function add_route(route: string) {
    //   if (routes_for_check.has(route))
    // }

    const routes_path = resolve(process.cwd(), src_routes)

    const source = readdirSync(
      // folder to build routes
      routes_path,
      { recursive: true, withFileTypes: true }
    );

    function create_route(route: string, filename: string) {

      const final_route = posix.join(route, filename);

      if (filename.startsWith('[')) {
        const catch_all = filename.includes('...');
        dynamic_routes.add(`\n\t"${route}" : { route:"${final_route}", catch_all: ${catch_all} }`);
      }

      return final_route;
    }

    function check_route(route: string, filepath: string) {
      if (routes_for_check.has(route)) {
        print(`ERROR: [react-router] duplicate route: ${route}\n  at ${filepath};r`);
        return true;
      }
      routes_for_check.add(route)
    }

    for (const file of source) {

      const path = join((file.parentPath || file.path), file.name);
      const source_path = normalizePath("/" + relative(process.cwd(), path));

      const ext = extname(source_path);
      const filename = file.name.replace(ext, '');

      let route = normalizePath(
        source_path
          .replace(src_routes, '')
          .replace(file.name, '')
      );


      if (file.isFile()) {

        if (filename == 'index') {

          route = route.slice(0, route.length - 1);
        } else {

          route = create_route(route, filename);
        }

        if (check_route(route, path)) {
          continue;
        }

        routes[route] = path;

        print('route;m', route, path + ';g')

        if (dev_server) {
          dev_server.transformRequest(source_path)
        };

      } else {

        route = create_route(route, filename);

      }
    };

    // check routes

    if (dev_server) {
      dev_server.transformRequest('@react-router/src/build.ts');
    };

  }

  return {
    name: 'vite-plugin-react-router',
    enforce: "pre",

    config() {
      return {
        resolve: {
          alias: {
            "react-router": resolve(`${process.cwd()}/react-router/lib.ts`),
            // [`@${src}`]: resolve(`${process.cwd()}/${src}`)
          }
        },
        server: {
          watch: {
            // Specifica la cartella da monitorare 
            paths: `${src_routes}/**/*`,
            ignored: ['node_modules/**', 'react-router/**']
          }
        }
      }
    },

    configResolved(config) {
      // print(config)
      // TODO USE FOR HMR
      cmd = config.command;
      print('CMD;m', cmd)
    },

    configureServer(server) {
      dev_server = server;

      server.watcher.on('add', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} created`);
          // build()
          dev_server.restart()
        }
      });

      server.watcher.on('change', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} changed`);
          // build()
          dev_server.restart()
        }
      });

      server.watcher.on('unlink', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} deleted`);
          // build()
          dev_server.restart()
        }
      });

      // server.middlewares.use('/@rce/client.js', async function name(req, res, next) {
      //   print('requested client.js'.y())
      //   let code = readFileSync(join(__dirname, '/client.js'), 'utf-8');
      //   res.writeHead(200, { 'content-type': 'application/javascript' });
      //   res.write(code);
      //   res.end();
      // })
    },


    buildStart() {
      build()
    },

    // build-time
    // 1.
    async resolveId(id, _importer) {

      // if (is_route(id)) {

      //   // print('src;m', normalizePath(relative(process.cwd(), id)))
      //   const resolved_id = route_components.get(id) || normalizePath(relative(process.cwd(), id));
      //   const code = await readFile(id, 'utf-8');
      //   cache.set(resolved_id, code)
      //   // return { id }
      //   return { id: resolved_id }
      // }

      if (id.startsWith('@react-router')) {
        id = id.replace('@', '/')
        return { id }
      }

    },
    // 2. load code from id
    async load(id) {
      if (id == '/react-router/src/build.ts') {
        return ""
      }

      if (id == '/react-router/src/clientRouter.ts') {
        const code = await readFile(join(process.cwd(), id), 'utf-8');
        // print(code)
        return code;
      }

      // if (cache.has(id)) {
      //   return cache.get(id)
      // }

    },
    // 3.
    transform(code, id) {
      if (id == '/react-router/src/build.ts') {
        print('trasnform build;m')

        return {
          code: build_routes(routes, dynamic_routes),
          map: null
        }
      }

      if (id == '/react-router/src/clientRouter.ts') {
        print('trasnform clientRouter;m')
        return {
          code,
          map: null
        }
      }
      // if (is_src(id)) {
      //   // print('transform src', id)

      // }
      // if (is_route(id)) {
      //   // filter only jsx/tsx file
      //   print('transform;y', id);

      //   // parser(id, code)
      // }
    },

    shouldTransformCachedModule(options) {
      print(options)
    },
  }
}

export default reactRouter;