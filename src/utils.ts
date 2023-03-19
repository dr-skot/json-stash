// equivalent to lodash's _.get
export function get(obj: any, path: string): any {
  if (!path) return obj; // If the path is empty, return the object
  const keys = path.split("."); // Split the path by dot
  let result: any = obj;
  for (const key of keys) {
    if (Object(result) !== result) return undefined; // If the result is not a valid object, return undefined
    result = result[key]; // Get the value of the current key
  }
  return result;
} // equivalent to lodash's _.set
export function set<T extends object>(
  obj: T,
  pathString: string,
  value: any
): T {
  if (Object(obj) !== obj) return obj; // If the object is not a valid object, return it
  const path = pathString.split("."); // Convert the path to an array if it's not already one
  path.reduce((acc: any, key: string | number, index: number) => {
    if (Object(acc[key]) !== acc[key]) acc[key] = {}; // If the key doesn't exist, create a new object
    if (index === path.length - 1) acc[key] = value; // If it's the last key, set the value
    return acc[key]; // Return the nested object
  }, obj);
  return obj;
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export const isPlainObject = (value: unknown) => value?.constructor === Object;

export function recursivelyApply(fn: (v: unknown) => any) {
  return (value: any) => {
    if (Array.isArray(value)) {
      return (value as unknown[]).map(fn);
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value as object).map(([k, v]) => [k, fn(v)])
      );
    }
    return value;
  };
}

export function getPath(context: object, rawPath: string) {
  const path = rawPath.replace(/^\$\.?/, "");
  return path ? get(context, path) : context;
}

export function setPath(context: object, rawPath: string, value: unknown) {
  const path = rawPath.replace(/^\$\.?/, "");
  if (!path) throw new Error("Cannot set root path");
  return set(context, path, value);
}
