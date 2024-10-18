class Node<K, V> {
  key: K;
  value: V;
  next: Node<K, V> | null = null;
  prev: Node<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, Node<K, V>>;
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
  }

  // Set a value for a specific key
  set(key: K, value: V): void {
    if (this.map.has(key)) {
      const existingNode = this.map.get(key);
      if (existingNode) {
        this._remove(existingNode);
      }
    }

    const newNode = new Node(key, value);
    this._add(newNode);
    this.map.set(key, newNode);

    if (this.map.size > this.capacity) {
      const leastUsedNode = this.tail;
      if (leastUsedNode) {
        this.map.delete(leastUsedNode.key);
        this._remove(leastUsedNode);
      }
    }
  }

  // Get the value associated with a key
  get(key: K): V | null {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key);
    if (node) {
      this._remove(node);
      this._add(node);
      return node.value;
    }
    return null;
  }

  // Add a node to the front of the linked list (most recently used)
  private _add(node: Node<K, V>): void {
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

  // Remove a node from the linked list
  private _remove(node: Node<K, V>): void {
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
}

export default LRUCache;
