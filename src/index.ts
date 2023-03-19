//
// exports
//

import { isObject, isPlainObject, setPath } from "./utils";
import { getRefSaver, isRef, RefSaver, resolveRef } from "./ref";
import { deserialize, isDeserializable, serialize } from "./serialize";

export function toJSON(raw: unknown) {
  return JSON.stringify(serialize(circularToRefs(raw)));
}

export function fromJSON(json: string) {
  const result = JSON.parse(json);
  // resolve all refs and deserialize special types
  resolve(result);
  return result;
}

//
// internals
//

function circularToRefs(raw: unknown) {
  return valueToRefs(raw, "$", getRefSaver());
}

function valueToRefs(
  rawValue: unknown,
  path: string,
  refSaver: RefSaver
): unknown {
  const value = refSaver(path, rawValue);
  // if value is not raw, we have a ref, so return it
  if (value !== rawValue) return value;
  if (Array.isArray(value))
    return (value as unknown[]).map((v, i) =>
      valueToRefs(v, `${path}.${i}`, refSaver)
    );
  if (isPlainObject(value))
    return Object.fromEntries(
      Object.entries(value as object).map(([k, v]) => [
        k,
        valueToRefs(v, `${path}.${k}`, refSaver),
      ])
    );
  return value;
}

function resolve(value: unknown) {
  if (value === null || typeof value !== "object") return;
  recursivelyResolve(value, "$", value);
}

function recursivelyResolve(
  rawValue: unknown,
  path: string,
  context: object | Array<unknown>
): unknown {
  if (rawValue === null || typeof rawValue !== "object") return;
  if (isRef(rawValue)) {
    const referent = resolveRef(context, rawValue);
    setPath(context, path, referent);
    return;
  }
  if (isDeserializable(rawValue)) {
    const special = deserialize(rawValue);
    setPath(context, path, special);
    return;
  }
  if (Array.isArray(rawValue)) {
    (rawValue as unknown[]).forEach((v, i) =>
      recursivelyResolve(v, `${path}.${i}`, context)
    );
    return;
  }
  if (isPlainObject(rawValue)) {
    Object.entries(rawValue).forEach(([k, v]) =>
      recursivelyResolve(v, `${path}.${k}`, context)
    );
    return;
  }
}
