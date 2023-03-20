import {
  deepForEach,
  depthFirstForEach,
  depthFirstMap,
  depthFirstMapInPlace,
  hasOwnProperty,
  isArray,
  isPlainObject,
  mapValues,
} from "./utils";
import { getRefSaver, isRef, Ref, RefSaver } from "./ref";
import {
  dereference,
  deserialize,
  isDeserializable,
  serializeValue,
} from "./serialize";

export function toJSON(raw: unknown) {
  const stash = encode({ _stashRoot: raw });
  return JSON.stringify((stash as { _stashRoot: unknown })._stashRoot);
}

export function fromJSON(json: string) {
  const result = { _stashRoot: JSON.parse(json) };
  // resolve all refs and deserialize special types
  const resolved: any = resolve(result);
  return resolved._stashRoot;
}

//
// internals
//

function encode(raw: unknown) {
  return recursivelyEncode(raw, "$", getRefSaver());
}

function recursivelyEncode(
  rawValue: unknown,
  path: string,
  refSaver: RefSaver
): unknown {
  let value = refSaver(path, rawValue);
  // if value is not raw, we have a ref, so return it
  if (value !== rawValue) return value;
  value = serializeValue(value);
  if (isArray(value))
    return value.map((v, i) => recursivelyEncode(v, `${path}.${i}`, refSaver));
  if (isPlainObject(value))
    return mapValues(value, (v, k) =>
      recursivelyEncode(v, `${path}.${k}`, refSaver)
    );
  return value;
}

function resolve(value: unknown) {
  if (value === null || typeof value !== "object") return value;

  // collect all the ref paths in the object
  const refs: Record<string, unknown> = {};
  deepForEach((v) => {
    const path = (v as Ref)?._stashRef;
    if (path) refs[path] = null;
  })(value);

  // we'll put the reffed objects in this table
  function recordIfHasRefs(value: unknown, path: string) {
    if (hasOwnProperty(refs, path)) refs[path] = value;
    return value;
  }

  // and this is how we'll resolve refs when the time comes
  const deRef = depthFirstMapInPlace((v) => {
    if (isRef(v)) return refs[v._stashRef];
    else return v;
  });

  // first pass: deserialize special types, note which ones need dereferencing
  const specialTypesToDeref: any[] = [];
  value = depthFirstMap((v, path) => {
    if (isRef(v)) return v;
    if (isDeserializable(v)) {
      const deserialized = recordIfHasRefs(deserialize(v), path);
      if (hasRefs(v.data)) specialTypesToDeref.push([v, deserialized]);
      return recordIfHasRefs(deserialized, path);
    }
    return recordIfHasRefs(v, path);
  })(value);

  // second pass: resolve refs
  deRef(value);
  specialTypesToDeref.forEach(([v, deserialized]) => {
    dereference(v._stashType, deserialized, deRef);
  });

  return value;
}

function hasRefs(value: unknown) {
  let result = false;
  depthFirstForEach((v) => {
    if (isRef(v)) result = true;
  })(value);
  return result;
}
