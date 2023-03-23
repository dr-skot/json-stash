import { deepForEach, deepMap, hasOwnProperty, isPlainObject } from "./utils";
import { Stash } from "./stash";
import { isEscaped } from "./escape";

// a ref is a placeholder for an object that occurs elsewhere in the stash
export type Ref = {
  // path to the object from the stash root
  _stashRef: string;
};

export function isRef(value: unknown): value is Ref {
  return (
    isPlainObject(value) &&
    hasOwnProperty(value, "_stashRef") &&
    !isEscaped(value)
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
    const refPath = cache.get(value);
    if (refPath) return { _stashRef: refPath };
    cache.set(value, path);
    return value;
  }

  return refSaver;
}

export function getRefResolver(root: Stash) {
  const refs = new Map<string, unknown>();
  let refState: "unresolved" | "resolving" | "resolved" = "unresolved";

  // find all the ref paths in the object
  // root is just-parsed JSON, so no need to worry about circular refs
  deepForEach((node) => {
    if (isRef(node) && !refs.has(node._stashRef)) {
      refs.set(node._stashRef, node);
    }
  })(root);

  // assign a value to a ref, if a ref to the path exists
  function registerValue(value: unknown, path: string) {
    if (refs.has(path)) refs.set(path, value);
    return value;
  }

  const resolve = deepMap(
    (node) => (isRef(node) ? refs.get(node._stashRef) : node),
    { depthFirst: true, inPlace: true, avoidCircular: false }
  );

  return { registerValue, resolve };
}
