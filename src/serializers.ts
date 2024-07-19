import { Class, getOwnKeys, hasSymbolKeys, isPlainObject } from "./utils";

// TODO properly type this; remove all "any"s

export interface Serializer<Type, Data> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  // but can also be a primitive type (e.g. `symbol`, `bigint`)
  type: any;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // returns the data needed to reconstruct the object
  save: (value: Type) => Data;

  // unique identifier for this type; default is `type.name`
  key?: string;

  // reconstructs the object from the data returned by `save`
  // if `existing` is defined, repopulate in-place it with `data`; otherwise return a new object
  // you only need to support the `existing` parameter if `Data` (return value of `save`) can contain objects
  load: (data: Data, existing?: Type) => Type;

  // updates the object with new data
  // if this exists, it is used instead of the two-parameter call to `load`
  update?: (object: Type, data: Data) => void;
}

export const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    save: (value: Date) => value.toISOString(),
    load: (iso) => new Date(iso),
  },

  {
    type: RegExp,
    save: (value: RegExp) => [value.source, value.flags],
    load: ([source, flags]) => new RegExp(source, flags),
  },

  {
    type: typeof Symbol(),
    key: "symbol",
    test: (x: any) => typeof x === "symbol",
    save: (x: symbol) => [x.description, Symbol.keyFor(x)],
    load: ([description, key]) => {
      return key ? Symbol.for(key) : Symbol(description);
    },
  },

  {
    type: typeof BigInt(0),
    key: "bigint",
    test: (x: any) => typeof x === "bigint",
    save: (x: bigint) => x.toString(),
    load: (str) => BigInt(str),
  },

  {
    type: Error,
    save: (error) => [error.name, error.message, error.stack],
    load: ([name, message, stack]) => {
      const error = new Error(message);
      error.name = name;
      error.stack = stack;
      return error;
    },
  },

  {
    // plain object with symbol keys
    type: Object,
    test: (obj) => isPlainObject(obj) && hasSymbolKeys(obj),
    save: (obj) => getOwnKeys(obj).map((key) => [key, obj[key]]),
    // strangely: Object.entries ignores symbol keys, but Object.fromEntries doesn't
    load: (data, obj = {}) => setObj(obj, Object.fromEntries(data)),
  },

  {
    type: Map,
    save: (map) => [...map],
    load: (data, map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  },

  {
    type: Set,
    save: (set) => Array.from(set),
    load: (data, set = new Set()) => {
      set.clear();
      for (const item of data) set.add(item);
      return set;
    },
  } as Serializer<Set<unknown>, unknown[]>,

  {
    type: URL,
    save: (url) => url.toString(),
    load: (str) => new URL(str),
  },

  {
    type: typeof Infinity,
    key: "number",
    test: (x: any) => [Infinity, -Infinity, NaN].includes(x),
    save: (x: number) =>
      ({
        [Infinity]: "Infinity",
        [-Infinity]: "-Infinity",
        [NaN]: "NaN",
      })[x],
    load: (x: string) =>
      ({
        Infinity: Infinity,
        "-Infinity": -Infinity,
        NaN: NaN,
      })[x],
  },

  {
    type: ArrayBuffer,
    save: (buffer) => Array.from(new Uint8Array(buffer)),
    load: (data) => new Uint8Array(data).buffer,
  },

  ...[
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
  ].map((type) => ({
    type,
    save: (array: any) => Array.from(array),
    load: (data: any[]) => new type(data),
  })),
] as Serializer<any, any>[];

export function getKey(serializer: Serializer<any, any>) {
  return serializer.key || serializer.type.name;
}

// TODO if save is not defined, no load or update will be ignored
//    typescript could enforce this but it's not worth the complexity
export interface ClassSerializerOpts<Type, Data = any> {
  key?: string;
  save?: string | ((obj: Type) => Data);
  load?: string | ((data: Data) => Type);
  update?: string | ((obj: Type, data: Data) => void);
}

export function classSerializer<
  Instance extends Record<string, any>,
  Data = unknown,
>(
  type: Class<Instance>,
  keyOrOpts: string | ClassSerializerOpts<Instance, Data> = {},
) {
  const opts = typeof keyOrOpts === "string" ? { key: keyOrOpts } : keyOrOpts;
  const { key = type.name, save, load, update } = opts;

  return {
    key,
    type,
    save: (obj: Instance): Data => {
      if (!save) return { ...obj } as unknown as Data;
      if (typeof save === "function") return save(obj);
      // TODO make sure obj[opts.save] is a function
      return obj[save]?.();
    },
    load: (data: Data, obj?: Instance): Instance => {
      if (!obj) {
        if (!save) return setObj(new type(), data);
        // TODO make sure data is an array
        if (!load) return new type(...(data as unknown[]));
        if (typeof load === "function") return load(data);
        // TODO make sure obj[load] is a function
        return (type as any)[load](data);
      }
      if (!save) return setObj(obj, data);
      if (!update) throw noUpdateMethodError(key);
      if (typeof update === "function") update(obj, data);
      // TODO make sure obj[opts.update] is a function
      else obj[update](data);
      return obj;
    },
  };
}

function setObj(obj: any, data: any) {
  getOwnKeys(obj).forEach((key) => delete obj[key]);
  Object.assign(obj, data);
  return obj;
}

// TODO more helpful error message
// TODO should this be a subclass of Error?
function noUpdateMethodError(key: string) {
  return new Error(
    `json-stash: Second pass required while unstashing but no update method found for ${key}`,
  );
}
