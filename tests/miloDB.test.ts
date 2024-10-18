import MiloDB from "../src/lib/miloDB";

describe("MiloDB with TTL", () => {
  let db: MiloDB<string, string>;

  beforeEach(() => {
    db = new MiloDB();
  });

  it("should set and get a value by key", () => {
    db.set("key1", "value1");
    expect(db.get("key1")).toBe("value1");
  });

  it("should return null for non-existing key", () => {
    expect(db.get("nonExistingKey")).toBeNull();
  });

  it("should delete a key-value pair", () => {
    db.set("key1", "value1");
    db.delete("key1");
    expect(db.get("key1")).toBeNull();
  });

  it("should set a key with TTL and automatically expire", (done) => {
    db.setWithTTL("key1", "value1", 100); // TTL of 100 ms
    expect(db.get("key1")).toBe("value1");

    setTimeout(() => {
      expect(db.get("key1")).toBeNull(); // After TTL, key should expire
      done();
    }, 150);
  });
});
