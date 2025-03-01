import ESSerializer from "esserializer";
import { stash, unstash } from "../index";

class Person {
  constructor(public name: string, public age: number) {}
}

describe("esserializer", () => {
  it("supports public-member classes", () => {
    class Person {
      constructor(public name: string, public age: number) {}
    }
    const input = new Person("John", 42);
    expect(input.name).toBe("John");
    expect(input.age).toBe(42);
    const serialized = ESSerializer.serialize(input);
    const stringified = JSON.stringify(serialized);

    const unstringified = JSON.parse(stringified);
    const output = ESSerializer.deserialize(unstringified, [Person]);
    expect(output).toBeInstanceOf(Person);
    expect(output).toEqual(input);
    expect(output.name).toEqual(input.name);
    const output2 = ESSerializer.deserialize(serialized, [Person]);
  });

  it("doesn't serialize private-member classes by default", () => {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      get name() {
        return this.#name;
      }
      get age() {
        return this.#age;
      }
    }
    const input = new Person("John", 42);
    expect(input.name).toBe("John");
    expect(input.age).toBe(42);
    const serialized = ESSerializer.serialize(input);
    const output = ESSerializer.deserialize(serialized, [Person]);

    expect(output).toBeInstanceOf(Person);
    expect(output).toEqual(input);
    expect(output.name).not.toBe("John");
    expect(output.age).not.toBe(42);
  });

  it("doesn't handle plain objects with symbols for keys", () => {
    const foo = Symbol.for("foo");
    const input = { [foo]: "bar", foo: "baz" };

    const serialized = ESSerializer.serialize(input);
    const output = ESSerializer.deserialize(serialized);
    expect(output).not.toEqual(input);

    const stashed = stash(input);
    const unstashed = unstash(stashed);
    expect(unstashed).toEqual(input);
  });

  it("doesn't handle symbols", () => {
    const input = { foo: Symbol.for("foo") };
    const serialized = ESSerializer.serialize(input);
    const output = ESSerializer.deserialize(serialized);
    expect(output).not.toEqual(input);

    const stashed = stash(input);
    const unstashed = unstash(stashed);
    expect(unstashed).toEqual(input);
  });
});
