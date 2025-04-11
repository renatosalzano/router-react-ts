
import { createFilter, normalizePath } from 'vite';
import type {
  Plugin,
  ViteDevServer
} from "vite"
import { dirname, extname, join, parse, posix, relative, resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { print } from './utils/shortcode';
import { routes_parser } from './parser/routes';


function get_code(path: string): string {
  print('GET CODE;m', path)
  const code = readFileSync(path, 'utf-8')
  return code;
}

function reactRouter(): Plugin {

  const src = 'src/pages';
  let dev_server: ViteDevServer;

  const routes: { [key: string]: string } = {};
  const dynamic_routes: string[] = [];

  print(resolve(`${process.cwd()}/react-router`))

  const is_src = createFilter(
    `src/**/*.{js,ts,jsx,tsx}`,
    'node_modules/**'
  );


  const is_route = createFilter(
    `${src}/**/*.{jsx,tsx}`,
    'node_modules/**'
  );


  function build() {

    const routes_path = resolve(process.cwd(), src)

    const source = readdirSync(
      // folder to build routes
      routes_path,
      { recursive: true, withFileTypes: true }
    );

    for (const file of source) {

      if (file.isFile()) {

        const path = resolve((file.parentPath || file.path), file.name);
        const filename = parse(path).name;
        // print('filename;m', filename);

        let route = dirname(path)
          .replace(routes_path, "")
          .replace(/\\/g, '/')

        if (filename == '404') {
          route = '404'
        } else if (filename != 'index') {

          const final_route = posix.join(route, filename);

          if (filename.startsWith('[')) {
            const slug = filename.match(/(?<=\[).*?(?=\])/gm)
            dynamic_routes.push(`"${route}" : { route:"${final_route}", slug:"${slug}" }`);
          }

          // print(dynamic_routes)

          route = final_route;
        }

        route = route || '/';

        routes[route] = path;

        print('route;m', route)


        if (dev_server) {

          if (is_route(path)) {
            dev_server.transformRequest(path)
          }
        };
      }
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
            paths: `${src}/**/*`,
            ignored: ['node_modules/**', 'react-router/**']
          }
        }
      }
    },

    configureServer(server) {
      dev_server = server;

      server.watcher.on('add', (path) => {
        console.log(`File ${path} has been created`);
        // Gestisci la creazione del file qui 
        build()
      });

      server.watcher.on('change', (path) => {
        console.log(`File ${path} has been changed`);
        // Gestisci l'eliminazione del file qui 
      });

      server.watcher.on('unlink', (path) => {
        console.log(`File ${path} has been deleted`);
        // Gestisci l'eliminazione del file qui
        build()
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
    resolveId(id, importer) {
      if (id.startsWith('@react-router')) {
        id = id.replace('@', '/')
        print('intercepted react-router;m', id)
        return { id }
      }

    },
    // 2. load code from id
    load(id) {
      switch (id) {
        case '/react-router/build':
          return get_code(join(__dirname, '/build.ts'))
      }
    },
    // 3.
    transform(code, id) {
      if (id == '/react-router/build') {
        print('trasnform build;m')
        return {
          code: routes_parser(routes, dynamic_routes, code),
          map: null
        }
      }
      if (is_src(id)) {
        // print('transform src', id)

      }
      if (is_route(id)) {
        // filter only jsx/tsx file
        print('transform;y', id);

        // parser(id, code)
      }
    },
  }
}

export default reactRouter;