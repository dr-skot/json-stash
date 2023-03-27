export interface Serializer<Type, Data> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  type: any; // new (...args: any[]) => Type;

  // returns the data needed to reconstruct the object
  save: (value: Type) => Data;

  // reconstructs the object from the data returned by `save`; default is `(data) => new type(...data)`
  // if `existing` is defined, repopulate it with `data`; otherwise return a new object
  // you only need to support the `existing` parameter if `Data` (return value of `save`) can contain objects
  load?: (data: Data, existing?: Type) => Type;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // unique identifier for this type; default is `type.name`
  key?: string;
}

export const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    save: (value: Date) => [value.toISOString()],
  } as Serializer<Date, [string]>,

  {
    type: RegExp,
    save: (value: RegExp) => [value.source, value.flags],
  } as Serializer<RegExp, [string, string]>,

  {
    type: typeof Symbol(),
    key: "symbol",
    test: (x: any) => typeof x === "symbol",
    save: (x: symbol) => [x.description, Symbol.keyFor(x)],
    load: ([description, key]) => {
      return key ? Symbol.for(key) : Symbol(description);
    },
  } as Serializer<symbol, [string | undefined, string | undefined]>,

  {
    type: typeof BigInt(0),
    key: "bigint",
    test: (x: any) => typeof x === "bigint",
    save: (x: bigint) => x.toString(),
    load: (str) => BigInt(str),
  } as Serializer<bigint, string>,

  {
    type: Error,
    save: (error) => [error.name, error.message, error.stack],
    load: ([name, message, stack]) => {
      const error = new Error(message);
      error.name = name;
      error.stack = stack;
      return error;
    },
  } as Serializer<Error, [string, string, string]>,

  {
    type: Map,
    save: (map) => [...map],
    load: (data, map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  } as Serializer<Map<unknown, unknown>, [unknown, unknown][]>,

  {
    type: Set,
    save: (set) => [...set],
    load: (data, set = new Set()) => {
      set.clear();
      for (const item of data) set.add(item);
      return set;
    },
  } as Serializer<Set<unknown>, unknown[]>,
  {
    type: URL,
    save: (url) => [url.toString()],
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
  ].map((type) => ({
    type,
    save: (array: any) => [[...array]],
  })),
] as Serializer<any, any>[];

export function getKey(serializer: Serializer<any, any>) {
  return serializer.key || serializer.type.name;
}

export function defaultSerializer(type: any) {
  return {
    type,
    save: (obj: Object) => ({ ...obj }),
    load: (data: any, obj = new type()) => {
      for (const k in obj) delete (obj as any)[k];
      for (const k in data) (obj as any)[k] = data[k];
      return obj;
    },
  };
}
