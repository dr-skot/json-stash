// a ref is a placeholder for a value that has already been seen
// the _stashRef is a path to the value in some reference object
import { deepForEach, deepMap, hasOwnProperty, isPlainObject } from "./utils";
import { Stash } from "./stash";

export type Ref = {
  _stashRef: string;
};

export function isRef(value: unknown): value is Ref {
  return isPlainObject(value) && "_stashRef" in value;
}

export function hasRefs(value: unknown) {
  let result = false;
  deepForEach((v) => {
    if (isRef(v)) result = true;
  })(value);
  return result;
}

// if the value is non-primitive and has been passed to this function before,
// returns a ref; otherwise returns the value
type RefSaver = (path: string, value: unknown) => unknown;
export function getRefSaver(): RefSaver {
  const seen: Record<string, object> = {};

  function refSaver(path: string, value: unknown) {
    if (value === null || typeof value !== "object") return value;
    const found = Object.entries(seen).find(([, v]) => v === value);
    if (found) return { _stashRef: found[0] };
    seen[path] = value;
    return value;
  }

  return refSaver;
}

export function getRefResolver(root: Stash) {
  const refs: Record<string, unknown> = {};

  // find all the ref paths in the object
  deepForEach((v) => {
    const path = (v as Ref)?._stashRef;
    if (path) refs[path] = v;
  })(root);

  // assign a value to a ref, if a ref to the path exists
  function registerValue(value: unknown, path: string) {
    if (hasOwnProperty(refs, path)) refs[path] = value;
    return value;
  }

  const resolve = deepMap(
    (v) => {
      if (isRef(v)) return refs[v._stashRef];
      else return v;
    },
    { depthFirst: true, inPlace: true }
  );

  return { registerValue, resolve };
}
