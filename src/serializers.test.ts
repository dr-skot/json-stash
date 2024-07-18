import {
  classSerializer,
  ClassSerializerOpts,
  DEFAULT_SERIALIZERS,
} from "./serializers";

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
    class PublicPerson {
      constructor(
        public name: string,
        public age: number,
      ) {}
    }
    const serializer = classSerializer(PublicPerson as any);
    const person = new PublicPerson("Madeline", 101);
    const saved = serializer.save(person as any);
    // @ts-ignore
    const loaded = serializer.load(saved);
    expect(saved).toEqual({
      name: "Madeline",
      age: 101,
    });
    expect(loaded).toBeInstanceOf(PublicPerson);
    expect(loaded).toEqual(person);
  });

  it("should serialize an object with a save method", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      save() {
        return [this.#name, this.#age];
      }
    }

    const serializer = classSerializer(Person, {
      save: "save",
    } as unknown as ClassSerializerOpts<Person>);
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    expect(saved).toEqual(["Madeline", 101]);
    // @ts-ignore
    const loaded = serializer.load(saved) as Person;
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded.save()).toEqual(["Madeline", 101]);
  });

  it("should deserialize an object with nonstandard save and load methods", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      save() {
        return [this.#name, this.#age].join("|");
      }
      static load(data: string) {
        const [name, age] = data.split("|");
        return new Person(name, parseFloat(age));
      }
      getProperties() {
        return { name: this.#name, age: this.#age };
      }
    }

    const serializer = classSerializer(Person, {
      save: "save",
      load: "load",
    } as unknown as ClassSerializerOpts<Person>);
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    // @ts-ignore
    const loaded = serializer.load(saved) as Person;
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded.getProperties()).toEqual({
      name: "Madeline",
      age: 101,
    });
  });

  it("should call update method when load is called with existing object", function () {
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
      save() {
        return [this.#first, this.#second];
      }
      static load([first, second]: [number[], number[]]) {
        return new Lists(first, second);
      }
      update([first, second]: [number[], number[]]) {
        this.setLists(first, second);
      }
    }

    const serializer = classSerializer(Lists, {
      save: "save",
      load: "load",
      update: "update",
    });
    const list = [1, 2, 3];
    // emulate first round of deserialization with duplicate reference
    // @ts-ignore
    const loaded = serializer.load([[1, 2, 3], { $ref: "$.0" }]) as Lists;
    const loadedLists = loaded.getLists();
    expect(loadedLists[0]).not.toBe(loadedLists[1]);
    // emulate second round with duplicate reference resolved
    // @ts-ignore
    const updated = serializer.load([list, list], loaded as any) as Lists;
    expect(updated).toBe(loaded);
    const updatedLists = updated.getLists();
    expect(updatedLists[0]).toBe(updatedLists[1]);
  });

  it("should serialize an object with a save function", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      save() {
        return [this.#name, this.#age];
      }
    }

    const serializer = classSerializer(Person, {
      save: (obj: Person) => obj.save(),
    } as unknown as ClassSerializerOpts<Person>);
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    expect(saved).toEqual(["Madeline", 101]);
    // @ts-ignore
    const loaded = serializer.load(saved) as Person;
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded.save()).toEqual(["Madeline", 101]);
  });

  it("should deserialize an object with nonstandard save and load functions", function () {
    class Person {
      #name: string;
      #age: number;
      constructor(name: string, age: number) {
        this.#name = name;
        this.#age = age;
      }
      save() {
        return [this.#name, this.#age].join("|");
      }
      static load(data: string) {
        const [name, age] = data.split("|");
        return new Person(name, parseFloat(age));
      }
      getProperties() {
        return { name: this.#name, age: this.#age };
      }
    }

    const serializer = classSerializer(Person, {
      save: (obj) => obj.save(),
      load: (data) => Person.load(data),
    });
    const person = new Person("Madeline", 101);
    const saved = serializer.save(person as any);
    // @ts-ignore
    const loaded = serializer.load(saved) as Person;
    expect(loaded).toBeInstanceOf(Person);
    expect(loaded.getProperties()).toEqual({
      name: "Madeline",
      age: 101,
    });
  });

  it("should call update function when load is called with existing object", function () {
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
      save() {
        return [this.#first, this.#second];
      }
      static load([first, second]: [number[], number[]]) {
        return new Lists(first, second);
      }
      update([first, second]: [number[], number[]]) {
        this.setLists(first, second);
      }
    }

    const serializer = classSerializer(Lists, {
      save: "save",
      load: "load",
      update: (obj, data: [number[], number[]]) => obj.update(data),
    });
    const list = [1, 2, 3];
    // emulate first round of deserialization with duplicate reference
    // @ts-ignore
    const loaded = serializer.load([[1, 2, 3], { $ref: "$.0" }]) as Lists;
    const loadedLists = loaded.getLists();
    expect(loadedLists[0]).not.toBe(loadedLists[1]);
    // emulate second round with duplicate reference resolved
    // @ts-ignore
    const updated = serializer.load([list, list], loaded as any) as Lists;
    expect(updated).toBe(loaded);
    const updatedLists = updated.getLists();
    expect(updatedLists[0]).toBe(updatedLists[1]);
  });

  it("should throw an error if necessary update function is not provided", () => {
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
      save() {
        return [this.#first, this.#second];
      }
    }

    const serializer = classSerializer(Lists, {
      save: "save",
    });
    const list = [1, 2, 3];
    // emulate first round of deserialization with duplicate reference
    // @ts-ignore
    const loaded = serializer.load([[1, 2, 3], { $ref: "$.0" }]) as Lists;
    const loadedLists = loaded.getLists();
    expect(loadedLists[0]).not.toBe(loadedLists[1]);
    // emulate second round with duplicate reference resolved
    expect(() => serializer.load([list, list], loaded)).toThrow();
  });
});
