import { relative, resolve } from "path";
import { print, to_posix } from "../utils/shortcode";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

type StringObject = { [key: string]: string };

export function routes_parser(routes: StringObject, dynamic_routes: string[], code: string) {

  let imports = '';
  let components: string[] = [];
  let path_types: string[] = [];

  let import_index = 0
  for (let [path, from] of Object.entries(routes)) {

    const name = `Page_${import_index}`;
    from = to_posix(relative(process.cwd(), from))

    imports += `import ${name} from '/${from}';\n`;
    components.push(`"${path}":${name}`);
    if (path != '/') path_types.push(`"${path}"`);

    ++import_index;
  }

  code = code
    .replace('/*imports*/', imports)
    .replace('/*COMPONENTS*/', components.join(','))
    .replace('/*DYNAMIC_ROUTES*/', dynamic_routes.join(','))

  // print(code)

  // BUILD TYPES FOR DEV
  let types_code = readFileSync(resolve(__dirname, '../.local/types.template'), 'utf-8');
  types_code = types_code
    .replace('/*ROUTES_TYPES*/', path_types.join(' | '))

  // print(types_code)
  writeFile(resolve(__dirname, '../.local/types.ts'), types_code, 'utf-8')

  return code;
}