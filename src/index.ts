import MiloDB from "./lib/miloDB";

const db = new MiloDB<string, string>();

// Example usage
db.set("name", "MiloDB");
console.log(db.get("name")); // Output: MiloDB

db.set("language", "TypeScript");
console.log(db.get("language")); // Output: TypeScript

db.delete("name");
console.log(db.get("name")); // Output: null
