import {
  stash,
  unstash,
  addSerializers,
  clearSerializers,
  getStasher,
  type Serializer,
} from "./index";
import { isPlainObject } from "./utils";

describe("stash", () => {
  beforeEach(() => {
    clearSerializers();
  });
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

    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output.self).toBe(output);

    // a more nested example
    const input2 = { a: 1, b: [4, 5, input], c: undefined };

    const output2 = unstash(stash(input2));
    expect(output2).toEqual(input2);
    expect(output2.b[2]).toBe(output2.b[2].self);
  });

  it("serializes objects with symbol keys", () => {
    const input = { [Symbol.for("a")]: 1, [Symbol.for("b")]: 2 };
    const output = unstash(stash(input));
    expect(output).toEqual(input);
  });

  it("serializes nested objects with symbol keys", () => {
    const nested = { [Symbol.for("a")]: 1, [Symbol.for("b")]: 2 };
    const input = { [Symbol.for("c")]: nested, [Symbol.for("d")]: nested };
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output[Symbol.for("c")]).toBe(output[Symbol.for("d")]);
  });

  it("serializes circular objects with symbol keys", () => {
    const input: Record<symbol, any> = { [Symbol.for("a")]: 1 };
    input[Symbol.for("b")] = input;
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output[Symbol.for("b")]).toBe(output);
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

  it("serializes Map objects", () => {
    const input = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("seralizes ArrayBuffers", () => {
    const input = new ArrayBuffer(8);
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(ArrayBuffer);
    expect(output.byteLength).toEqual(input.byteLength);
    expect(output).toEqual(input);
  });

  it("serializes all the arrays", () => {
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
    ].forEach((arrayType) => {
      const input = new arrayType([1, 2, 3]);
      const output = unstash(stash(input));
      expect(output).toBeInstanceOf(arrayType);
      expect(output).toEqual(input);
    });
    [BigInt64Array, BigUint64Array].forEach((arrayType) => {
      const input = new arrayType([BigInt(1), BigInt(2), BigInt(3)]);
      const output = unstash(stash(input));
      expect(output).toBeInstanceOf(arrayType);
      expect(output).toEqual(input);
    });
  });

  it("serializes Infinity and NaN", () => {
    const input = [Infinity, -Infinity, NaN];
    const output = unstash(stash(input));
    expect(output).toEqual(input);
  });

  it("serializes Set objects", () => {
    const input = new Set(["Armstrong", "Aldrin", "Collins"]);
    const output = unstash(stash(input));
    expect(output).toBeInstanceOf(Set);
    expect(output).toEqual(input);
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
      key: "MoonGuy",
      save: (guy: MoonGuy) => [guy.name, guy.order],
      load: ([name, order]: [string, number]) => new MoonGuy(name, order),
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

describe("addClasses", () => {
  beforeEach(() => {
    clearSerializers();
  });
  it("adds a class to the default set", () => {
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

    const stasher1 = getStasher();
    const stasher2 = getStasher();

    stasher1.addClasses(Agent);

    const stashed = stasher1.stash(new Agent("James", "Bond"));
    const unstashed1 = stasher2.unstash(stashed);
    expect(unstashed1.introduce).not.toBeDefined();

    stasher2.addClasses(Agent);
    const unstashed2 = stasher2.unstash(stashed);
    expect(unstashed2.introduce()).toBe("My name is Bond. James Bond.");

    // addClasses creates serialziers, so class support disappears if you clear serializers
    stasher2.clearSerializers();
    const unstashed3 = stasher2.unstash(stashed);
    expect(unstashed3.introduce).not.toBeDefined();
  });

  it("allows you to name classes", () => {
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

    const stasher = getStasher();
    stasher.addClasses([Agent, "SpecialAgent"]);

    const stashed = stasher.stash(new Agent("James", "Bond"));
    expect(stashed).toContain('"$type":"SpecialAgent"');

    const unstashed = stasher.unstash(stashed);
    expect(unstashed.introduce()).toBe("My name is Bond. James Bond.");
  });
});

describe("addSerializers", () => {
  beforeEach(() => {
    clearSerializers();
  });
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
      load: ([first, last]) => new Agent(first, last),
    };

    const stasher1 = getStasher();
    const stasher2 = getStasher();

    let agent = stasher2.unstash(stasher1.stash(new Agent("James", "Bond")));
    expect(agent.introduce).not.toBeDefined();

    let stashed = stasher1.stash(new Agent("James", "Bond"), [agentSerializer]);
    agent = stasher2.unstash(stashed, [agentSerializer]);
    expect(agent.introduce()).toBe("My name is Bond. James Bond.");

    stasher2.addSerializers(agentSerializer);
    agent = stasher2.unstash(stashed);
    expect(agent.introduce()).toBe("My name is Bond. James Bond.");
  });
});

describe("stashers", () => {
  it("have different serializer sets", () => {
    const stasher1 = getStasher();
    const stasher2 = getStasher();
    stasher2.addSerializers({
      type: Date,
      save: () => "not supported",
      load: () => new Date(),
    });
    const d = new Date("2020-01-01");
    expect(stasher1.stash(d)).toBe(
      '{"$type":"Date","data":"2020-01-01T00:00:00.000Z"}',
    );
    expect(stasher2.stash(d)).toBe('{"$type":"Date","data":"not supported"}');
  });
});

describe("identical objects", () => {
  it("correctly handles identical RegExps", () => {
    const re = /.*/;
    const input = [re, re];
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output[0]).toBe(output[1]);
  });
  it("correctly handles identical URLs", () => {
    const url = new URL('https://www.google.com/search?q="json-stash"');
    const input = [url, url];
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output[0]).toBe(output[1]);
  });
  it("handles duplicate objects inside save data", () => {
    const a = /a/;
    const b = /b/;
    const c = /c/;
    class RegExPair {
      #regex1: RegExp;
      #regex2: RegExp;
      constructor(regex1: RegExp, regex2: RegExp) {
        this.#regex1 = regex1;
        this.#regex2 = regex2;
      }
      serialize() {
        return [this.#regex1, this.#regex2];
      }
      set(regex1: RegExp, regex2: RegExp) {
        this.#regex1 = regex1;
        this.#regex2 = regex2;
      }
    }
    const input = [new RegExPair(a, b), new RegExPair(a, c)];
    addSerializers({
      type: RegExPair,
      save: (x: RegExPair) => x.serialize(),
      load: ([r1, r2]: [RegExp, RegExp], existing = new RegExPair(r1, r2)) => {
        existing.set(r1, r2);
        return existing;
      },
    });
    const output = unstash(stash(input));
    expect(output[0].serialize()).toEqual(input[0].serialize());
    expect(output[1].serialize()).toEqual(input[1].serialize());
  });

  it("can handle an object with a duplicate object that contains an object that needs to be escaped", () => {
    const needsToBeEscaped = { $type: "blah" };
    const input = { a: needsToBeEscaped, b: needsToBeEscaped };
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output.a).toBe(output.b);
  });

  it("can handle nested non-vanilla objects with duplicate objects that need to be escaped", () => {
    const needsToBeEscaped = { $type: "blah" };
    const nested = new Map([
      ["a", needsToBeEscaped],
      ["b", needsToBeEscaped],
    ]);
    const input = new Map([
      ["c", nested],
      ["d", nested],
    ]);
    const output = unstash(stash(input));
    expect(output).toEqual(input);
    expect(output.get("c")).toBe(output.get("d"));
    expect(output.get("c").get("a")).toBe(output.get("c").get("b"));
  });

  it("can handle nested plain objects that are recognized by a serializer", () => {
    // create a queue object that is recognized by a serializer
    function getQueue(items: any[]) {
      items = [...items];
      return {
        isQueue: true,
        enqueue: (item: any) => items.unshift(item),
        dequeue: () => items.pop(),
        save: () => [...items],
        set: (newItems: any[]) => (items = newItems),
      };
    }
    type Queue = ReturnType<typeof getQueue>;

    addSerializers({
      key: "Queue",
      type: Object,
      test: (obj) => obj.isQueue,
      save: (queue: Queue) => queue.save(),
      load: (data: any[], existing?: Queue) => {
        if (!existing) return getQueue(data);
        existing.set(data);
        return existing;
      },
    });

    const q = getQueue([]);

    // make it circular
    q.enqueue(q);

    expect(stash(q)).toBe('{"$type":"Queue","data":[{"$ref":"$"}]}');

    const unstashed = unstash(stash(q));
    expect(unstashed.dequeue()).toBe(unstashed);
  });
});
