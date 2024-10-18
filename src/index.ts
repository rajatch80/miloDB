import MiloDB from "./lib/miloDB";

import ConsistentHashing from "./lib/consistentHashing";

const db = new MiloDB<string, string>();

// Example usage
db.set("name", "MiloDB");
console.log(db.get("name")); // Output: MiloDB

db.set("language", "TypeScript");
console.log(db.get("language")); // Output: TypeScript

db.delete("name");
console.log(db.get("name")); // Output: null

const ch = new ConsistentHashing(3);

ch.addNode("Node1");
ch.addNode("Node2");
ch.addNode("Node3");

// Example key lookups
console.log(ch.getNode("Key1")); // Node responsible for Key1
console.log(ch.getNode("Key2")); // Node responsible for Key2

ch.removeNode("Node1"); // After removing a node, keys are redistributed
