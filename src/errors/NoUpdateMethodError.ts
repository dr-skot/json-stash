export class NoUpdateMethodError extends Error {
  constructor(key: string) {
    super(`json-stash: No update method found for ${key}`);
    this.name = "NoUpdateMethodError";
  }
}
