import {
  isPlainObject,
  isVanilla,
  deepForEach,
  deepMap,
  hasOwnProperty,
  getOwnKeys,
  hasSymbolKeys,
} from "./utils"; // Update the import path based on your project structure

describe("Utils Module Tests", () => {
  describe("isPlainObject", () => {
    it("should return true for plain objects", () => {
      expect(isPlainObject({})).toBe(true);
    });

    it("should return false for non-plain objects", () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
      expect(isPlainObject(42)).toBe(false);
    });
  });

  describe("isVanilla", () => {
    it("should return true for undefined", () => {
      expect(isVanilla(undefined)).toBe(true);
    });

    it("should return true for null", () => {
      expect(isVanilla(null)).toBe(true);
    });

    it("should return true for strings", () => {
      expect(isVanilla("Hello")).toBe(true);
    });

    it("should return true for numbers that are not Infinity or NaN", () => {
      expect(isVanilla(42)).toBe(true);
    });

    it("should return true for booleans", () => {
      expect(isVanilla(true)).toBe(true);
      expect(isVanilla(false)).toBe(true);
    });

    it("should return true for arrays", () => {
      expect(isVanilla([])).toBe(true);
      expect(isVanilla([1, 2, 3])).toBe(true);
    });

    it("should return true for plain objects without symbol keys", () => {
      expect(isVanilla({ key: "value" })).toBe(true);
    });

    it("should return false for Infinity", () => {
      expect(isVanilla(Infinity)).toBe(false);
      expect(isVanilla(-Infinity)).toBe(false);
    });

    it("should return false for NaN", () => {
      expect(isVanilla(NaN)).toBe(false);
    });

    it("should return false for symbols", () => {
      expect(isVanilla(Symbol("symbolKey"))).toBe(false);
    });

    it("should return false for objects with symbol keys", () => {
      expect(isVanilla({ [Symbol("symbolKey")]: "symbolValue" })).toBe(false);
    });

    it("should return false for functions", () => {
      expect(isVanilla(() => {})).toBe(false);
    });

    it("should return false for classes", () => {
      class Foo {}
      expect(isVanilla(Foo)).toBe(false);
    });

    it("should return false for class instances", () => {
      class Foo {}
      expect(isVanilla(new Foo())).toBe(false);
    });

    it("should return false for BigInts", () => {
      expect(isVanilla(BigInt(42))).toBe(false);
    });
  });

  describe("deepForEach", () => {
    // TODO: Add tests for deepForEach function
    test("", () => expect(deepForEach).toBeInstanceOf(Function));
  });

  describe("deepMap", () => {
    // TODO: Add tests for deepMap function
    test("", () => expect(deepMap).toBeInstanceOf(Function));
  });

  describe("hasOwnProperty", () => {
    it("should return true for existing own property", () => {
      const obj = { key: "value" };
      expect(hasOwnProperty(obj, "key")).toBe(true);
    });

    it("should return false for non-existing own property", () => {
      const obj = { key: "value" };
      expect(hasOwnProperty(obj, "nonexistent")).toBe(false);
    });
  });

  describe("getOwnKeys", () => {
    it("should return own keys including symbols", () => {
      const sym = Symbol("symbolKey");
      const obj = { key: "value", [sym]: "symbolValue" };
      const keys = getOwnKeys(obj);
      expect(keys).toContain("key");
      expect(keys).toContain(sym);
    });
  });

  describe("hasSymbolKeys", () => {
    it("should return true for an object with symbol keys", () => {
      const obj = { [Symbol("symbolKey")]: "symbolValue" };
      expect(hasSymbolKeys(obj)).toBe(true);
    });

    it("should return false for an object without symbol keys", () => {
      const obj = { key: "value" };
      expect(hasSymbolKeys(obj)).toBe(false);
    });
  });
});
