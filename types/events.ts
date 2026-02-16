export interface Event<T extends unknown[] = unknown[]> {
  name: string;
  once?: boolean;
  execute(...args: T): void | Promise<void>;
}
