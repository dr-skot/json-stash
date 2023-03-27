import ESSerializer from "esserializer";

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
    console.log(stringified);
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
    console.log(serialized);
    const output = ESSerializer.deserialize(serialized, [Person]);
    expect(output).toBeInstanceOf(Person);
    expect(output).toEqual(input);
    expect(output.name).not.toBe("John");
    expect(output.age).not.toBe(42);
  });
});
