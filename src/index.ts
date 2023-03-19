//
// exports
//

import { isObject, isPlainObject, setPath } from "./utils";
import { customDeserialize, customSerialize, isSpecial } from "./serializers";
import { getRefSaver, isRef, Ref, RefSaver, resolveRef } from "./ref";

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
  if (isRef(rawValue)) {
    const referent = resolveRef(context, rawValue);
    setPath(context, path, referent);
    return;
  }
  if (isSpecial(rawValue)) {
    const special = customDeserialize(rawValue);
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
