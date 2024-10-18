class MiloDB<K, V> {
  private store: Map<K, V>;

  constructor() {
    this.store = new Map();
  }

  // Set a value for a specific key
  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  // Get the value associated with a key
  get(key: K): V | null {
    return this.store.get(key) || null;
  }

  // Delete a key-value pair
  delete(key: K): boolean {
    return this.store.delete(key);
  }
}

export default MiloDB;
