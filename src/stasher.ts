import { stash, unstash } from "./stash";
import {
  DEFAULT_SERIALIZERS,
  getKey,
  type Serializer,
  classSerializer,
} from "./serializers";
import { Class } from "./utils";

// a stasher can `stash` and `unstash` objects, using the default serializers
// plus any additional serializers added to with `addSerializers`
export function getStasher() {
  let addedSerializers: Serializer<any, any>[] = [];

  const methods = {
    stash: (data: unknown, serializers: Serializer<any, any>[] = []) => {
      const allSerializers = [
        ...serializers,
        ...addedSerializers,
        ...DEFAULT_SERIALIZERS,
      ];
      return stash(data, allSerializers);
    },

    unstash: (json: string, serializers: Serializer<any, any>[] = []) => {
      const allSerializers = [
        ...serializers,
        ...addedSerializers,
        ...DEFAULT_SERIALIZERS,
      ];
      return unstash(json, allSerializers);
    },

    addSerializers(...serializers: Serializer<any, any>[]) {
      addedSerializers.splice(0, 0, ...serializers);
    },

    // classes can be passed in as a class or a tuple of [class, key]
    addClasses(...classes: (Class | [Class, string])[]) {
      methods.addSerializers(
        ...classes.map((c) =>
          Array.isArray(c) ? classSerializer(...c) : classSerializer(c),
        ),
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
