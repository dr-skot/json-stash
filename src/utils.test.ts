import { evalVariableName, isVariableName } from "./utils";

describe("evalVariableName", () => {
  it("evaluates a variable name", () => {
    const foo = "bar";
    expect(
      evalVariableName("foo", (x: string) =>
        isVariableName(x) ? eval(x) : undefined
      )
    ).toBe("bar");
    expect(evalVariableName("foo", (x: string) => eval(x))).toBe("bar");
  });

  it("returns undefined for non-variable names", () => {
    expect(evalVariableName("foo.bar", (name: string) => name)).toBe(undefined);
  });
});
