// equivalent to lodash _.get
export function get(obj: any, path: string): any {
  if (!path) return obj; // If the path is empty, return the object
  const keys = path.split("."); // Split the path by dot
  let result: any = obj;
  for (const key of keys) {
    if (Object(result) !== result) return undefined; // If the result is not a valid object, return undefined
    result = result[key]; // Get the value of the current key
  }
  return result;
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isPlainObject(value: unknown): value is object {
  return value?.constructor === Object;
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

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
    return fn(value);
  };
}

export function deepForEach(fn: (v: unknown) => void) {
  function recurse(value: unknown): void {
    fn(value);
    if (isArray(value)) return value.forEach(recurse);
    if (isPlainObject(value)) return eachValue(value, recurse);
  }

  return recurse;
}

export function depthFirstForEach(fn: (v: unknown, path: string) => void) {
  function recurse(value: unknown, path: string): void {
    if (isArray(value)) value.forEach((v, i) => recurse(v, `${path}.${i}`));
    else if (isPlainObject(value))
      eachValue(value, (v, k) => recurse(v, `${path}.${k}`));
    fn(value, path);
  }

  return (value: unknown) => recurse(value, "$");
}

export function depthFirstMap(fn: (v: unknown, path: string) => unknown) {
  function recurse(value: unknown, path: string): unknown {
    if (isArray(value)) value = value.map((v, i) => recurse(v, `${path}.${i}`));
    if (isPlainObject(value))
      value = mapValues(value, (v, k) => recurse(v, `${path}.${k}`));
    value = fn(value, path);
    return value;
  }

  return (value: unknown) => recurse(value, "$");
}

export function depthFirstMapInPlace(
  fn: (v: unknown, path: string) => unknown
) {
  function recurse(value: unknown, path: string): unknown {
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i] = recurse(value[i], `${path}.${i}`);
      }
    }
    if (isPlainObject(value)) {
      for (const k in value) {
        // @ts-ignore: man, ts, sometimes I can't figure you out bro
        //   `v[k]` is not allowed inside `for (const k in v)`??
        value[k] = recurse(value[k], `${path}.${k}`);
      }
    }
    value = fn(value, path);
    return value;
  }

  return (value: unknown) => recurse(value, "$");
}

export function getPath(context: object, rawPath: string) {
  const path = rawPath.replace(/^\$\.?/, "");
  return path ? get(context, path) : context;
}

export function mapValues(obj: object, fn: (v: unknown, k: string) => unknown) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));
}

export function eachValue(obj: object, fn: (v: unknown, k: string) => void) {
  Object.entries(obj).forEach(([k, v]) => fn(v, k));
}

export function hasOwnProperty(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
