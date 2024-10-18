class Node<K, V> {
  key: K;
  value: V;
  expiry: number | null = null;
  next: Node<K, V> | null = null;
  prev: Node<K, V> | null = null;

  constructor(key: K, value: V, ttl?: number) {
    this.key = key;
    this.value = value;
    if (ttl) {
      this.expiry = Date.now() + ttl;
    }
  }
}

class MiloLRUCache<K, V> {
  private capacity: number;
  private store: Map<K, Node<K, V>>;
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.store = new Map();
  }

  // Set a value for a key with optional TTL
  set(key: K, value: V, ttl?: number): void {
    if (this.store.has(key)) {
      const existingNode = this.store.get(key);
      if (existingNode) {
        this.removeNode(existingNode);
      }
    }

    const newNode = new Node(key, value, ttl);
    this.addNode(newNode);
    this.store.set(key, newNode);

    if (this.store.size > this.capacity) {
      const leastUsedNode = this.tail;
      if (leastUsedNode) {
        this.store.delete(leastUsedNode.key);
        this.removeNode(leastUsedNode);
      }
    }
  }

  // Get value by key
  get(key: K): V | null {
    const node = this.store.get(key);
    if (!node) return null;

    if (node.expiry && Date.now() > node.expiry) {
      this.delete(key); // Key expired
      return null;
    }

    this.removeNode(node);
    this.addNode(node);
    return node.value;
  }

  // Delete a key
  delete(key: K): boolean {
    const node = this.store.get(key);
    if (!node) return false;

    this.removeNode(node);
    return this.store.delete(key);
  }

  // Add node to the front (most recently used)
  private addNode(node: Node<K, V>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  // Remove a node from the list
  private removeNode(node: Node<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  // Iterator for entries (returns [K, V])
  entriesWithExpiry(): IterableIterator<
    [K, { value: V; expiry: number | null }]
  > {
    const self = this;
    const keys = this.store.keys();

    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<[K, { value: V; expiry: number | null }]> {
        const { value: key, done } = keys.next();
        if (done) {
          return { value: undefined, done: true };
        } else {
          const node = self.store.get(key);
          if (node) {
            return {
              value: [key, { value: node.value, expiry: node.expiry }],
              done: false,
            };
          } else {
            return this.next();
          }
        }
      },
    };
  }
}

export default MiloLRUCache;
