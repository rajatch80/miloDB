import crypto from "crypto";

class ConsistentHashing<K> {
  private ring: Map<number, string>;
  private nodes: string[];
  private replicas: number;

  constructor(replicas = 3) {
    this.replicas = replicas;
    this.ring = new Map();
    this.nodes = [];
  }

  // Helper function to hash a key to an integer
  private hash(key: string): number {
    return parseInt(
      crypto.createHash("md5").update(key).digest("hex").substr(0, 8),
      16
    );
  }

  // Add a node to the hash ring
  addNode(node: string): void {
    this.nodes.push(node);
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(`${node}:${i}`);
      this.ring.set(hash, node);
    }
    this.sortRing();
  }

  // Remove a node from the ring
  removeNode(node: string): void {
    this.nodes = this.nodes.filter((n) => n !== node);
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(`${node}:${i}`);
      this.ring.delete(hash);
    }
    this.sortRing();
  }

  // Sort the hash ring
  private sortRing(): void {
    this.ring = new Map([...this.ring.entries()].sort((a, b) => a[0] - b[0]));
  }

  // Find the primary and replica nodes for a given key
  getNodes(key: K): string[] {
    const keyHash = this.hash(String(key));
    const nodes = [];

    for (const [hash, node] of this.ring) {
      if (keyHash <= hash) {
        nodes.push(node);
        if (nodes.length === this.replicas) break;
      }
    }

    // If there aren't enough nodes after traversing, wrap around
    if (nodes.length < this.replicas) {
      for (const node of this.ring.values()) {
        if (!nodes.includes(node)) {
          // Avoid duplicates
          nodes.push(node);
          if (nodes.length === this.replicas) break;
        }
      }
    }

    return nodes;
  }
}

export default ConsistentHashing;
