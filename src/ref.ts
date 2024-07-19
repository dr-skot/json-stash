import { deepForEach, deepMap, hasOwnProperty, isPlainObject } from "./utils";
import { StashRoot } from "./stash";
import { isEscaped } from "./escape";

// a ref is a placeholder for an object that occurs elsewhere in the stash
export type Ref = {
  // path to the object from the stash root
  $ref: string;
};

export function isRef(value: unknown): value is Ref {
  return (
    isPlainObject(value) && hasOwnProperty(value, "$ref") && !isEscaped(value)
  );
}

// not safe with circular objects
export function hasRefs(value: unknown) {
  let result = false;
  deepForEach((node) => {
    if (isRef(node)) result = true;
  })(value);
  return result;
}

// if the value is non-primitive and has been passed to this function before,
// returns a ref; otherwise returns the value
type RefSaver = (path: string, value: unknown) => unknown;
export function getRefSaver(): RefSaver {
  const cache = new WeakMap<object, string>();

  function refSaver(path: string, value: unknown) {
    if (value === null || typeof value !== "object") return value;
    const refPath = cache.get(value as object);
    if (refPath) return { $ref: refPath };
    cache.set(value as object, path);
    return value;
  }

  return refSaver;
}

export function getRefResolver(root: StashRoot) {
  const refs = new Map<string, unknown>();

  // find all the ref paths in the object
  // root is just-parsed JSON, so no need to worry about circular refs
  deepForEach((node) => {
    if (isRef(node) && !refs.has(node.$ref)) {
      // save the ref node here for now as a placeholder
      // it will be overwritten with the actual value by `registerValue`
      refs.set(node.$ref, node);
    }
  })(root);

  // assign a value to a ref, if a ref to the path exists
  function registerValue(value: unknown, path: string) {
    if (refs.has(path)) refs.set(path, value);
    return value;
  }

  const resolve = deepMap(
    (node) => (isRef(node) ? refs.get(node.$ref) : node),
    { depthFirst: true, inPlace: true, avoidCircular: false },
  );

  return { registerValue, resolve };
}
