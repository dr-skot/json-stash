import { LegacySerializer } from "./types/LegacySerializer";
import { NoUpdateMethodError } from "./errors/NoUpdateMethodError";
import { Serializer } from "./types/Serializer";
import { Class } from "./types/Class";

// legacy serializers are deprecated, but we'll support them until the next major version
// this function converts LegacySerializers into Serializers, leaving modern Serializers unchanged
// actually, it will alter a Serializer:
// if the update method is missing, it creates one that calls the legacy two-argument load method

export function normalizeSerializer(serializer: LegacySerializer): Serializer {
  const key = serializer.key || getKey(serializer) || "";
  const type = serializer.type as Class;

  return {
    key,
    test: serializer.test || defaultTest(serializer),
    save: serializer.save,
    load: serializer.load,
    update:
      serializer.update ||
      ((value, data) => {
        // try legacy two-parameter load method, but verify that it mutates the object in place
        const result = serializer.load(data, value);
        if (result !== value) throw new NoUpdateMethodError(key);
      }),
  } as Serializer;
}

function defaultTest(serializer: LegacySerializer<any, any>) {
  return (value: unknown) => {
    // TODO why do we need the try/catch here?
    try {
      return serializer.type && value instanceof serializer.type;
    } catch (e) {
      return false;
    }
  };
}

export function getKey(serializer: LegacySerializer<any, any>) {
  // TODO serializer must have either a key or or a type with a name
  return serializer.key || serializer.type?.name;
}
