class MiloDB<K, V> {
  private store: Map<K, { value: V; expiry: number | null }>;

  constructor() {
    this.store = new Map();
  }

  // Set a value for a specific key
  set(key: K, value: V): void {
    this.store.set(key, { value, expiry: null });
  }

  // Set a value with a TTL (milliseconds)
  setWithTTL(key: K, value: V, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });

    // Schedule key deletion after TTL
    setTimeout(() => {
      const entry = this.store.get(key);
      if (entry && entry.expiry !== null && Date.now() > entry.expiry) {
        this.store.delete(key);
      }
    }, ttl);
  }

  // Get the value associated with a key
  get(key: K): V | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiry !== null && Date.now() > entry.expiry) {
      this.store.delete(key); // Key expired, remove it
      return null;
    }

    return entry.value;
  }

  // Delete a key-value pair
  delete(key: K): boolean {
    return this.store.delete(key);
  }
}

export default MiloDB;
