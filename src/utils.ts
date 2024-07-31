type PlainObject = Record<string | symbol, unknown>;

// a regular old key-value pair object that isn't an instance of a class other than Object
export function isPlainObject(value: unknown): value is PlainObject {
  return value?.constructor === Object;
}

export const { isArray } = Array;
const {
  getOwnPropertyNames,
  getOwnPropertySymbols,
  values,
  keys,
  assign,
  fromEntries,
} = Object;
export { keys, assign, fromEntries };

// a value that can be reliably serialized by JSON.stringify
export function isVanilla(value: unknown) {
  const type = typeof value;
  return (
    // == null matches null and undefined
    value == null ||
    (/^string|boolean|number$/.test(type) &&
      ![Infinity, -Infinity, NaN].includes(value as number)) ||
    isArray(value) ||
    (isPlainObject(value) && !hasSymbolKeys(value))
  );
}

// breadth-first traversal, no protection against circular references
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are specially encoded
export function deepForEach(fn: (v: unknown) => void) {
  function recurse(node: unknown): void {
    fn(node);
    if (isArray(node)) node.forEach(recurse);
    if (isPlainObject(node)) values(node).forEach(recurse);
  }

  return recurse;
}

type DeepMapOpts = {
  inPlace: boolean;
  depthFirst: boolean;
  avoidCircular: boolean;
};

// returns a copy, unless inPlace is true
// depth-first traversal, unless depthFirst is false
// avoids circular references, unless avoidCircular is false
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
export function deepMap(
  fn: (v: unknown, path: string) => unknown,
  inPlace = true,
  depthFirst = true,
  avoidCircular = true,
) {
  const seen = new WeakSet();
  function recurse(node: unknown, path: string): unknown {
    // don't recurse infinitely on circular references
    if (avoidCircular && (isArray(node) || isPlainObject(node))) {
      if (seen.has(node)) return node;
      seen.add(node);
    }

    // breadth-first? then do callback function before recursing
    if (!depthFirst) node = fn(node, path);

    // recurse if node is an array or object
    if (isArray(node)) {
      const array = inPlace ? node : [...node];
      for (let i = 0; i < array.length; i++) {
        array[i] = recurse(array[i], path ? `${path}.${i}` : `${i}`);
      }
      node = array;
    }
    if (isPlainObject(node)) {
      // we ignore symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
      const obj = inPlace ? node : { ...node };
      for (const k in obj) {
        obj[k] = recurse(obj[k], path ? `${path}.${k}` : `${k}`);
      }
      node = obj;
    }

    // depth-first? then do callback function after recursing
    if (depthFirst) node = fn(node, path);

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
    ...getOwnPropertyNames(obj),
    ...getOwnPropertySymbols(obj),
  ] as (keyof T)[];
}

export function hasSymbolKeys(obj: object) {
  return getOwnPropertySymbols(obj).length > 0;
}

export const isFunction = (x: unknown): x is Function =>
  typeof x === "function";
