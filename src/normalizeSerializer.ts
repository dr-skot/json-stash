import { LegacySerializer } from "./types/LegacySerializer";
import { defaultTest } from "./serialize";
import { NoUpdateMethodError } from "./errors/NoUpdateMethodError";

export function getKey(serializer: LegacySerializer<any, any>) {
  // TODO serializer must have either a key or or a type with a name
  return serializer.key || serializer.type?.name;
}

export function normalizeSerializer(serializer: LegacySerializer) {
  // TODO do not accept no key
  const key = serializer.key || getKey(serializer) || "";
  return {
    key,
    test: serializer.test || defaultTest(serializer),
    ...serializer,
    update:
      serializer.update ||
      ((value, data) => {
        // try legacy two-parameter load method, but verify that it mutates the object in place
        const result = serializer.load(data, value);
        if (result !== value) throw new NoUpdateMethodError(key);
      }),
  };
}
