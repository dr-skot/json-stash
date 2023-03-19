//
// exports
//

import { getPath, isObject, isPlainObject, setPath } from "./utils";
import {
  customDeserialize,
  customSerialize,
  isSpecial,
  SpecialSerialized,
} from "./serializers";

export function toJSON(raw: unknown) {
  return JSON.stringify(customSerialize(circularToRefs(raw)));
}

export function fromJSON(json: string) {
  const result = JSON.parse(json);
  // these changes have to be made in-place to preserve duplicate references
  refsToCircular(result);
  return result;
}

//
// internals
//

// a ref is a placeholder for a value that has already been seen
// the _refId is a path to the value in some reference object
type Ref = {
  _refId: string;
};

// a function that tracks values and returns a ref when a value is repeated
// (if the value is an object or an array)
// otherwise returns the value
type RefSaver = (path: string, value: unknown) => unknown;

function getRefSaver(): RefSaver {
  const seen: Record<string, object> = {};
  function refSaver(path: string, value: unknown) {
    if (value === null || typeof value !== "object") return value;
    const found = Object.entries(seen).find(([, v]) => v === value);
    if (found) return { _refId: found[0] };
    seen[path] = value;
    return value;
  }
  return refSaver;
}

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

function refsToCircular(value: unknown) {
  if (!isObject(value)) return;
  valueToCircular(value, "$", value as object);
}

function valueToCircular(
  rawValue: unknown,
  path: string,
  context: object
): unknown {
  if (rawValue === null || typeof rawValue !== "object") return;
  const { _refId } = rawValue as Ref;
  if (_refId) {
    const referent = getPath(context, _refId);
    setPath(context, path, referent);
    return;
  }
  if (isSpecial(rawValue)) {
    const special = customDeserialize(rawValue as SpecialSerialized);
    setPath(context, path, special);
    return;
  }
  if (Array.isArray(rawValue)) {
    (rawValue as unknown[]).forEach((v, i) =>
      valueToCircular(v, `${path}.${i}`, context)
    );
    return;
  }
  if (isPlainObject(rawValue)) {
    Object.entries(rawValue).forEach(([k, v]) =>
      valueToCircular(v, `${path}.${k}`, context)
    );
    return;
  }
}
