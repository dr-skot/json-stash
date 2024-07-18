import { stashable } from "./stashable";
import { getStasher, stash, unstash } from "./index";

@stashable()
class PublicClass {
  constructor(public name: string) {}
}

@stashable({ key: "SpeciallyNamed" })
class NamedClass {
  constructor(public name: string) {}
}

@stashable({ group: "Scoped" })
class ScopedClass {
  constructor(public name: string) {}
}

@stashable()
class CountingGuy {
  #name: string = "";
  #list: number[] = [];

  constructor(name: string, list: number[] = [1, 2, 3]) {
    this.#name = name;
    this.#list = list;
  }
  sayHello() {
    return `Hello, my name is ${this.#name}`;
  }
  count() {
    return this.#list.join(", ");
  }

  getNumbers() {
    return this.#list;
  }

  @stashable.save
  serialize() {
    return [this.#name, this.#list];
  }

  @stashable.update
  update([name, list]: [string, number[]]) {
    this.#name = name;
    this.#list = list;
  }

  @stashable.load
  static deserialize([name, list]: [string, number[]]) {
    return new CountingGuy(name, list);
  }
}

describe("PublicClass", () => {
  it("saves and loads", () => {
    const test = new PublicClass("Alice");
    const unstashed = unstash(stash(test));
    expect(unstashed instanceof PublicClass).toBe(true);
    expect(unstashed.name).toBe("Alice");
  });
});

describe("SpeciallyNamed", () => {
  it("saves and loads", () => {
    const test = new NamedClass("Jill");
    const stashed = stash(test);
    expect(stashed).toContain("SpeciallyNamed");
    expect(stashed).not.toContain("NamedClass");
    const unstashed = unstash(stashed);
    expect(unstashed instanceof NamedClass).toBe(true);
    expect(unstashed.name).toBe("Jill");
  });
});

describe("CountingGuy", () => {
  it("saves and loads", () => {
    const test = new CountingGuy("Bob", [4, 5, 6]);
    expect(test.sayHello()).toBe("Hello, my name is Bob");
    expect(test.count()).toBe("4, 5, 6");
    expect((test as any).__jsonStash_save()).toEqual(["Bob", [4, 5, 6]]);
    // @ts-ignore
    expect(test.serialize.__jsonStash_save).toBe(true);
    const unstashed = unstash(stash(test));
    expect(unstashed.sayHello()).toBe("Hello, my name is Bob");
    expect(unstashed.count()).toBe("4, 5, 6");
  });
  it("handles duplicate references", () => {
    const numbers = [1, 2, 3];
    const bob = new CountingGuy("Bob", numbers);
    const alice = new CountingGuy("Alice", numbers);
    const unstashed = unstash(stash({ bob, alice }));
    expect(unstashed.bob.getNumbers()).toBe(unstashed.alice.getNumbers());
  });
});

describe("stashable group", () => {
  it("does not get added to the global stasher", () => {
    const stashed = stash(new ScopedClass("Alice"));
    console.log("stashed", stashed);
    const unstashedGlobally = unstash(stash(new ScopedClass("Alice")));
    expect(unstashedGlobally instanceof ScopedClass).toBe(false);
  });
  it("can be added to a stasher", () => {
    const stasher = getStasher();
    stasher.addClasses(...stashable.group("Scoped"));
    const unstashed = stasher.unstash(stasher.stash(new ScopedClass("Alice")));
    expect(unstashed instanceof ScopedClass).toBe(true);
  });
});
