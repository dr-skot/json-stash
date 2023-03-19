//
// exports
//

export function toJSON(raw: unknown) {
  return JSON.stringify(customSerialize(circularToRefs(raw)));
}

export function fromJSON(json: string) {
  const result = JSON.parse(json);
  // these changes have to be made in place to preserve duplicate references
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
  return (path, value) => {
    if (value === null || typeof value !== "object") return value;
    const found = Object.entries(seen).find(([, v]) => v === value);
    if (found) return { _refId: found[0] };
    seen[path] = value;
    return value;
  };
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
  if (isObject(value))
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
  if (isObject(rawValue)) {
    Object.entries(rawValue).forEach(([k, v]) =>
      valueToCircular(v, `${path}.${k}`, context)
    );
    return;
  }
}

function getPath(context: object, rawPath: string) {
  const path = rawPath.replace(/^\$\.?/, "");
  return path ? get(context, path) : context;
}

function setPath(context: object, rawPath: string, value: unknown) {
  const path = rawPath.replace(/^\$\.?/, "");
  if (!path) throw new Error("Cannot set root path");
  return set(context, path, value);
}

function customSerialize(value: unknown) {
  return recursivelyApply(customSerializeValue)(value);
}

function recursivelyApply(fn: (v: unknown) => any) {
  return (value: any) => {
    if (Array.isArray(value)) {
      return (value as unknown[]).map(fn);
    }
    if (isObject(value)) {
      return Object.fromEntries(
        Object.entries(value as object).map(([k, v]) => [k, fn(v)])
      );
    }
    return value;
  };
}

type SpecialSerialized = {
  _stashType: string;
  data: unknown;
};

function isSpecial(value: unknown) {
  const { _stashType } = value as SpecialSerialized;
  return !!_stashType;
}

function customDeserialize(value: SpecialSerialized) {
  const { _stashType, data } = value;
  switch (_stashType) {
    case "Date":
      return new Date(data as number);
    default:
      throw new Error(`Unknown special type ${_stashType}`);
  }
}

function customSerializeValue(value: unknown) {
  console.log("customSerializeValue", value);
  if (value instanceof Date) {
    console.log("is date");
    return {
      _stashType: "Date",
      data: value.getTime(),
    };
  }
  return value;
}

// equivalent to lodash's _.get
function get(obj: any, path: string): any {
  if (!path) return obj; // If the path is empty, return the object
  const keys = path.split("."); // Split the path by dot
  let result: any = obj;
  for (const key of keys) {
    if (Object(result) !== result) return undefined; // If the result is not a valid object, return undefined
    result = result[key]; // Get the value of the current key
  }
  return result;
}

// equivalent to lodash's _.set
function set<T extends object>(obj: T, pathString: string, value: any): T {
  if (Object(obj) !== obj) return obj; // If the object is not a valid object, return it
  const path = pathString.split("."); // Convert the path to an array if it's not already one
  path.reduce((acc: any, key: string | number, index: number) => {
    if (Object(acc[key]) !== acc[key]) acc[key] = {}; // If the key doesn't exist, create a new object
    if (index === path.length - 1) acc[key] = value; // If it's the last key, set the value
    return acc[key]; // Return the nested object
  }, obj);
  return obj;
}

function isObject(value: any): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
