import { relative, resolve } from "path";
import { print, to_posix } from "../utils/shortcode";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

const HMR = `
if (import.meta.hot) {
  import.meta.hot.accept();
}
`

type StringObject = { [key: string]: string };

export function build_routes(routes: StringObject, dynamic_routes: Set<string>) {

  let code = readFileSync(resolve(__dirname, './build.ts'), 'utf-8');

  let imports = '';
  let components: string[] = [];
  let modules: string[] = [];
  let path_types: string[] = [];

  let import_index = 0
  for (let [path, from] of Object.entries(routes)) {

    const name = `Page_${import_index}`;
    from = to_posix(relative(process.cwd(), from))

    imports += `import * as ${name} from '/${from}';\n`;

    components.push(`\n\t"${path}": ${name}.default`);
    modules.push(`\n\t"${path}": ${name}`)


    if (path != '/') path_types.push(`"${path}"`);

    ++import_index;
  }

  code = code
    .replace('/* IMPORTS */', imports)
    .replace('/* MODULES */', modules.join(','))
    .replace('/* COMPONENTS */', components.join(','))
    .replace('/* DYNAMIC_ROUTES */', [...dynamic_routes].join(','))

  // TODO IF DEV
  code = code
    .replace('/* HMR */', HMR)

  // DEV PREVIEW
  writeFile(resolve(__dirname, '../.local/build.ts'), code, 'utf-8')

  return code;
}