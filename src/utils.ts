export function isPlainObject(value: unknown): value is object {
  return value?.constructor === Object;
}

export function isVanilla(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
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
    if (isPlainObject(node)) eachValue(node, recurse);
  }

  return recurse;
}

export function eachValue(obj: object, fn: (v: unknown, k: string) => void) {
  Object.entries(obj).forEach(([k, v]) => fn(v, k));
}

export function deepMap(
  fn: (v: unknown, path: string) => unknown,
  opts = { inPlace: true, depthFirst: true, avoidCircular: true }
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

export function evalVariableName(name: string, evalFunction: Function) {
  return name.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/)
    ? evalFunction(name)
    : undefined;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
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

export function entriesWithSymbols<T extends Object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return getOwnKeys(obj).map((key) => [key, obj[key]]);
}
