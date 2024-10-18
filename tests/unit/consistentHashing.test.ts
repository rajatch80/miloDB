import ConsistentHashing from "../../src/lib/consistentHashing";

describe("ConsistentHashing", () => {
  let ch: ConsistentHashing<string>;

  beforeEach(() => {
    ch = new ConsistentHashing(2); // 2 replicas per node
  });

  it("should assign nodes based on consistent hashing", () => {
    ch.addNode("Node1");
    ch.addNode("Node2");
    const nodes = ch.getNodes("key1");
    expect(nodes.length).toBe(2); // 2 replicas
    expect(nodes).toContain("Node1");
    expect(nodes).toContain("Node2");
  });

  it("should distribute keys across nodes", () => {
    ch.addNode("Node1");
    ch.addNode("Node2");
    ch.addNode("Node3");
    const nodes = ch.getNodes("key2");
    expect(nodes.length).toBe(2);
  });

  it("should remove a node and reassign keys", () => {
    ch.addNode("Node1");
    ch.addNode("Node2");
    ch.removeNode("Node2");
    const nodes = ch.getNodes("key3");
    expect(nodes.length).toBe(1); // Only 1 node should remain
    expect(nodes).toContain("Node1");
  });
});
