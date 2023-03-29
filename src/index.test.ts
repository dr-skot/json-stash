import {
  stash,
  unstash,
  addSerializers,
  clearSerializers,
  getStasher,
  type Serializer,
} from "./index";

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
    stasher2.addSerializers({ type: Date, save: () => "not supported" });
    const d = new Date("2020-01-01");
    expect(stasher1.stash(d)).toBe(
      '{"$type":"Date","data":["2020-01-01T00:00:00.000Z"]}'
    );
    expect(stasher2.stash(d)).toBe('{"$type":"Date","data":"not supported"}');
  });
});
