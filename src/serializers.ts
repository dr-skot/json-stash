import { getOwnKeys, hasSymbolKeys, isPlainObject } from "./utils";
import { classSerializer } from "./classSerializer";
import { Serializer } from "./types/Serializer";

export const DEFAULT_SERIALIZERS: Serializer[] = [
  classSerializer(Date, {
    save: (date) => date.toISOString(),
    load: (iso) => new Date(iso),
  }) as Serializer<Date, string>,

  classSerializer(RegExp, {
    save: (value: RegExp) => [value.source, value.flags],
    load: ([source, flags]) => new RegExp(source, flags),
  }) as Serializer<RegExp, [string, string]>,

  {
    key: "symbol",
    test: (x: any) => typeof x === "symbol",
    save: (x: symbol) => [x.description, Symbol.keyFor(x)],
    load: ([description, key]) => {
      return key ? Symbol.for(key) : Symbol(description);
    },
  } as Serializer<symbol, [string?, string?]>,

  {
    key: "bigint",
    test: (x: any) => typeof x === "bigint",
    save: (x: bigint) => x.toString(),
    load: (str) => BigInt(str),
  } as Serializer<bigint, string>,

  // TODO support subclasses of Error
  classSerializer(Error, {
    save: ({ name, message, stack }) => [name, message, stack],
    load: ([name, message, stack]) => {
      const error = new Error(message);
      error.name = name;
      error.stack = stack;
      return error;
    },
  }) as Serializer<Error, [string, string, string | undefined]>,

  // plain object with symbol keys
  {
    key: "Object",
    test: (obj) => isPlainObject(obj) && hasSymbolKeys(obj),
    save: (obj) => getOwnKeys(obj).map((key) => [key, obj[key]]),
    // strangely: Object.entries ignores symbol keys, but Object.fromEntries doesn't
    load: (data) => Object.assign({}, Object.fromEntries(data)),
    update: (obj, data) => Object.assign(obj, Object.fromEntries(data)),
  } as Serializer<Record<PropertyKey, unknown>, [PropertyKey, unknown][]>,

  classSerializer(Map, {
    save: (map) => [...map],
    load: (data) => new Map(data),
    update: (map, data) => {
      for (const [k, v] of data) map.set(k, v);
    },
  }) as Serializer<Map<unknown, unknown>, [unknown, unknown][]>,

  classSerializer(Set, {
    save: (set) => Array.from(set),
    load: (data) => new Set(data),
    update: (set, data) => {
      for (const item of data) set.add(item);
    },
  }) as Serializer<Set<unknown>, unknown[]>,

  classSerializer(URL, {
    save: (url) => url.toString(),
    load: (str) => new URL(str),
  }) as Serializer<URL, string>,

  {
    key: "number",
    test: (x) => [Infinity, -Infinity, NaN].includes(x as number),
    save: (x) =>
      ({
        [Infinity]: "Infinity",
        [-Infinity]: "-Infinity",
        [NaN]: "NaN",
      })[x],
    load: (x) =>
      ({
        Infinity: Infinity,
        "-Infinity": -Infinity,
        NaN: NaN,
      })[x],
  } as Serializer<number, string>,

  classSerializer(ArrayBuffer, {
    save: (buffer) => Array.from(new Uint8Array(buffer)),
    load: (data) => new Uint8Array(data).buffer,
  }) as Serializer<ArrayBuffer, number[]>,

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
  ].map((type) =>
    classSerializer(type, {
      // TODO can we properly type these anys?
      save: (array: any) => Array.from(array),
      load: (data: any[]) => new type(data),
    }),
  ),
];
