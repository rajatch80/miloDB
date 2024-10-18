import Snapshot from "../../src/lib/snapshot";
import fs from "fs";
import path from "path";

describe("Snapshot", () => {
  let snapshot: Snapshot;
  const testFilePath = path.join(__dirname, "test_snapshot.json");

  beforeEach(() => {
    snapshot = new Snapshot(testFilePath);
    jest.clearAllMocks(); // Clears any mocks before each test
  });

  it("should save the cache to a file", () => {
    const writeFileSyncMock = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {});
    const cache = new Map<string, string>([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    snapshot.save(cache.entries());
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      testFilePath,
      expect.any(String)
    );
  });

  it("should load the cache from a file", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ key1: "value1", key2: "value2" }));
    const cache = snapshot.load();
    expect(cache).toEqual({ key1: "value1", key2: "value2" });
  });

  it("should return an empty object if file does not exist", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    const cache = snapshot.load();
    expect(cache).toEqual({});
  });
});
