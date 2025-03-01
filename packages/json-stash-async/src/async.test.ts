import { Serializer } from "./index";
import { stashAsync, unstashAsync } from "./stashAsync";
import { DEFAULT_SERIALIZERS } from "json-stash/src/serializers";

const DS = DEFAULT_SERIALIZERS;

describe("stash", () => {
  it("handles primitives just like JSON.stringify", async () => {
    const inputs = [
      null,
      { a: 1, b: { c: 3 }, d: [4, 5, 6], e: undefined },
      [1, 2, 3],
      1,
      "a",
      true,
      false,
    ];
    for (const input of inputs) {
      expect(await stashAsync(input, DS)).toEqual(JSON.stringify(input));
      expect(await unstashAsync(await stashAsync(input, DS), DS)).toEqual(
        input,
      );
    }
  });

  it("maintains internal object identity", async () => {
    const a = [1, 2, 3];
    const input = { orig: a, same: a, copied: [...a] };
    expect(input.same).toBe(input.orig);
    expect(input.copied).not.toBe(input.orig);
    // stash maintains identity of orig and same
    const output = await unstashAsync(await stashAsync(input));
    expect(output.same).toBe(output.orig);
    expect(output.copied).not.toBe(output.orig);
    // JSON stringify doesn't do this
    const destringified = JSON.parse(JSON.stringify(input));
    expect(destringified.same).not.toBe(destringified.orig);
  });

  it("restores circular refs", async () => {
    const input: { self?: unknown; num: number } = { num: 2 };
    input.self = input;

    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output.self).toBe(output);

    // a more nested example
    const input2 = { a: 1, b: [4, 5, input], c: undefined };

    const output2 = await unstashAsync(await stashAsync(input2));
    expect(output2).toEqual(input2);
    expect(output2.b[2]).toBe(output2.b[2].self);
  });

  it("serializes objects with symbol keys", async () => {
    const input = { [Symbol.for("a")]: 1, [Symbol.for("b")]: 2 };
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
  });

  it("serializes nested objects with symbol keys", async () => {
    const nested = { [Symbol.for("a")]: 1, [Symbol.for("b")]: 2 };
    const input = { [Symbol.for("c")]: nested, [Symbol.for("d")]: nested };
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output[Symbol.for("c")]).toBe(output[Symbol.for("d")]);
  });

  it("serializes circular objects with symbol keys", async () => {
    const input: Record<symbol, any> = { [Symbol.for("a")]: 1 };
    input[Symbol.for("b")] = input;
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output[Symbol.for("b")]).toBe(output);
  });

  it("serializes Date objects", async () => {
    const input = new Date();
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(Date);
    expect(output).toEqual(input);
  });

  it("serializes RegExp objects", async () => {
    const input = /foo/gi;
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(RegExp);
    expect(output).toEqual(input);
  });

  it("serializes Error objects", async () => {
    for (const ErrorType of [
      Error,
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
    ]) {
      const input = catchError(new ErrorType("test error"));
      const output = await unstashAsync(await stashAsync(input));
      expect(output).toBeInstanceOf(ErrorType);
      expect(output.name).toBe(input.name);
      expect(output.message).toBe(input.message);
      expect(output.stack).toBe(input.stack);
    }
  });

  it("serializes Error objects with cause", async () => {
    const cause = new Error("cause");
    const input = catchError(new (Error as any)("test error", { cause }));
    expect((input as any).cause).toBe(cause);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(Error);
    expect(output.name).toBe(input.name);
    expect(output.message).toBe(input.message);
    expect(output.stack).toBe(input.stack);
    expect(output.cause).toEqual(cause);
  });

  // Intellij IDEA complains about unresolved type AggregateError,
  //   but it's defined in the jsdom test environment
  it("serializes AggregateError objects", async () => {
    const input = catchError(
      new AggregateError(
        [new Error("test error"), new RangeError("RangeError")],
        "aggregate error",
      ),
    ) as AggregateError;
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(AggregateError);
    expect(output.name).toBe(input.name);
    expect(output.message).toBe(input.message);
    expect(output.stack).toBe(input.stack);
    expect(output.errors).toEqual(input.errors);
  });

  it("serializes Map objects", async () => {
    const input = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(Map);
    expect(output).toEqual(input);
  });

  it("seralizes ArrayBuffers", async () => {
    const input = new ArrayBuffer(8);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(ArrayBuffer);
    expect(output.byteLength).toEqual(input.byteLength);
    expect(output).toEqual(input);
  });

  it("serializes all the arrays", async () => {
    for (const arrayType of [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
    ]) {
      const input = new arrayType([1, 2, 3]);
      const output = await unstashAsync(await stashAsync(input));
      expect(output).toBeInstanceOf(arrayType);
      expect(output).toEqual(input);
    }
    for (const arrayType of [BigInt64Array, BigUint64Array]) {
      const input = new arrayType([BigInt(1), BigInt(2), BigInt(3)]);
      const output = await unstashAsync(await stashAsync(input));
      expect(output).toBeInstanceOf(arrayType);
      expect(output).toEqual(input);
    }
  });

  it("serializes Infinity and NaN", async () => {
    const input = [Infinity, -Infinity, NaN];
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
  });

  it("serializes Set objects", async () => {
    const input = new Set(["Armstrong", "Aldrin", "Collins"]);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toBeInstanceOf(Set);
    expect(output).toEqual(input);
  });

  it("handles object identity inside of Map", async () => {
    const singleton = { value: 5 };
    const input = new Map([
      ["a", singleton],
      ["b", singleton],
    ]);
    expect(input.get("a")).toBe(input.get("b"));

    const output = await unstashAsync(await stashAsync(input));
    expect(output.get("a")).toBe(output.get("b"));
  });

  it("handles object identity inside of Set", async () => {
    const singleton = { value: 5 };
    const input = new Map([
      ["a", singleton],
      ["b", singleton],
    ]);
    expect(input.get("a")).toBe(input.get("b"));

    const output = await unstashAsync(await stashAsync(input));
    expect(output.get("a")).toBe(output.get("b"));
  });

  it("supports nested Sets", async () => {
    const input = new Set([new Set([1, 2, 3])]);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
  });

  it("handles circular refs inside of Map", async () => {
    const armstrong: any = { buddy: null };
    const aldrin = { buddy: armstrong };
    armstrong.buddy = aldrin;
    const input = new Map([
      ["armstrong", armstrong],
      ["aldrin", aldrin],
    ]);
    expect(input.get("armstrong").buddy).toBe(input.get("aldrin"));
    expect(input.get("aldrin").buddy).toBe(input.get("armstrong"));

    const output = await unstashAsync(await stashAsync(input));
    expect(output.get("armstrong").buddy).toBe(output.get("aldrin"));
    expect(output.get("aldrin").buddy).toBe(output.get("armstrong"));
  });

  it("supports user-defined serializers", async () => {
    class MoonGuy {
      name: string;
      order: number;
      constructor(name: string, order: number) {
        this.name = name;
        this.order = order;
      }
    }

    const moonGuySerializer: Serializer<MoonGuy, [string, number]> = {
      test: (x) => x instanceof MoonGuy,
      key: "MoonGuy",
      save: (guy: MoonGuy) => [guy.name, guy.order],
      load: ([name, order]: [string, number]) => new MoonGuy(name, order),
    };

    const eagleCrew = [new MoonGuy("Armstrong", 1), new MoonGuy("Aldrin", 2)];

    const stashed = await stashAsync(eagleCrew, [moonGuySerializer]);
    const unstashed = await unstashAsync(stashed, [moonGuySerializer]);

    expect(unstashed[0]).toBeInstanceOf(MoonGuy);
    expect(unstashed[1]).toBeInstanceOf(MoonGuy);
    expect(unstashed).toEqual(eagleCrew);
  });

  it("supports serializers with custom test and load functions", async () => {
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
      test: (obj: unknown) => (obj as MoonGuy).type === "MoonGuy",
      save: (guy: MoonGuy) => [guy.name, guy.order],
      load: ([name, order]: [string, number]) => makeMoonGuy(name, order),
    };

    const eagleCrew = [makeMoonGuy("Armstrong", 1), makeMoonGuy("Aldrin", 2)];

    const stashed = await stashAsync(eagleCrew, [moonGuySerializer]);
    const unstashed = await unstashAsync(stashed, [moonGuySerializer]);

    expect(unstashed[0].type).toBe("MoonGuy");
    expect(unstashed[1].type).toBe("MoonGuy");
    expect(unstashed).toEqual(eagleCrew);
  });

  it("handles objects with $ref, $type and $esc keys", async () => {
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

    const output = await unstashAsync(await stashAsync(input));
    expect(output.map.get("a")).toBe(output.fakeRef);
    expect(output.fakeRef.self).toEqual(output.fakeRef);
    expect(output).toEqual(input);
  });
});

describe("identical objects", () => {
  it("correctly handles identical RegExps", async () => {
    const re = /.*/;
    const input = [re, re];
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output[0]).toBe(output[1]);
  });
  it("correctly handles identical URLs", async () => {
    const url = new URL('https://www.google.com/search?q="json-stash"');
    const input = [url, url];
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output[0]).toBe(output[1]);
  });
  it("handles duplicate objects inside save data", async () => {
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
      serialize(): [RegExp, RegExp] {
        return [this.#regex1, this.#regex2];
      }
      set(regex1: RegExp, regex2: RegExp) {
        this.#regex1 = regex1;
        this.#regex2 = regex2;
      }
    }
    const input = [new RegExPair(a, b), new RegExPair(a, c)];
    const serializers = [
      {
        key: "RegExPair",
        test: (x) => x instanceof RegExPair,
        save: (x: RegExPair) => x.serialize(),
        load: ([r1, r2]: [RegExp, RegExp]) => new RegExPair(r1, r2),
        update: (obj: RegExPair, [r1, r2]: [RegExp, RegExp]) => obj.set(r1, r2),
      } as Serializer<RegExPair>,
      ...DEFAULT_SERIALIZERS,
    ];
    const output = await unstashAsync(
      await stashAsync(input, serializers),
      serializers,
    );
    expect(output[0].serialize()).toEqual(input[0].serialize());
    expect(output[1].serialize()).toEqual(input[1].serialize());
  });

  it("can handle an object with a duplicate object that contains an object that needs to be escaped", async () => {
    const needsToBeEscaped = { $type: "blah" };
    const input = { a: needsToBeEscaped, b: needsToBeEscaped };
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output.a).toBe(output.b);
  });

  it("can handle nested non-vanilla objects with duplicate objects that need to be escaped", async () => {
    const needsToBeEscaped = { $type: "blah" };
    const nested = new Map([
      ["a", needsToBeEscaped],
      ["b", needsToBeEscaped],
    ]);
    const input = new Map([
      ["c", nested],
      ["d", nested],
    ]);
    const output = await unstashAsync(await stashAsync(input));
    expect(output).toEqual(input);
    expect(output.get("c")).toBe(output.get("d"));
    expect(output.get("c").get("a")).toBe(output.get("c").get("b"));
  });

  it("can handle nested plain objects that are recognized by a serializer", async () => {
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

    const serializers = [
      {
        key: "Queue",
        test: (obj) => (obj as Queue).isQueue,
        save: (queue: Queue) => queue.save(),
        load: (data: any[]) => getQueue(data),
        update: (existing: Queue, data: any[]) => existing.set(data),
      } as Serializer<Queue>,
      ...DEFAULT_SERIALIZERS,
    ];

    const q = getQueue([]);

    // make it circular
    q.enqueue(q);

    expect(await stashAsync(q, serializers)).toBe(
      '{"$type":"Queue","data":[{"$ref":"$"}]}',
    );

    const unstashed = await unstashAsync(
      await stashAsync(q, serializers),
      serializers,
    );
    expect(unstashed.dequeue()).toBe(unstashed);
  });
});

function catchError(error: Error): Error {
  try {
    throw error;
  } catch (e: unknown) {
    return e as Error;
  }
}
