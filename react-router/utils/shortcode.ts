// export function print(message?: any, ...optionalParams: any[]): void {
//   return console.log(message, ...optionalParams)
// }


const colors: any = {
  // fg
  0: 30,
  r: 31,
  g: 32,
  y: 33,
  b: 34,
  m: 95,
  c: 36,
  w: 37,
  // bg
  R: 41,
  G: 42,
  Y: 43,
  B: 44,
  M: 45,
  C: 46,
  W: 47
};

export function print(...logs: any[]) {
  let output = [];
  for (let message of logs) {

    if (typeof message !== 'string') {
      output.push(message);
      continue;
    }

    let match: any = message.match(/;.*?$/g);

    if (match) {
      match = match[0].trim();
      message = message.replace(match, '');
      for (let index = 1; index < match.length; ++index) {
        message = `\x1b[${colors[match[index]]}m${message}`;
      }
      message += '\x1b[0m';
    };

    output.push(message);
  };
  console.log(...output);
};

export function to_posix(path: string) {
  return path.replace(/\\/g, '/')
}