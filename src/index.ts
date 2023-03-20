import { deepForEach, deepMap, hasOwnProperty } from "./utils";
import { getRefSaver, isRef, Ref } from "./ref";
import {
  dereference,
  deserialize,
  isDeserializable,
  serialize,
} from "./serialize";

type StashBox = {
  _stashRoot: any;
};

export function toJSON(raw: unknown) {
  const stash = encode({ _stashRoot: raw });
  return JSON.stringify((stash as StashBox)._stashRoot);
}

export function fromJSON(json: string) {
  const result = { _stashRoot: JSON.parse(json) };
  // resolve all refs and deserialize special types
  const resolved = resolve(result);
  return (resolved as StashBox)._stashRoot;
}

//
// internals
//

function encode(raw: StashBox) {
  const refSaver = getRefSaver();
  function encodeValue(rawValue: unknown, path: string) {
    const value = refSaver(path, rawValue);
    return isRef(value) ? value : serialize(value);
  }
  const opts = { depthFirst: false, inPlace: false };
  return deepMap(encodeValue, opts)(raw);
}

function resolve(value: unknown) {
  if (value === null || typeof value !== "object") return value;

  // TODO move some of this ref logic to ref.ts

  // we'll put the reffed objects in this table
  const refs: Record<string, unknown> = {};

  // collect all the ref paths in the object
  deepForEach((v) => {
    const path = (v as Ref)?._stashRef;
    if (path) refs[path] = v;
  })(value);

  // store the value at the given path, if it has a ref
  function recordIfHasRefs(value: unknown, path: string) {
    if (hasOwnProperty(refs, path)) refs[path] = value;
    return value;
  }

  // and this is how we'll resolve refs when the time comes
  const deRef = deepMap(
    (v) => {
      if (isRef(v)) return refs[v._stashRef];
      else return v;
    },
    { depthFirst: true, inPlace: true }
  );

  // first pass: deserialize special types, note which ones need dereferencing
  const needsDeref: any[] = [];
  value = deepMap(
    (v, path) => {
      if (isRef(v)) return v;
      if (isDeserializable(v)) {
        const deserialized = recordIfHasRefs(deserialize(v), path);
        if (hasRefs(v.data)) needsDeref.push([v, deserialized]);
        return recordIfHasRefs(deserialized, path);
      }
      return recordIfHasRefs(v, path);
    },
    { depthFirst: true, inPlace: false }
  )(value);

  // second pass: resolve refs
  deRef(value);
  needsDeref.forEach(([spec, deserialized]) => {
    dereference(spec._stashType, deserialized, deRef);
  });

  return value;
}

function hasRefs(value: unknown) {
  let result = false;
  deepForEach((v) => {
    if (isRef(v)) result = true;
  })(value);
  return result;
}
