// a regular old key-value pair object that isn't an instance of a class other than Object
export function isPlainObject(value: unknown): value is object {
  return value?.constructor === Object;
}

// a value that can be reliably serialized by JSON.stringify
export function isVanilla(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    (typeof value === "number" &&
      ![Infinity, -Infinity, NaN].includes(value)) ||
    typeof value === "boolean" ||
    Array.isArray(value) ||
    (isPlainObject(value) && !hasSymbolKeys(value))
  );
}

// breadth-first traversal, no protection against circular references
export function deepForEach(fn: (v: unknown) => void) {
  function recurse(node: unknown): void {
    fn(node);
    if (Array.isArray(node)) node.forEach(recurse);
    if (isPlainObject(node)) Object.values(node).forEach(recurse);
  }

  return recurse;
}

// returns a copy, unless inPlace is true
// depth-first traversal, unless depthFirst is false
// avoids circular references, unless avoidCircular is false
export function deepMap(
  fn: (v: unknown, path: string) => unknown,
  opts = { inPlace: true, depthFirst: true, avoidCircular: true },
) {
  const seen = new WeakSet();
  function recurse(node: unknown, path: string): unknown {
    // don't recurse infinitely on circular references
    if (opts.avoidCircular && (isPlainObject(node) || Array.isArray(node))) {
      if (seen.has(node)) return node;
      seen.add(node);
    }
    if (!opts.depthFirst) node = fn(node, path);
    if (Array.isArray(node)) {
      const array = opts.inPlace ? node : [...node];
      for (let i = 0; i < array.length; i++) {
        array[i] = recurse(array[i], appendPath(path, i));
      }
      node = array;
    }
    if (isPlainObject(node)) {
      const obj = opts.inPlace ? node : { ...node };
      // TODO in ignores symbol keys -- test symbol keys and make this work properly
      for (const k in obj) {
        // @ts-ignore - ts, man, I just don't get you sometimes
        //    `obj[k]` isn't allowed inside `for (k in obj)`??
        obj[k] = recurse(obj[k], appendPath(path, k));
      }
      node = obj;
    }
    if (opts.depthFirst) node = fn(node, path);
    return node;
  }

  return (value: unknown) => recurse(value, "");
}

export function hasOwnProperty(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function appendPath(path: string, key: string | number) {
  return path ? `${path}.${key}` : `${key}`;
}

export interface Class<Type = any, Args extends unknown[] = any[]> {
  new (...args: Args): Type;
}

export function getOwnKeys<T extends Object>(obj: T): (keyof T)[] {
  return [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ] as (keyof T)[];
}

export function hasSymbolKeys(obj: object) {
  return Object.getOwnPropertySymbols(obj).length > 0;
}
