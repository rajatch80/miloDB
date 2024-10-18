import MiloLRUCache from "../../src/lib/miloDB";

describe("MiloDB (LRU Cache with TTL)", () => {
  let db: MiloLRUCache<string, string>;

  beforeEach(() => {
    db = new MiloLRUCache(3); // Capacity of 3 items
  });

  it("should set and retrieve a value", () => {
    db.set("key1", "value1");
    expect(db.get("key1")).toBe("value1");
  });

  it("should evict least recently used (LRU) items when capacity is exceeded", () => {
    db.set("key1", "value1");
    db.set("key2", "value2");
    db.set("key3", "value3");
    db.set("key4", "value4"); // This will evict 'key1'

    expect(db.get("key1")).toBeNull(); // 'key1' should be evicted
    expect(db.get("key4")).toBe("value4"); // 'key4' should be present
  });

  it("should handle TTL expiration", (done) => {
    db.set("key1", "value1", 100); // TTL of 100 ms
    expect(db.get("key1")).toBe("value1");

    setTimeout(() => {
      expect(db.get("key1")).toBeNull(); // 'key1' should expire
      done();
    }, 150);
  });

  it("should delete a key", () => {
    db.set("key1", "value1");
    db.delete("key1");
    expect(db.get("key1")).toBeNull();
  });
});
