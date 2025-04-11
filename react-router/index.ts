
import { createFilter, normalizePath } from 'vite';
import type {
  Plugin,
  ViteDevServer
} from "vite"
import { dirname, join, parse, posix, relative, resolve } from 'path';
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
  const route_components = new Map<string, string>();
  const cache = new Map<string, string>();

  const is_src = createFilter(
    `src/**/*.{js,ts,jsx,tsx}`,
    'node_modules/**'
  );

  const is_route = createFilter(
    `${src_routes}/**/*.{jsx,tsx}`,
    'node_modules/**'
  );


  function build() {

    print(time(';1'), '[react-router];c', 'build routes.')

    const routes_path = resolve(process.cwd(), src_routes)

    const source = readdirSync(
      // folder to build routes
      routes_path,
      { recursive: true, withFileTypes: true }
    );

    for (const file of source) {

      if (file.isFile()) {

        const id = join(file.parentPath, file.name);
        const source_path = normalizePath("/" + relative(process.cwd(), id));

        // print(source_path)

        const path = resolve((file.parentPath || file.path), file.name);
        const filename = parse(path).name;

        // print('filename;m', filename);

        let route = dirname(path)
          .replace(routes_path, "")
          .replace(/\\/g, '/')

        if (/[0-9]{3}/.test(filename)) {
          route = filename;
        } else if (filename != 'index') {

          const final_route = posix.join(route, filename);

          if (filename.startsWith('[')) {
            const limit = Number(filename.match(/(?<=\{).*?(?=\})/gm) || 1)
            dynamic_routes.add(`\n\t"${route}" : { route:"${final_route}", slug_size: ${limit} }`);
          }

          // print(dynamic_routes)

          route = final_route;
        }

        route = route || '/';

        routes[route] = path;

        print('route;m', route, path + ';g')

        if (dev_server) {
          dev_server.transformRequest(source_path)
        };

      }
    };

    if (dev_server) {
      dev_server.transformRequest('@react-router/src/clientRouter.ts')
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
          build()
        }
      });

      server.watcher.on('change', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} changed`);
          build()
        }
      });

      server.watcher.on('unlink', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} deleted`);
          build()
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
        print('resolved;m', id)
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
  }
}

export default reactRouter;