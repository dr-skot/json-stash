export interface Class<Type = any, Args extends unknown[] = any[]> {
  new (...args: Args): Type;
}
