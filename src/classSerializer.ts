import { Class } from "./types/Class";
import { assign, isArray, isFunction } from "./utils";
import { Serializer } from "./types/Serializer";

export interface ClassSerializerOpts<Type, Data = any> {
  // $type key for the serialized object: `{ $type: key, data: ... }`
  // defaults to the class name
  key?: string;

  // returns the data for the serialized object: `{ $type: key, data: save(obj) }`
  // if a string, `obj[save]()` will be used
  // default is `{ ...obj }`
  save?: string | ((obj: Type) => Data);

  // recreates the object from the data returned by save: `obj = load(data)`
  // if a string, `Type[load](data)` will be used
  // default if `save` is defined: `new Type(...data)`
  //    (ie, `save` is assumed to return constructor args; if `data` is not an array, an error is thrown)
  //    TODO: instead of throwing an error, assume single arg: `new Type(data)`
  // default otherwise: `Object.assign(new Type(), data)`
  load?: string | ((data: Data) => Type);

  // modifies an existing object to match data returned by save: `update(obj, data)`
  // if a string, `obj[update](data)` will be used
  // default if `save` is undefined: `Object.assign(obj, data)`
  // otherwise an error is thrown (only if `update` is necessary to resolve circular/duplicate references)
  update?: string | ((obj: Type, data: Data) => void);
}

// for backwards compatibility, support the old signature with a string key as the second argument
export function classSerializer<
  Instance extends Record<string, any>,
  Data = unknown,
>(
  type: Class<Instance>,
  keyOrOpts: string | ClassSerializerOpts<Instance, Data> = {},
): Serializer<Instance, Data> {
  const opts = typeof keyOrOpts === "string" ? { key: keyOrOpts } : keyOrOpts;
  const {
    key = type.name,
    save = (obj: Instance) => ({ ...obj }) as unknown as Data,
    load = !opts.save
      ? (data: Data) => assign(new type(), data)
      : (data: Data) => {
          if (isArray(data)) return new type(...(data as unknown[]));
          throw new Error(`no load method specified and data is not an array`);
        },
    update = !opts.save
      ? (obj: Instance, data: Data) => assign(obj, data)
      : undefined,
  } = opts;

  // makes the static methods available without ts headaches
  const statics = type as any;

  return {
    key,
    test: (obj: any) => obj instanceof type,
    save:
      typeof save === "string"
        ? (obj: Instance): Data => {
            if (isFunction(obj[save])) return obj[save](obj);
            throw methodNotFound(type.name, save, "save");
          }
        : save,
    load:
      typeof load === "string"
        ? (data: Data): Instance => {
            if (isFunction(statics[load])) return statics[load](data);
            throw methodNotFound(type.name, load, "load");
          }
        : load,
    update:
      typeof update === "string"
        ? (obj: Instance, data: Data) => {
            if (isFunction(obj[update])) obj[update](data);
            else throw methodNotFound(type.name, update, "update");
          }
        : update,
  };
}

const methodNotFound = (type: string, method: string, category: string) =>
  new Error(`json-stash: ${category} method "${method}" not found on ${type}`);
