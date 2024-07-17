import { classSerializer, DEFAULT_SERIALIZERS } from "./serializers";

describe("the built-in symbol serializer", () => {
  const serializer = DEFAULT_SERIALIZERS.find(({ key }) => key === "symbol");
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

describe("the class serializer", function () {
  it("should serialize an object with public properties", function () {
    class Person {
      constructor(public name: string, public age: number) {}
    }
    const serializer = classSerializer(Person as any);
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    const loaded = serializer.load(saved);
    expect(saved).toEqual({
      name: "Madeline",
      age: 101,
    });
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded).toEqual(person);
  });
  it("should serialize an object with private properties and a __jsonStash_save method", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      __jsonStash_save() {
        return [this.#name, this.#age];
      }
    }

    const serializer = classSerializer(Person as any);
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    expect(saved).toEqual(["Madeline", 101]);
  });
  it("should deserialize an object with private properties and a __jsonStash_load method", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      static __jsonStash_load([name, age]: [string, number]) {
        return new Person(name, age);
      }
      getProperties() {
        return { name: this.#name, age: this.#age };
      }
    }

    const serializer = classSerializer(Person as any);
    const loaded = serializer.load(["Madeline", 101]) as Person;
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded.getProperties()).toEqual({
      name: "Madeline",
      age: 101,
    });
  });

  it("should __jsonStash_update when load is called with existing object", function () {
    class Lists {
      #first: number[] = [];
      #second: number[] = [];
      constructor(first: number[], second: number[]) {
        this.setLists(first, second);
      }
      setLists(first: number[], second: number[]) {
        this.#first = first;
        this.#second = second;
      }
      getLists() {
        return [this.#first, this.#second];
      }
      static __jsonStash_load([first, second]: [number[], number[]]) {
        return new Lists(first, second);
      }
      __jsonStash_update([first, second]: [number[], number[]]) {
        this.setLists(first, second);
      }
    }

    const serializer = classSerializer(Lists as any);
    const list = [1, 2, 3];
    // emulate first round of deserialization with duplicate reference
    const loaded = serializer.load([[1, 2, 3], { $ref: "$.0" }]) as Lists;
    const loadedLists = loaded.getLists();
    expect(loadedLists[0]).not.toBe(loadedLists[1]);
    // emulate second round with duplicate reference resolved
    const updated = serializer.load([list, list], loaded as any) as Lists;
    expect(updated).toBe(loaded);
    const updatedLists = updated.getLists();
    expect(updatedLists[0]).toBe(updatedLists[1]);
  });
});
