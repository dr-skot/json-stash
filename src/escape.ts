import { deepMap, isPlainObject, keys } from "./utils";

// a data object that happens to have keys $ref, $type, or $esc
// needs to be escaped so stash doesn't mistakenly try to dereference or deserialize or unescape it
const keyIsUnsafe = (key: string) => /^\$+(ref|type)$/.test(key);
const keyIsEscaped = (key: string) => /^\$\$+(ref|type)$/.test(key);

// any object with an $esc property will return false when passed to isRef() or isDeserializable()
export const isEscaped = (value: object) => keys(value).some(keyIsEscaped);

function escapeObject(value: object) {
  keys(value)
    .sort()
    .filter(keyIsUnsafe)
    .forEach((key) => {
      const newKey = "$" + key;
      (value as any)[newKey] = (value as any)[key];
      delete (value as any)[key];
    });

  return value;
}

function unescapeObject(value: unknown) {
  if (!isPlainObject(value)) return value;

  keys(value)
    .sort()
    .reverse()
    .forEach((key) => {
      if (keyIsEscaped(key)) {
        const newKey = key.slice(1);
        (value as any)[newKey] = (value as any)[key];
        delete (value as any)[key];
      }
    });

  return value;
}

// an object escaper keeps track of escaped objects, so you can unescape them when you're done
export function getObjectEscaper() {
  const cache = new Set();
  function escape(value: unknown) {
    if (!isPlainObject(value)) return value;
    if (!keys(value).some(keyIsUnsafe)) return value;
    if (cache.has(value)) return value;
    cache.add(value);
    return escapeObject(value);
  }
  function registerEscapes(value: unknown) {
    let result = false;
    deepMap(
      (node) => {
        if (isPlainObject(node) && isEscaped(node)) {
          cache.add(node);
          result = true;
        }
        return node;
      },
      true,
      false,
      true,
    )(value);
    return result;
  }

  function unescapeAll() {
    cache.forEach(unescapeObject);
    cache.clear();
  }

  return { escape, registerEscapes, unescapeAll };
}
