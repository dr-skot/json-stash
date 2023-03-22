const s = require("serialijse");

describe("serialijse", () => {
  it("does not match output of JSON.stringify for vanilla values", () => {
    const obj = {
      arr: [{ a: 1, b: null }, 3, null, true, false, ["hi"]],
      obj: { a: "hi", h_m: { d: [] } },
      undefined: undefined,
      null: null,
      true: true,
      false: false,
      "": "",
      hi: "hi",
      1: 1,
      0: 0,
    };

    expect(s.serialize(obj)).not.toEqual(JSON.stringify(obj));
  });

  it("supports Date", () => {
    const input = {
      date: new Date(),
      name: "foo",
    };
    const output = s.deserialize(s.serialize(input));
    expect(output.date).toBeInstanceOf(Date);
    expect(output).toEqual(input);
  });

  it.skip("supports Map", () => {
    const input = new Map([
      [1, 2],
      [3, 4],
    ]);
    const output = s.deserialize(s.serialize(input));

    expect(output).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it.skip("supports Set", () => {
    const input = new Set([1, 2, 3]);

    const output = s.deserialize(s.serialize(input));

    expect(output).toBeInstanceOf(Set);
    expect(output).toEqual(input);
  });

  it("supports Map in a nested position", () => {
    const input = {
      a: [1, 2],
      b: new Map([
        [1, 2],
        [3, 4],
      ]),
    };
    const output = s.deserialize(s.serialize(input));

    expect(output.b).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("supports Set in a nested position", () => {
    const input = {
      a: [1, 2],
      b: new Set([1, 2, 3]),
    };
    const output = s.deserialize(s.serialize(input));

    expect(output.b).toBeInstanceOf(Set);
    expect(output).toEqual(input);
  });

  it("handles circular references inside a Map", () => {
    const map = new Map([]);
    map.set(1, map);
    const input = {
      a: [1, 2],
      b: map,
    };
    const output = s.deserialize(s.serialize(input));

    expect(output.b).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("handles two Maps that refer to each other", () => {
    const map1 = new Map([]);
    const map2 = new Map([]);
    map1.set(2, map2);
    map2.set(1, map1);
    const input = {
      a: [1, 2],
      b: map1,
      c: map2,
    };
    const output = s.deserialize(s.serialize(input));

    expect(output.b).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("serializes custom (function) classes", () => {
    function Person() {
      this.firstName = "Joe";
      this.lastName = "Doe";
      this.age = 42;
    }

    Person.prototype.fullName = function () {
      return this.firstName + " " + this.lastName;
    };

    const input = new Person();

    s.declarePersistable(Person);
    const str = s.serialize(input);
    const output = s.deserialize(str);

    expect(output).toBeInstanceOf(Person);
    expect(output.fullName()).toBe("Joe Doe");
    expect(output).toEqual(input);
  });

  it("serializes modern javascript classes", () => {
    class Person {
      constructor(firstName, lastName, age) {
        this.firstName = "Joe";
        this.lastName = "Doe";
        this.age = 42;
      }
      fullName() {
        return this.firstName + " " + this.lastName;
      }
    }

    const input = new Person("Joe", "Doe", 42);

    s.declarePersistable(Person);
    const str = s.serialize(input);
    const output = s.deserialize(str);

    expect(output).toBeInstanceOf(Person);
    expect(output.fullName()).toBe("Joe Doe");
    expect(output).toEqual(input);
  });

  it("serializes modern javascript classes with private members", () => {
    class Person {
      #firstName = "";
      #lastName = "";
      constructor(firstName, lastName, age) {
        this.#firstName = "Joe";
        this.#lastName = "Doe";
        this.age = 42;
      }
      fullName() {
        return this.#firstName + " " + this.#lastName;
      }
    }

    const input = new Person("Joe", "Doe", 42);

    s.declarePersistable(Person);
    const str = s.serialize(input);
    const output = s.deserialize(str);

    expect(output).toBeInstanceOf(Person);
    expect(output.fullName()).toBe("Joe Doe");
    expect(output).toEqual(input);
  });

  it("handles circular references", () => {
    const Mary = { name: "Mary", friends: [] };
    const Bob = { name: "Bob", friends: [] };

    Mary.friends.push(Bob);
    Bob.friends.push(Mary);

    const input = [Mary, Bob];

    const str = s.serialize(input);
    const output = s.deserialize(str);

    expect(output).toEqual(input);
    expect(output[0].friends[0]).toBe(output[1]); // Mary's friend is Bob
  });

  it("maintains duplicate references", () => {
    const Mary = { name: "Mary", friends: [] };
    const Bob = { name: "Bob", friends: [] };

    // Mary is friends with Bob twice
    Mary.friends.push(Bob);
    Mary.friends.push(Bob);

    const input = Mary;

    const str = s.serialize(input);
    const output = s.deserialize(str);

    expect(output).toEqual(input);
    expect(output.friends[0]).toBe(output.friends[1]); // same Bob
  });
});
