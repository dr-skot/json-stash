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
  return (
    // == null matches null and undefined
    value == null ||
    // string bool or number but not Infinity or NaN
    (/^(st|bo|n)/.test(typeof value) &&
      ![1 / 0, -1 / 0, NaN].includes(value as number)) ||
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
  return function (value: unknown) {
    const visited = new WeakSet();

    function recurse(node: unknown, path: string): unknown {
      // don't recurse infinitely on circular references
      if (avoidCircular && (isArray(node) || isPlainObject(node))) {
        if (visited.has(node)) return node;
        visited.add(node);
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
          // escape periods in key names (and escape the escape character)
          const key = k.replace(/[\\.]/g, "\\$&");
          obj[k] = recurse(obj[k], path ? `${path}.${key}` : key);
        }
        node = obj;
      }

      // depth-first? then do callback function after recursing
      if (depthFirst) node = fn(node, path);

      return node;
    }

    return recurse(value, "");
  };
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

export function error(message: string) {
  return new Error("json-stash: " + message);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
