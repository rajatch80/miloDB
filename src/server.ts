import express, { Request, Response, RequestHandler } from "express";
import axios from "axios";
import ConsistentHashing from "./lib/consistentHashing";
import Heartbeat from "./lib/heartbeat";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const isTestEnv = process.env.NODE_ENV === "test";
const nodes = isTestEnv
  ? [`http://localhost:${PORT}`] // In test environment, run as a single node
  : ["http://localhost:3001", "http://localhost:3002", "http://localhost:3003"]; // Actual node list for non-test

// Set up consistent hashing with replication
const ch = new ConsistentHashing(2);
nodes.forEach((node) => ch.addNode(node));

// Set up heartbeat mechanism to detect node failures
const heartbeat = new Heartbeat(nodes);

const cache: { [key: string]: string } = {};

// Heartbeat endpoint to check node health
app.get("/heartbeat", (req: Request, res: Response) => {
  res.json({ alive: true });
});

// GET: Retrieve a value by key
const getHandler: RequestHandler<{ key: string }> = async (req, res) => {
  const key = req.params.key;
  const responsibleNodes = ch.getNodes(key);

  let foundValue = false;

  // Try the primary node first
  for (const node of responsibleNodes) {
    if (node === `http://localhost:${PORT}`) {
      const value = cache[key] || null;
      if (value !== null) {
        res.json({ value });
        foundValue = true;
        return;
      }
    } else if (!heartbeat.getFailedNodes().includes(node)) {
      try {
        const response = await axios.get(`${node}/get/${key}`);
        if (response.data.value !== null) {
          res.json(response.data);
          foundValue = true;
          return;
        }
      } catch (err) {
        console.error(`Failed to get from ${node}`);
      }
    }
  }

  if (!foundValue) {
    res.status(404).json({ error: "Key not found" });
  }
};

// Use the defined handler
app.get("/get/:key", getHandler);

// POST: Set a value
app.post("/set", async (req: Request, res: Response) => {
  const { key, value } = req.body;
  const responsibleNodes = ch.getNodes(key);

  for (const node of responsibleNodes) {
    if (node === `http://localhost:${PORT}`) {
      cache[key] = value;
    } else if (!heartbeat.getFailedNodes().includes(node)) {
      try {
        await axios.post(`${node}/set`, { key, value });
      } catch (err) {
        console.error(`Failed to set on ${node}`);
      }
    }
  }

  res.json({ success: true });
});

export default app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Node running on http://localhost:${PORT}`);
  });
}
