import { deepForEach, deepMap, hasOwnProperty, isPlainObject } from "./utils";

// an object with reserved _stashXXX properties needs to be escaped
// so stash doesn't mistakenly dereference or deserialize or unescape it
const keyIsUnsafe = (key: string) => key.match(/^_stash(Ref|Type|Escape)$/);

// any object with a _stashEscape property will return false when passed to isRef() or isDeserializable()
export const isEscaped = (value: object) =>
  hasOwnProperty(value, "_stashEscape");

function escapeObject(value: object) {
  // if the object already has a _stashEscape property, don't overwrite it!
  // prefix _ until we have an unused key we can use as a marker
  let ignoreKey = "_stashEscape";
  while (hasOwnProperty(value, ignoreKey)) ignoreKey = "_" + ignoreKey;

  // we'll delete this marker later
  (value as any)[ignoreKey] = true;

  return value;
}

function unescapeObject(value: unknown) {
  if (!isPlainObject(value)) return value;
  if (!hasOwnProperty(value, "_stashEscape")) return value;

  // delete the ignore marker (it's the /^_+stashEscape$/ key with the most leading underscores)
  let ignoreKey = "_stashEscape";
  while (hasOwnProperty(value, ignoreKey)) ignoreKey = "_" + ignoreKey;
  delete (value as any)[ignoreKey.slice(1)];

  return value;
}

// an object escaper keeps track of escaped objects, so you can unescape them when you're done
export function getObjectEscaper() {
  const seen = new Set();
  function escape(value: unknown) {
    if (!isPlainObject(value)) return value;
    if (!Object.keys(value).some(keyIsUnsafe)) return value;
    if (seen.has(value)) return value;
    seen.add(value);
    return escapeObject(value);
  }
  function findEscapes(value: unknown) {
    let result = false;
    deepMap(
      (node) => {
        if (isPlainObject(node) && isEscaped(node)) {
          seen.add(node);
          result = true;
        }
        return node;
      },
      { depthFirst: false, inPlace: true, avoidCircular: true }
    )(value);
    return result;
  }

  function unescapeAll() {
    seen.forEach((value) => unescapeObject(value));
  }

  return { escape, findEscapes, unescapeAll };
}
