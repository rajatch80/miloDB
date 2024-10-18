import Snapshot from "../../src/lib/snapshot";
import fs from "fs";
import path from "path";

jest.mock("fs");

describe("Snapshot", () => {
  let snapshot: Snapshot;
  const testFilePath = path.join(__dirname, "test_snapshot.json");
  const deltaFilePath = path.join(__dirname, "test_delta_snapshot.json");

  beforeEach(() => {
    snapshot = new Snapshot(testFilePath, deltaFilePath);
    jest.clearAllMocks(); // Clears any mocks before each test
  });

  it("should save the full cache to a file", () => {
    const writeFileSyncMock = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {});
    const cache = new Map<string, string>([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    snapshot.saveFull(cache.entries());
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      testFilePath,
      expect.any(String)
    );
  });

  it("should save incremental changes (deltas)", () => {
    const appendFileSyncMock = jest
      .spyOn(fs, "appendFileSync")
      .mockImplementation(() => {});
    const changes: {
      [key: string]: { action: "set" | "delete"; value?: any };
    } = {};
    snapshot.saveDeltas(changes);
    expect(appendFileSyncMock).toHaveBeenCalledWith(
      deltaFilePath,
      JSON.stringify(changes, null, 2)
    );
  });

  it("should load the full snapshot and apply deltas", () => {
    jest
      .spyOn(fs, "existsSync")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify({ key1: "value1" }))
      .mockReturnValueOnce(
        JSON.stringify({
          key1: { action: "delete" },
          key2: { action: "set", value: "value2" },
        })
      );
    const cache = snapshot.load();
    expect(cache).toEqual({ key2: "value2" });
  });

  it("should return an empty object if snapshot and deltas do not exist", () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    const cache = snapshot.load();
    expect(cache).toEqual({});
  });
});
