import { defaultSerializer, findSerializer } from "./serializers";

describe("the built-in symbol serializer", () => {
  const serializer = findSerializer(({ key }) => key === "symbol");
  it("tests for symbol", () => {
    expect(serializer?.test?.(Symbol())).toBe(true);
    expect(serializer?.test?.(Symbol("foo"))).toBe(true);
  });
  it("looks up the symbol if it has a key", () => {
    const sym = Symbol.for("foo");
    const saved = serializer?.save?.(sym);
    const loaded = serializer?.load?.(saved);
    expect(saved).toEqual(["foo", "foo"]);
    expect(loaded).toBe(sym);
  });
  it("creates a new symbol if there's no key", () => {
    const sym = Symbol("foo");
    const saved = serializer?.save?.(sym);
    const loaded = serializer?.load?.(saved);
    expect(saved).toEqual(["foo", undefined]);
    expect(loaded).not.toBe(sym);
    expect(loaded.description).toBe("foo");
  });
});

describe("the default serializer", function () {
  it("should serialize an object with public properties", function () {
    class Person {
      constructor(public name: string, public age: number) {}
    }
    const simulator = defaultSerializer(Person);
    const person = new Person("Madeline", 101);
    const saved = simulator.save(person);
    const loaded = simulator.load(saved);
    expect(saved).toEqual({
      name: "Madeline",
      age: 101,
    });
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded).toEqual(person);
  });
});
