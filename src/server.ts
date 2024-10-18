import express, { Request, Response, RequestHandler } from "express";
import path from "path";
import axios from "axios";
import MiloLRUCache from "./lib/miloDB";
import Snapshot from "./lib/snapshot";
import ConsistentHashing from "./lib/consistentHashing";
import Heartbeat from "./lib/heartbeat";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const isTestEnv = process.env.NODE_ENV === "test";
const nodes = isTestEnv
  ? [`http://localhost:${PORT}`]
  : ["http://localhost:3001", "http://localhost:3002", "http://localhost:3003"];

const snapshot = new Snapshot(path.join(__dirname, "cache_snapshot.json"));

// Initialize MiloLRUCache with a capacity of 100 items
const cache = new MiloLRUCache<string, string>(100);

// Load snapshot into cache
const loadedCache = snapshot.load();
Object.keys(loadedCache).forEach((key) => cache.set(key, loadedCache[key]));

const ch = new ConsistentHashing(2);
nodes.forEach((node) => ch.addNode(node));

// Heartbeat mechanism
const heartbeat = new Heartbeat(nodes);

// Periodic Snapshot Saving (Every 60 seconds)
setInterval(() => {
  snapshot.save(cache.entriesWithExpiry());
}, 60000);

// Heartbeat Endpoint
app.get("/heartbeat", (req: Request, res: Response) => {
  res.json({ alive: true });
});

// GET: Retrieve value by key
const getHandler: RequestHandler<{ key: string }> = async (req, res) => {
  const key = req.params.key;
  const responsibleNodes = ch.getNodes(key);
  let foundValue = false;

  for (const node of responsibleNodes) {
    if (node === `http://localhost:${PORT}`) {
      const value = cache.get(key);
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

// POST: Set value with optional TTL
app.post("/set", async (req: Request, res: Response) => {
  const { key, value, ttl } = req.body;
  const responsibleNodes = ch.getNodes(key);

  for (const node of responsibleNodes) {
    if (node === `http://localhost:${PORT}`) {
      cache.set(key, value, ttl); // Set value with TTL if provided
    } else if (!heartbeat.getFailedNodes().includes(node)) {
      try {
        await axios.post(`${node}/set`, { key, value, ttl });
      } catch (err) {
        console.error(`Failed to set on ${node}`);
      }
    }
  }

  res.json({ success: true });
});

// DELETE: Delete a key
app.delete("/delete/:key", async (req: Request, res: Response) => {
  const key = req.params.key;
  const responsibleNodes = ch.getNodes(key);
  let responseSent = false;

  for (const node of responsibleNodes) {
    if (node === `http://localhost:${PORT}`) {
      const success = cache.delete(key);
      if (success) {
        if (!responseSent) {
          res.json({ success: true });
          responseSent = true;
        }
      } else {
        if (!responseSent) {
          res.status(404).json({ error: "Key not found" });
          responseSent = true;
        }
      }
    } else if (!heartbeat.getFailedNodes().includes(node)) {
      try {
        await axios.delete(`${node}/delete/${key}`);
        if (!responseSent) {
          res.json({ success: true });
          responseSent = true;
        }
      } catch (err) {
        console.error(`Failed to delete on ${node}`);
        if (!responseSent) {
          res.status(500).json({ error: `Failed to delete on ${node}` });
          responseSent = true;
        }
      }
    }

    if (responseSent) break; // Ensure the response is only sent once
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Node running on http://localhost:${PORT}`);
  });
}

export default app;
