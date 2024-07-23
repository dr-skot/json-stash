import { stash, unstash } from "./stash";
import { DEFAULT_SERIALIZERS } from "./serializers";
import { LegacySerializer } from "./types/LegacySerializer";
import { Class } from "./types/Class";
import { classSerializer, ClassSerializerOpts } from "./classSerializer";
import { Serializer } from "./types/Serializer";
import { getKey, normalizeSerializer } from "./normalizeSerializer";

// a stasher can `stash` and `unstash` objects, using the default serializers
// plus any additional serializers added to with `addSerializers`
export function getStasher() {
  let addedSerializers: LegacySerializer<any, any>[] = [];

  const methods = {
    stash: (data: unknown, serializers: LegacySerializer<any, any>[] = []) => {
      const allSerializers = [
        ...serializers,
        ...addedSerializers,
        ...DEFAULT_SERIALIZERS,
      ].map(normalizeSerializer) as Serializer[];
      return stash(data, allSerializers);
    },

    unstash: (json: string, serializers: LegacySerializer<any, any>[] = []) => {
      const allSerializers = [
        ...serializers,
        ...addedSerializers,
        ...DEFAULT_SERIALIZERS,
      ].map(normalizeSerializer) as Serializer[];
      return unstash(json, allSerializers);
    },

    addSerializers(...serializers: LegacySerializer<any, any>[]) {
      addedSerializers.splice(0, 0, ...serializers);
    },

    addSerializer(serializer: LegacySerializer<any, any>) {
      addedSerializers.unshift(serializer);
    },

    addClass<T extends Instance>(
      type: Class<T>,
      keyOrOpts?: string | ClassSerializerOpts<T>,
    ) {
      methods.addSerializers(classSerializer(type, keyOrOpts));
    },

    // classes can be passed in as a class or a tuple of [class, keyOrOpts]
    addClasses(...classes: AddClassParams[]) {
      methods.addSerializers(
        ...classes.map((c) =>
          Array.isArray(c) ? classSerializer(c[0], c[1]) : classSerializer(c),
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

type Instance = Record<string, any>;
type AddClassParams<T extends Instance = Instance> =
  | Class<T>
  | [Class<T>, string | ClassSerializerOpts<T>];
