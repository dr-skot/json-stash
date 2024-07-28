import { stash, unstash } from "./stash";
import { DEFAULT_SERIALIZERS } from "./serializers";
import { Class } from "./types/Class";
import { classSerializer, ClassSerializerOpts } from "./classSerializer";
import { Serializer } from "./types/Serializer";

// a stasher can `stash` and `unstash` objects, using the default serializers
// plus any additional serializers added to with `addSerializers`
export function getStasher() {
  let addedSerializers: Serializer[] = [];

  function combineSerializers(serializers: Serializer[] = []) {
    return [...serializers, ...addedSerializers, ...DEFAULT_SERIALIZERS];
  }

  const methods = {
    stash: (data: unknown, serializers?: Serializer[]) => {
      return stash(data, combineSerializers(serializers));
    },

    unstash: (json: string, serializers?: Serializer[]) => {
      return unstash(json, combineSerializers(serializers));
    },

    // TODO warn when serializers have the same key

    addSerializers(...serializers: Serializer[]) {
      addedSerializers.splice(0, 0, ...serializers);
    },

    addSerializer(serializer: Serializer) {
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
        const index = addedSerializers.findIndex((s) => s.key === key);
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
