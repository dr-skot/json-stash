// a regular old key-value pair object that isn't an instance of a class other than Object
export function isPlainObject(
  value: unknown,
): value is Record<string | symbol, unknown> {
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
  isLeaf: (node: unknown) => boolean;
};

const DEFAULT_DEEP_MAP_OPTS: DeepMapOpts = {
  inPlace: true,
  depthFirst: true,
  avoidCircular: true,
  isLeaf: () => false,
};

// returns a copy, unless inPlace is true
// depth-first traversal, unless depthFirst is false
// avoids circular references, unless avoidCircular is false
// NOTE: ignores symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
export function deepMap(
  fn: (v: unknown, path: string) => unknown,
  opts?: Partial<DeepMapOpts>,
) {
  const { inPlace, depthFirst, avoidCircular, isLeaf } = {
    ...DEFAULT_DEEP_MAP_OPTS,
    ...opts,
  };

  const seen = new WeakSet();
  function recurse(node: unknown, path: string): unknown {
    const nodeType = isLeaf(node)
      ? "leaf"
      : Array.isArray(node)
        ? "array"
        : isPlainObject(node)
          ? "object"
          : "leaf";

    // don't recurse infinitely on circular references
    if (avoidCircular && nodeType !== "leaf") {
      if (seen.has(node as object)) return node;
      seen.add(node as object);
    }

    // breadth-first? then do callback function before recursing
    if (!depthFirst) node = fn(node, path);

    // recurse if node is an array or object
    if (nodeType === "array") {
      let array = node as unknown[];
      array = inPlace ? array : [...array];
      for (let i = 0; i < array.length; i++) {
        array[i] = recurse(array[i], appendPath(path, i));
      }
      node = array;
    }
    if (nodeType === "object") {
      // we ignore symbol keys; not an issue for json-stash because symbol-keyed objects are converted to arrays
      let obj = node as Record<string, unknown>;
      obj = inPlace ? obj : { ...obj };
      for (const k in obj) {
        obj[k] = recurse(obj[k], appendPath(path, k));
      }
      node = obj;
    }

    // depth-first? then do callback function after recursing
    if (depthFirst) node = fn(node, path);

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
