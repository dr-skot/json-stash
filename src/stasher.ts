import { stash, unstash } from "./stash";
import {
  DEFAULT_SERIALIZERS,
  defaultSerializer,
  getKey,
  type Serializer,
} from "./serializers";
import { Type } from "./utils";

export function getStasher() {
  let addedSerializers: Serializer<any, any>[] = [];

  function allSerializers(nonce: Serializer<any, any>[] = []) {
    return [...nonce, ...addedSerializers, ...DEFAULT_SERIALIZERS];
  }

  const methods = {
    stash: (data: unknown, serializers: Serializer<any, any>[] = []) =>
      stash(data, allSerializers(serializers), methods.addSerializers),

    unstash: (json: string, serializers: Serializer<any, any>[] = []) =>
      unstash(json, [
        ...serializers,
        ...addedSerializers,
        ...DEFAULT_SERIALIZERS,
      ]),

    addSerializers(...serializers: Serializer<any, any>[]) {
      addedSerializers.splice(0, 0, ...serializers);
    },

    // classes can be passed in as a class or a tuple of [class, key]
    addClasses(...classes: (Type<unknown> | [Type<unknown>, string])[]) {
      methods.addSerializers(
        ...classes.map((c) =>
          Array.isArray(c) ? defaultSerializer(...c) : defaultSerializer(c)
        )
      );
    },

    removeSerializers(...keys: string[]) {
      keys.forEach((key) => {
        const index = addedSerializers.findIndex((s) => getKey(s) === key);
        if (index !== -1) addedSerializers.splice(index, 1);
      });
    },

    clearSerializers() {
      addedSerializers.splice(0, addedSerializers.length);
    },
  };

  return methods;
}
