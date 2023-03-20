import { fromJSON, toJSON } from "./index";
describe("toJSON", () => {
  it("handles ordinary objects", () => {
    const inputs = [
      null,
      { a: 1, b: { c: 3 }, d: [4, 5, 6], e: undefined },
      [1, 2, 3],
      1,
      "a",
      true,
      false,
    ];
    inputs.forEach((input) => {
      // TODO satisfy this requirement
      // expect(toJSON(input)).toEqual(JSON.stringify(input));
      expect(fromJSON(toJSON(input))).toEqual(input);
    });
  });

  it("restores duplicate properties", () => {
    const a = [1, 2, 3];
    const obj = { orig: a, same: a, copied: [...a] };
    expect(obj.same).toBe(obj.orig);
    expect(obj.copied).not.toBe(obj.orig);
    const deserialized = fromJSON(toJSON(obj));
    expect(deserialized.same).toBe(deserialized.orig);
    expect(deserialized.copied).not.toBe(deserialized.orig);
  });

  it("restores circular refs", () => {
    const obj: { self?: unknown; num: number } = { num: 2 };
    obj.self = obj;
    const serialized = toJSON(obj);
    const deserialized = fromJSON(serialized);
    expect(deserialized).toEqual(obj);
    expect(deserialized.self).toBe(deserialized);

    // a more nested example
    const obj2 = { a: 1, b: [4, 5, obj], c: undefined };
    const serialized2 = toJSON(obj2);
    const deserialized2 = fromJSON(serialized2);
    expect(deserialized2).toEqual(obj2);
    expect(deserialized2.b[2]).toBe(deserialized2.b[2].self);
  });

  it("serializes Date objects", () => {
    const data = { date: new Date() };
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(deserialized.date).toBeInstanceOf(Date);
    expect(deserialized).toEqual(data);
  });

  it("serializes RegExp objects", () => {
    const data = { regex: /foo/gi };
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(deserialized.regex).toBeInstanceOf(RegExp);
    expect(deserialized).toEqual(data);
  });

  it("serializes Map objects", () => {
    const data = {
      map: new Map([
        ["a", 1],
        ["b", 2],
      ]),
    };
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(deserialized.map).toBeInstanceOf(Map);
    expect(deserialized).toEqual(data);
  });

  it("works if outer object is an array", () => {
    const a = [1, 2, 3];
    const data = [1, 2, a, new Date()];
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(deserialized).toEqual(data);
  });

  it("works if outer object is a Map", () => {
    const data = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(deserialized).toBeInstanceOf(Map);
    expect(deserialized).toEqual(data);
  });

  it("handles duplicates inside of Map", () => {
    const dup = { value: 5 };
    const data = new Map([
      ["a", dup],
      ["b", dup],
    ]);
    const serialized = toJSON(data);
    const deserialized = fromJSON(serialized);
    expect(data.get("a")).toBe(data.get("b"));
    expect(deserialized.get("a")).toBe(deserialized.get("b"));
  });
});
