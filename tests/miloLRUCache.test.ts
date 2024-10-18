import LRUCache from "../src/lib/miloLRUCache";

describe("LRUCache", () => {
  let cache: LRUCache<string, string>;

  beforeEach(() => {
    cache = new LRUCache(2); // Set capacity to 2
  });

  it("should set and get a value by key", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should evict the least recently used item", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3"); // This will evict 'key1'

    expect(cache.get("key1")).toBeNull(); // key1 should be evicted
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBe("value3");
  });

  it("should update the usage order when a key is accessed", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.get("key1"); // key1 becomes most recently used
    cache.set("key3", "value3"); // This will evict 'key2'

    expect(cache.get("key2")).toBeNull(); // key2 should be evicted
    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("key3")).toBe("value3");
  });
});
