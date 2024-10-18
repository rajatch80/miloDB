import fs from "fs";

class Snapshot {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  // Save the current state of the cache to a file
  save<K, V>(entries: IterableIterator<[K, V]>): void {
    const data: { [key: string]: V } = {};
    for (const [key, value] of entries) {
      data[String(key)] = value;
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    console.log("Snapshot saved successfully");
  }

  // Load the cache state from a file
  load(): { [key: string]: any } {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(data);
    }
    return {};
  }
}

export default Snapshot;
