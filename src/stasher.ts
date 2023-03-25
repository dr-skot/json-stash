import { stash, unstash } from "./stash";
import { getKey, type Serializer } from "./serializers";

export function getStasher() {
  let addedSerializers: Serializer<any, any>[] = [];

  return {
    stash: (data: unknown, serializers: Serializer<any, any>[] = []) =>
      stash(data, [...serializers, ...addedSerializers]),

    unstash: (json: string, serializers: Serializer<any, any>[] = []) =>
      unstash(json, [...serializers, ...addedSerializers]),

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
}

function removeFirst<T>(xs: T[], test: (x: T) => boolean) {
  const index = xs.findIndex(test);
  if (index !== -1) xs.splice(index, 1);
}

function clear<T>(xs: T[]) {
  xs.splice(0, xs.length);
}
