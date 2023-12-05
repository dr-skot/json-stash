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

    addClasses(...classes: any[]) {
      methods.addSerializers(...classes.map(defaultSerializer));
    },

    removeSerializers(...keys: string[]) {
      keys.forEach((key) => {
        removeFirst(addedSerializers, (s) => getKey(s) === key);
      });
    },

    clearSerializers() {
      addedSerializers.splice(0, addedSerializers.length);
    },
  };

  return methods;
}

function removeFirst<T>(xs: T[], test: (x: T) => boolean) {
  const index = xs.findIndex(test);
  if (index !== -1) xs.splice(index, 1);
}
