// a ref is a placeholder for a value that has already been seen
// the _stashRef is a path to the value in some reference object
import { getPath, isObject } from "./utils";

export type Ref = {
  _stashRef: string;
};
// a function that tracks values and returns a ref when a value is repeated
// (if the value is an object or an array)
// otherwise returns the value
export type RefSaver = (path: string, value: unknown) => unknown;

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

export function isRef(value: unknown): value is Ref {
  return isObject(value) && "_stashRef" in value;
}

export function resolveRef(context: object, ref: Ref) {
  return getPath(context, ref._stashRef);
}
