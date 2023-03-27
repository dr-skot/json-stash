import { stash, unstash } from "./stash";
import { DEFAULT_SERIALIZERS, getKey, type Serializer } from "./serializers";
import { addSerializers } from "./index";

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

    removeSerializers(...keys: string[]) {
      keys.forEach((key) => {
        removeFirst(addedSerializers, (s) => getKey(s) === key);
      });
    },

    clearSerializers() {
      clear(addedSerializers);
    },
  };

  return methods;
}

function removeFirst<T>(xs: T[], test: (x: T) => boolean) {
  const index = xs.findIndex(test);
  if (index !== -1) xs.splice(index, 1);
}

function clear<T>(xs: T[]) {
  xs.splice(0, xs.length);
}
