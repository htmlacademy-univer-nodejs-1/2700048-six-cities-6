export interface ConfigInterface<T> {
  get<K extends keyof T>(key: K): T[K];
}

