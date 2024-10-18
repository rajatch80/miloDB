import fs from "fs";

class Snapshot {
  private filePath: string;
  private deltaFilePath: string;

  constructor(filePath: string, deltaFilePath: string) {
    this.filePath = filePath;
    this.deltaFilePath = deltaFilePath;
  }

  // Save full snapshot
  saveFull<K, V>(cache: IterableIterator<[K, V]>): void {
    const data = Object.fromEntries(cache);
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    console.log("Full snapshot saved.");
  }

  // Save only changes (deltas)
  saveDeltas<K, V>(changes: {
    [key: string]: { action: "set" | "delete"; value?: V };
  }): void {
    const delta = JSON.stringify(changes, null, 2);
    fs.appendFileSync(this.deltaFilePath, delta);
    console.log("Delta changes saved.");
  }

  // Load full snapshot and deltas to reconstruct state
  load(): { [key: string]: any } {
    let data: { [key: string]: { action: "set" | "delete"; value?: any } } = {};
    if (fs.existsSync(this.filePath)) {
      const savedData = fs.readFileSync(this.filePath, "utf-8");
      data = JSON.parse(savedData);
    }

    if (fs.existsSync(this.deltaFilePath)) {
      const deltas = JSON.parse(fs.readFileSync(this.deltaFilePath, "utf-8"));
      Object.keys(deltas).forEach((key) => {
        const delta = deltas[key];
        if (delta.action === "set") {
          data[key] = delta.value;
        } else if (delta.action === "delete") {
          delete data[key];
        }
      });
    }
    return data;
  }
}

export default Snapshot;
