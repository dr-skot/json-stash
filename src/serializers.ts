import { Class, getOwnKeys, hasSymbolKeys, isPlainObject } from "./utils";
import { defaultTest } from "./serialize";

// TODO properly type this; remove all "any"s

export interface Serializer<Type, Data> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  // but can also be a primitive type (e.g. `symbol`, `bigint`)
  type?: Class<Type>;

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

function keyAndTest(type: Class<any>) {
  return {
    key: type.name,
    test: (obj: any) => obj instanceof type,
  };
}

export const DEFAULT_SERIALIZERS = [
  {
    ...keyAndTest(Date),
    save: (value: Date) => value.toISOString(),
    load: (iso) => new Date(iso),
  },

  {
    ...keyAndTest(RegExp),
    save: (value: RegExp) => [value.source, value.flags],
    load: ([source, flags]) => new RegExp(source, flags),
  },

  {
    key: "symbol",
    test: (x: any) => typeof x === "symbol",
    save: (x: symbol) => [x.description, Symbol.keyFor(x)],
    load: ([description, key]) => {
      return key ? Symbol.for(key) : Symbol(description);
    },
  },

  {
    key: "bigint",
    test: (x: any) => typeof x === "bigint",
    save: (x: bigint) => x.toString(),
    load: (str) => BigInt(str),
  },

  {
    ...keyAndTest(Error),
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
    key: "Object",
    test: (obj) => isPlainObject(obj) && hasSymbolKeys(obj),
    save: (obj) => getOwnKeys(obj).map((key) => [key, obj[key]]),
    // strangely: Object.entries ignores symbol keys, but Object.fromEntries doesn't
    load: (data, obj = {}) => Object.assign(obj, Object.fromEntries(data)),
  },

  {
    ...keyAndTest(Map),
    save: (map) => [...map],
    load: (data, map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  },

  {
    ...keyAndTest(Set),
    save: (set) => Array.from(set),
    load: (data, set = new Set()) => {
      set.clear();
      for (const item of data) set.add(item);
      return set;
    },
  } as Serializer<Set<unknown>, unknown[]>,

  {
    ...keyAndTest(URL),
    save: (url) => url.toString(),
    load: (str) => new URL(str),
  },

  {
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
    ...keyAndTest(ArrayBuffer),
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
    ...keyAndTest(type),
    save: (array: any) => Array.from(array),
    load: (data: any[]) => new type(data),
  })),
] as Serializer<any, any>[];

export function getKey(serializer: Serializer<any, any>) {
  // TODO serializer must have either a key or or a type with a name
  return serializer.key || serializer.type?.name;
}

// TODO if save is not defined, no load or update will be ignored
//    typescript could enforce this but it's not worth the complexity
export interface ClassSerializerOpts<Type, Data = any> {
  key?: string;
  save?: string | ((obj: Type) => Data);
  load?: string | ((data: Data) => Type);
  update?: string | ((obj: Type, data: Data) => void);
}

const isFunction = (x: unknown): x is Function => typeof x === "function";

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
    test: (obj: any) => obj instanceof type,
    save: (obj: Instance): Data => {
      if (!save) return { ...obj } as unknown as Data;
      if (isFunction(save)) return save(obj);
      if (isFunction(obj[save])) return obj[save](obj);
      throw new Error(`save method "${save}" not found on ${type.name}`);
    },
    load: (data: Data): Instance => {
      if (!save) return Object.assign(new type(), data);
      if (!load) {
        if (Array.isArray(data)) return new type(...(data as unknown[]));
        throw new Error(`no load method specified and data is not an array`);
      }
      if (isFunction(load)) return load(data);
      if (isFunction((type as any)[load])) return (type as any)[load](data);
      throw new Error(`load method "${load}" not found on ${type.name}`);
    },
    update(obj: Instance, data: Data) {
      if (!save) Object.assign(obj, data);
      else if (!update) throw noUpdateMethodError(key);
      else if (isFunction(update)) update(obj, data);
      else if (isFunction(obj[update])) obj[update](data);
      else
        throw new Error(`update method "${update}" not found on ${type.name}`);
    },
  };
}

function resetObject(obj: any, data: any) {
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

type SerializerSpec = Serializer<any, any>;

export interface NormalizedSerializer<Type = unknown, Data = unknown> {
  key: string;
  test: (value: unknown) => boolean;
  save: (value: Type) => Data;
  load: (data: Data) => Type;
  update: (value: Type, data: Data) => void;
}

export function normalizeSerializer(serializer: SerializerSpec) {
  // TODO do not accept no key
  const key = serializer.key || getKey(serializer) || "";
  return {
    key,
    test: serializer.test || defaultTest(serializer),
    ...serializer,
    update:
      serializer.update ||
      ((value, data) => {
        const result = serializer.load(data, value);
        if (result !== value) throw noUpdateMethodError(key);
      }),
  };
}
