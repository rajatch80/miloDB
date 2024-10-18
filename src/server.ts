import express from "express";
import axios from "axios";
import ConsistentHashing from "./lib/consistentHashing";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const nodes = ["http://localhost:3001", "http://localhost:3002"]; // List of all nodes including this one

// Consistent hashing object
const ch = new ConsistentHashing(3);
nodes.forEach((node) => ch.addNode(node));

const cache: { [key: string]: string } = {};

// GET: Retrieve a value by key
app.get("/get/:key", (req, res) => {
  const key = req.params.key;
  const responsibleNode = ch.getNode(key);

  if (responsibleNode === `http://localhost:${PORT}`) {
    const value = cache[key] || null;
    res.json({ value });
  } else {
    // Forward request to the responsible node
    axios
      .get(`${responsibleNode}/get/${key}`)
      .then((response) => res.json(response.data))
      .catch((err) =>
        res.status(500).json({ error: "Error fetching from node" })
      );
  }
});

// POST: Set a value
app.post("/set", (req, res) => {
  const { key, value } = req.body;
  const responsibleNode = ch.getNode(key);

  if (responsibleNode === `http://localhost:${PORT}`) {
    cache[key] = value;
    res.json({ success: true });
  } else {
    // Forward request to the responsible node
    axios
      .post(`${responsibleNode}/set`, { key, value })
      .then((response) => res.json(response.data))
      .catch((err) =>
        res.status(500).json({ error: "Error forwarding to node" })
      );
  }
});

// DELETE: Delete a key-value pair
app.delete("/delete/:key", (req, res) => {
  const key = req.params.key;
  const responsibleNode = ch.getNode(key);

  if (responsibleNode === `http://localhost:${PORT}`) {
    delete cache[key];
    res.json({ success: true });
  } else {
    // Forward request to the responsible node
    axios
      .delete(`${responsibleNode}/delete/${key}`)
      .then((response) => res.json(response.data))
      .catch((err) =>
        res.status(500).json({ error: "Error forwarding to node" })
      );
  }
});

app.listen(PORT, () => {
  console.log(`Node running on http://localhost:${PORT}`);
});
