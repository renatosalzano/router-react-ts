
import { createFilter } from 'vite';
import type {
  Plugin,
  ViteDevServer
} from "vite"
import { join, resolve } from 'path';
import { print } from './utils/shortcode';
// import { build_routes } from './src/build_routes';
import { readFile } from 'fs/promises';
import { build, build_routes } from './server/build';

function reactRouter(): Plugin {


  const src_routes = 'src/pages';

  let dev_server: ViteDevServer;
  let cmd: string;

  const is_route = createFilter(
    `${src_routes}/**/*.{jsx,tsx}`,
    'node_modules/**'
  );


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

      server.watcher.on('unlink', (path) => {
        if (is_route(path)) {
          console.log(`File ${path} deleted`);
          // build()
          dev_server.restart()
        }
      });

      // server.watcher.on('change', (path) => {
      //   if (is_route(path)) {
      //     console.log(`File ${path} changed`);
      //     // build()
      //     dev_server.restart()
      //   }
      // });

    },


    buildStart() {

      build(src_routes);

      if (dev_server) {
        dev_server.transformRequest('@react-router/client/routes.ts')
      }
    },

    buildEnd(error) {
      if (error) {
        console.error('Error bundling')
        console.error(error)
        process.exit(1)
      } else {
        console.log('Build ended')
      }
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

      if (id.startsWith('/react-router/client')) {
        const code = await readFile(join(process.cwd(), id), 'utf-8');
        // print(code)
        return code;

      }

    },
    // 3.
    transform(code, id) {
      if (id == '/react-router/client/routes.ts') {
        print('build routes;m')
        code = build_routes(code);
        // print(code)

        return {
          code,
          map: null
        }
      }

    },

    // shouldTransformCachedModule(options) {
    //   print(options)
    // },
  }
}

export default reactRouter;