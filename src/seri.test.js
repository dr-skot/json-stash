const seri = require("seri").default;

describe("seri", () => {
  it("serializes stuff", () => {
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

    // It generates same serialized string as JSON.stringify
    // for plain JS objects.
    expect(seri.stringify(obj)).toEqual(JSON.stringify(obj));
  });

  it("supports Date", () => {
    const date = new Date();
    const dateClone = seri.parse(seri.stringify(date));

    console.log(seri.stringify(date));

    // It is a Date instance.
    dateClone instanceof Date;

    // Not the same instance.
    date !== dateClone;

    // But, new instance with the same value.
    date.toJSON() === dateClone.toJSON();
  });

  it("supports Map", () => {
    const input = new Map([
      [1, 2],
      [3, 4],
    ]);
    const output = seri.parse(seri.stringify(input));

    console.log(seri.stringify(input));

    expect(output).toBeInstanceOf(Map);
    expect(output.toEqual(input));
  });

  it("handles circular references", () => {
    const input = { a: 1, meta: { self: null } };
    input.meta.self = input;
    const output = seri.parse(seri.stringify(input));
    expect(output).toEqual(input);
    expect(output.meta.self).toBe(output);
  });
});
