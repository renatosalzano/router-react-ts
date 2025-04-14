import { basename, dirname, extname, join, posix, relative, resolve } from "path";
import { print, time } from "../utils/shortcode";
import { readdirSync } from "fs";
import { normalizePath } from "vite";
import { writeFile } from "fs/promises";


let IMPORTS: string = '';
let COMPONENTS: string = '';
let MODULES: string = ''
let DYNAMIC_ROUTES: string = '';


function build(src_routes: string) {

  print(time(';1'), '[react-router];c', 'build routes.');

  const routes = new Map<string, string>();

  const dynamic_routes = new Map<string, { segments: number, catch_all: boolean, output: string }>();
  const catch_all_routes = new Map<string, string>();

  const routes_path = resolve(process.cwd(), src_routes)

  const source = readdirSync(
    routes_path,
    { recursive: true, withFileTypes: true }
  );


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

    if (route !== '/') {
      route = route.endsWith('/')
        ? route.slice(0, route.length - 1)
        : route
    }


    if (file.isFile()) {

      const parent_route = route;
      const parent_filename = basename(dirname(route))

      route = filename != 'index'
        ? posix.join(route, filename)
        : route;

      if (filename.startsWith('[') || parent_filename.startsWith('[')) {

        const catch_all = filename.includes('...');

        let segments = route.split('/').length - 1;
        let output = '';

        if (catch_all) {

          catch_all_routes.set(parent_route, route);
          const reg = new RegExp(`^${route
              .replace(/[\.]{3}/g, '')
              .replace(/\[.*?\]/g, '(.*?)')
            }$`, 'gs');
          output = `\n\t\t{ reg: ${reg}, route:"${route}", score:${segments} }`

        } else {


          const reg = new RegExp(`^${route.replace(/\[.*?\]/g, '(.*?)')}$`, 'gs');

          output = `\n\t\t{ reg: ${reg}, route:"${route}" }`
        }

        dynamic_routes.set(route, { segments, catch_all, output })
      }

      routes.set(route, source_path);

      print('route;m', route, source_path + ';g')

      // if (dev_server) {
      //   dev_server.transformRequest(source_path)
      // };

    } // end is file
  } // end files loop


  const dynamic_routes_output: { [key: string | number]: string[] } = { catch_all: [] };

  // check routes
  for (const [route, { segments, catch_all, output }] of dynamic_routes.entries()) {

    if (catch_all) {
      dynamic_routes_output['catch_all'].push(output)
      continue;
    }

    if (catch_all_routes.has(dirname(route))) {
      if (basename(route).startsWith('[')) {
        // error

        const jolly_route = catch_all_routes.get(dirname(route))
        print(`error [react-router] Route "${route}" because is already handled by "${jolly_route}"\n  at ${routes.get(route)};r`);
        dynamic_routes.delete(route);
        routes.delete(route);
        continue;
      }
    }

    if (dynamic_routes_output[segments]) {
      dynamic_routes_output[segments].push(output);
    } else {
      dynamic_routes_output[segments] = [output];
    }
  }


  // SERIALIZE OUTPUT

  let route_index = 0;

  for (const [route, from] of routes.entries()) {
    IMPORTS += `import * as Route_${route_index} from '${from}';\n`;
    COMPONENTS += `\n\t'${route}': Route_${route_index}.default,`
    MODULES += `\n\t'${route}': Route_${route_index},`
    route_index++;
  }

  for (const [key, value] of Object.entries(dynamic_routes_output)) {
    DYNAMIC_ROUTES += `\n\t${key}: [${value.join(',')}\n\t],`
  }

  // return {
  //   IMPORTS,
  //   COMPONENTS,
  //   MODULES,
  //   DYNAMIC_ROUTES
  // }

}


function build_routes(code: string) {

  code = code
    .replace('/* IMPORTS */', IMPORTS)
    .replace('/* MODULES */', MODULES)
    .replace('/* COMPONENTS */', COMPONENTS)
    .replace('/* DYNAMIC_ROUTES */', DYNAMIC_ROUTES)

  writeFile(resolve(__dirname, '../.local/routes.ts'), code, 'utf-8')

  return code;

}


export {
  build,
  build_routes
};