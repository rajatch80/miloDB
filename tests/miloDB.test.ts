import MiloDB from "../src/lib/miloDB";

describe("MiloDB", () => {
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
});
