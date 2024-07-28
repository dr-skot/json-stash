type PlainObject = Record<string | symbol, unknown>;

// a regular old key-value pair object that isn't an instance of a class other than Object
export function isPlainObject(value: unknown): value is PlainObject {
  return value?.constructor === Object;
}

// a value that can be reliably serialized by JSON.stringify
export function isVanilla(value: unknown) {
  const type = typeof value;
  return (
    // == null matches null and undefined
    value == null ||
    (/^string|boolean|number$/.test(type) &&
      ![Infinity, -Infinity, NaN].includes(value as number)) ||
    Array.isArray(value) ||
    (isPlainObject(value) && !hasSymbolKeys(value))
  );
}

// breadth-first traversal, no protection against circular references
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are specially encoded
export function deepForEach(fn: (v: unknown) => void) {
  function recurse(node: unknown): void {
    fn(node);
    if (Array.isArray(node)) node.forEach(recurse);
    if (isPlainObject(node)) Object.values(node).forEach(recurse);
  }

  return recurse;
}

type DeepMapOpts = {
  inPlace: boolean;
  depthFirst: boolean;
  avoidCircular: boolean;
};

const DEFAULT_DEEP_MAP_OPTS: DeepMapOpts = {
  inPlace: true,
  depthFirst: true,
  avoidCircular: true,
};

// returns a copy, unless inPlace is true
// depth-first traversal, unless depthFirst is false
// avoids circular references, unless avoidCircular is false
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
export function deepMap(
  fn: (v: unknown, path: string) => unknown,
  opts?: Partial<DeepMapOpts>,
) {
  const o = { ...DEFAULT_DEEP_MAP_OPTS, ...opts };

  const seen = new WeakSet();
  function recurse(node: unknown, path: string): unknown {
    // don't recurse infinitely on circular references
    if (o.avoidCircular && (Array.isArray(node) || isPlainObject(node))) {
      if (seen.has(node)) return node;
      seen.add(node);
    }

    // breadth-first? then do callback function before recursing
    if (!o.depthFirst) node = fn(node, path);

    // recurse if node is an array or object
    if (Array.isArray(node)) {
      const array = o.inPlace ? node : [...node];
      for (let i = 0; i < array.length; i++) {
        array[i] = recurse(array[i], path ? `${path}.${i}` : `${i}`);
      }
      node = array;
    }
    if (isPlainObject(node)) {
      // we ignore symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
      const obj = o.inPlace ? node : { ...node };
      for (const k in obj) {
        obj[k] = recurse(obj[k], path ? `${path}.${k}` : `${k}`);
      }
      node = obj;
    }

    // depth-first? then do callback function after recursing
    if (o.depthFirst) node = fn(node, path);

    return node;
  }

  return (value: unknown) => recurse(value, "");
}

// works even on objects with a property "hasOwnProperty"
export function hasOwnProperty(obj: object, key: string) {
  return Object.hasOwnProperty.call(obj, key);
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

export const isFunction = (x: unknown): x is Function =>
  typeof x === "function";
