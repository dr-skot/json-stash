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
  let refState: "unresolved" | "resolving" | "resolved" = "unresolved";

  // find all the ref paths in the object
  deepForEach((v) => {
    const path = (v as Ref)?._stashRef;
    if (path && !refs[path]) refs[path] = v;
  })(root);

  // assign a value to a ref, if a ref to the path exists
  function registerValue(value: unknown, path: string) {
    if (hasOwnProperty(refs, path)) refs[path] = value;
    return value;
  }

  function insureResolvedRoot() {
    if (refState !== "unresolved") return;
    refState = "resolving";
    deepMap(
      (node) => {
        return isRef(node) ? refs[node._stashRef] : node;
      },
      { depthFirst: true, inPlace: true, avoidCircular: false }
    )(root);
    refState = "resolved";
  }

  const resolve = deepMap(
    (node) => {
      // insureResolvedRoot();
      const derefNode = isRef(node) ? refs[node._stashRef] : node;
      // return unescapeKeys(derefNode);
      return derefNode;
    },
    { depthFirst: true, inPlace: true, avoidCircular: false }
  );

  return { registerValue, resolve };
}
