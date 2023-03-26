import { unstash, stash, addSerializers, type Serializer } from "./index";

function expectStringifyToFail(input: unknown) {
  const output = JSON.parse(JSON.stringify(input));
  expect(output).not.toEqual(input);
}

function expectStringifyToThrow(input: unknown) {
  expect(() => JSON.stringify(input)).toThrow();
}

function expectStashToSucceed(input: unknown) {
  const output = unstash(stash(input));
  expect(output).toEqual(input);
}

describe("JSON.stringify", () => {
  it("punts on non-primitive types", () => {
    const eagle = {
      crew: new Map([
        ["driver", "Armstrong"],
        ["shotgun", "Aldrin"],
      ]),
      landed: new Date("1969-07-21T02:56Z"),
      search: /rock/g,
    };
    Object.values(eagle).forEach(expectStringifyToFail);
    Object.values(eagle).forEach(expectStashToSucceed);
  });

  it("chokes on circular refs", () => {
    const egoist = {} as any;
    egoist.preoccupation = egoist;
    expectStringifyToThrow(egoist);
    expectStashToSucceed(egoist);
  });
});

describe("stash", () => {
  it("handles primitives just like JSON.stringify", () => {
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
      expect(stash(input)).toEqual(JSON.stringify(input));
      expect(unstash(stash(input))).toEqual(input);
    });
  });

  it("maintains internal object identity", () => {
    const a = [1, 2, 3];
    const input = { orig: a, same: a, copied: [...a] };
    expect(input.same).toBe(input.orig);
    expect(input.copied).not.toBe(input.orig);
    // stash maintains identity of orig and same
    const output = unstash(stash(input));
    expect(output.same).toBe(output.orig);
    expect(output.copied).not.toBe(output.orig);
    // JSON stringify doesn't do this
    const destringified = JSON.parse(JSON.stringify(input));
    expect(destringified.same).not.toBe(destringified.orig);
  });

  it("restores circular refs", () => {
    const input: { self?: unknown; num: number } = { num: 2 };
    input.self = input;
    expectStringifyToThrow(input); // JSON stringify chokes

    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output.self).toBe(output);

    // a more nested example
    const input2 = { a: 1, b: [4, 5, input], c: undefined };
    expectStringifyToThrow(input); // JSON stringify chokes

    const output2 = unstash(stash(input2));
    expect(output2).toEqual(input2);
    expect(output2.b[2]).toBe(output2.b[2].self);
  });

  it("serializes Date objects", () => {
    const input = new Date();
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Date);
    expect(output).toEqual(input);
  });

  it("serializes RegExp objects", () => {
    const input = /foo/gi;
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(RegExp);
    expect(output).toEqual(input);
  });

  it("serializes symbols", () => {
    let input, output;

    // no key — input and output will not be equal but descriptions will match
    input = Symbol("foo");
    output = unstash(stash(input));
    expect(typeof output).toBe("symbol");
    expect(output).not.toEqual(input);
    expect(output.description).toEqual(input.description);

    // no key — input and output will be the same object
    input = Symbol.for("foo");
    output = unstash(stash(input));
    expect(typeof output).toBe("symbol");
    expect(output).toBe(input);
  });

  it("serializes BigInts", () => {
    const input = BigInt("1234567890123456789012345678901234567890");
    const output = unstash(stash(input));
    expect(typeof output).toBe("bigint");
    expect(output).toEqual(input);
  });

  it("serializes Map objects", () => {
    const input = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("serializes Set objects", () => {
    const input = new Set(["Armstrong", "Aldrin", "Collins"]);
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Set);
    expect(output).toEqual(input);
  });

  it("serializes Error objects", () => {
    let input, output;
    try {
      JSON.parse("not json");
    } catch (e) {
      input = e as Error;
      output = unstash(stash(input));
      expect(output).toBeInstanceOf(Error);
      expect(output).toEqual(input);
    }
  });

  it("serializes TypedArray objects", () => {
    [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
    ].forEach((Type) => {
      const input = new Type([1, 2, 3]);
      const output = unstash(stash(input));
      expect(output).toBeInstanceOf(Type);
      expect(output).toEqual(input);
    });
  });

  it("handles object identity inside of Map", () => {
    const singleton = { value: 5 };
    const input = new Map([
      ["a", singleton],
      ["b", singleton],
    ]);
    expect(input.get("a")).toBe(input.get("b"));

    const output = unstash(stash(input));
    expect(output.get("a")).toBe(output.get("b"));
  });

  it("handles object identity inside of Set", () => {
    const singleton = { value: 5 };
    const input = new Map([
      ["a", singleton],
      ["b", singleton],
    ]);
    expect(input.get("a")).toBe(input.get("b"));

    const output = unstash(stash(input));
    expect(output.get("a")).toBe(output.get("b"));
  });

  it("supports nested Sets", () => {
    const input = new Set([new Set([1, 2, 3])]);
    const output = unstash(stash(input));
    expect(output).toEqual(input);
  });

  it("handles circular refs inside of Map", () => {
    const armstrong: any = { buddy: null };
    const aldrin = { buddy: armstrong };
    armstrong.buddy = aldrin;
    const input = new Map([
      ["armstrong", armstrong],
      ["aldrin", aldrin],
    ]);
    expect(input.get("armstrong").buddy).toBe(input.get("aldrin"));
    expect(input.get("aldrin").buddy).toBe(input.get("armstrong"));

    const output = unstash(stash(input));
    expect(output.get("armstrong").buddy).toBe(output.get("aldrin"));
    expect(output.get("aldrin").buddy).toBe(output.get("armstrong"));
  });

  it("uses the default serializer for unknown types", () => {
    const input = new URL("https://example.com");
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(URL);
    expect(output.toString()).toEqual(input.toString());
  });

  it("uses the default serializer for unknown types", () => {
    class Person {
      constructor(public name: string, age: number) {}
    }
    const input = new Person("Scott", 55);
    const stashed = stash(input);
    expect(stashed).toEqual('{"$type":"Person","data":{"name":"Scott"}}');
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Person);
    expect(output).toEqual(input);
  });

  it("supports user-defined serializers", () => {
    class MoonGuy {
      name: string;
      order: number;
      constructor(name: string, order: number) {
        this.name = name;
        this.order = order;
      }
    }

    const moonGuySerializer: Serializer<MoonGuy, [string, number]> = {
      type: MoonGuy,
      save: (guy: MoonGuy) => [guy.name, guy.order],
    };

    const eagleCrew = [new MoonGuy("Armstrong", 1), new MoonGuy("Aldrin", 2)];

    const stashed = stash(eagleCrew, [moonGuySerializer]);
    const unstashed = unstash(stashed, [moonGuySerializer]);

    expect(unstashed[0]).toBeInstanceOf(MoonGuy);
    expect(unstashed[1]).toBeInstanceOf(MoonGuy);
    expect(unstashed).toEqual(eagleCrew);
  });

  it("supports serializers with custom test and load functions", () => {
    type MoonGuy = {
      type: "MoonGuy";
      name: string;
      order: number;
    };
    function makeMoonGuy(name: string, order: number): MoonGuy {
      return { type: "MoonGuy", name, order };
    }
    const moonGuySerializer = {
      key: "MoonGuy",
      type: Object,
      test: (obj: MoonGuy) => obj.type === "MoonGuy",
      save: (guy: MoonGuy) => [guy.name, guy.order],
      load: ([name, order]: [string, number]) => makeMoonGuy(name, order),
    };

    const eagleCrew = [makeMoonGuy("Armstrong", 1), makeMoonGuy("Aldrin", 2)];

    const stashed = stash(eagleCrew, [moonGuySerializer]);
    const unstashed = unstash(stashed, [moonGuySerializer]);

    expect(unstashed[0].type).toBe("MoonGuy");
    expect(unstashed[1].type).toBe("MoonGuy");
    expect(unstashed).toEqual(eagleCrew);
  });

  it("handles objects with $ref, $type and $esc keys", () => {
    const fakeRef = {
      $ref: 1,
    };
    const fakeType = {
      $type: 2,
    };
    const fakeEscape = {
      $esc: 3,
    };
    // make one of them circular
    (fakeRef as any).self = fakeRef;

    const input = {
      fakeRef,
      map: new Map<string, any>([
        ["a", fakeRef],
        ["b", fakeType],
        ["c", fakeEscape],
      ]),
    };

    const output = unstash(stash(input));
    expect(output.map.get("a")).toBe(output.fakeRef);
    expect(output.fakeRef.self).toEqual(output.fakeRef);
    expect(output).toEqual(input);
  });
});

describe("addSerializers", () => {
  it("adds a serializer to the default set", () => {
    class Agent {
      first: string;
      last: string;
      constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
      }
      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }

    const agentSerializer: Serializer<Agent, [string, string]> = {
      type: Agent,
      save: (agent) => [agent.first, agent.last],
    };

    const stashed = stash(new Agent("James", "Bond"), [agentSerializer]);
    const agent = unstash(stashed, [agentSerializer]);
    expect(agent.introduce()).toBe("My name is Bond. James Bond.");
  });
});
