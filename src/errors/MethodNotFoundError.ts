export class MethodNotFoundError extends Error {
  constructor(type: string, method: string, category: string) {
    super(`json-stash: ${category} method "${method}" not found on ${type}`);
    this.name = "MethodNotFoundError";
  }
}
