import { Class } from "./types/Class";
import { isFunction } from "./utils";
import { Serializer } from "./types/Serializer";
import { MethodNotFoundError } from "./errors/MethodNotFoundError";

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
): Serializer<Instance, Data> {
  const opts = typeof keyOrOpts === "string" ? { key: keyOrOpts } : keyOrOpts;
  const {
    key = type.name,
    save = (obj: Instance) => ({ ...obj }) as unknown as Data,
    load = !opts.save
      ? (data: Data) => Object.assign(new type(), data)
      : (data: Data) => {
          if (Array.isArray(data)) return new type(...(data as unknown[]));
          throw new Error(`no load method specified and data is not an array`);
        },
    update = !opts.save
      ? (obj: Instance, data: Data) => Object.assign(obj, data)
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
            throw new MethodNotFoundError(type.name, save, "save");
          }
        : save,
    load:
      typeof load === "string"
        ? (data: Data): Instance => {
            if (isFunction(statics[load])) return statics[load](data);
            throw new MethodNotFoundError(type.name, load, "load");
          }
        : load,
    update:
      typeof update === "string"
        ? (obj: Instance, data: Data) => {
            if (isFunction(obj[update])) obj[update](data);
            else throw new MethodNotFoundError(type.name, update, "update");
          }
        : update,
  };
}
