import { getOwnKeys, hasSymbolKeys, isPlainObject, Type } from "./utils";

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
  // if `existing` is defined, repopulate it with `data`; otherwise return a new object
  // you only need to support the `existing` parameter if `Data` (return value of `save`) can contain objects
  load: (data: Data, existing?: Type) => Type;
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
    load: (data, obj = {}) => {
      getOwnKeys(obj).forEach((key) => delete obj[key]);
      for (const [key, value] of data) obj[key] = value;
      return obj;
    },
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
      }[x]),
    load: (x: string) =>
      ({
        Infinity: Infinity,
        "-Infinity": -Infinity,
        NaN: NaN,
      }[x]),
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

function publicClassSerializer<T>(type: Type<T>, key: string) {
  return {
    key,
    type,
    save: (obj: T): Partial<T> => ({ ...obj }),
    load: (data: Partial<T>, obj = new type()) => {
      for (const k in obj) delete obj[k];
      for (const k in data) (obj as any)[k] = data[k];
      return obj;
    },
  };
}

export interface Stashable<Data = unknown> {
  __jsonStash_save?: () => Data;
  __jsonStash_update?: (data: Data) => void;
}
export interface StashableClass<
  Instance extends Stashable<Data>,
  Data = unknown
> extends Type<Instance> {
  __jsonStash_load?: (data: Data) => Instance;
}
export function classSerializer<
  Instance extends Stashable<Data>,
  Data = unknown
>(type: StashableClass<Instance, Data>, key = type.name) {
  return type.prototype.__jsonStash_save
    ? privateClassSerializer(type, key)
    : publicClassSerializer(type, key);
}

// privateClassSerializer
// requires __jsonStash_save
// if __jsonStash_load, use it
// else use new type(...data)
// if load is called with existing object, call __jsonStash_update
// if no __jsonStash_update, leave object unchanged and warn or throw
function privateClassSerializer<
  Instance extends Stashable<Data>,
  Data = unknown
>(type: StashableClass<Instance, Data>, key: string) {
  if (!type.prototype.__jsonStash_save) {
    throw new Error("privateClassSerializer requires __jsonStash_save method");
  }
  return {
    key,
    type,
    save: (obj: Instance) => obj.__jsonStash_save!(),
    load: (data: Data, obj?: Instance): Instance => {
      if (obj === undefined) {
        return type.__jsonStash_load?.(data) || new type(...(data as any));
      }
      if (obj.__jsonStash_update) {
        obj.__jsonStash_update(data);
        return obj;
      }
      console.warn(
        `no __jsonStash_update method found for ${type.name}; returning object unchanged`
      );
      return obj;
    },
  };
}
