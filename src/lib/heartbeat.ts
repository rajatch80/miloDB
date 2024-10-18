import axios from "axios";

class Heartbeat {
  private nodes: string[];
  private interval: number;
  private failedNodes: Set<string>;

  constructor(nodes: string[], interval = 5000) {
    // Check every 5 seconds
    this.nodes = nodes;
    this.interval = interval;
    this.failedNodes = new Set();
    this.startHeartbeat();
  }

  // Periodically ping other nodes to check if they are alive
  private startHeartbeat() {
    setInterval(() => {
      this.nodes.forEach((node) => {
        axios
          .get(`${node}/heartbeat`)
          .then(() => {
            // Node is alive, remove from failed set if it was marked
            this.failedNodes.delete(node);
          })
          .catch(() => {
            // Node failed to respond, mark as down
            console.error(`${node} is down`);
            this.failedNodes.add(node);
          });
      });
    }, this.interval);
  }

  // Get a list of currently down nodes
  getFailedNodes(): string[] {
    return Array.from(this.failedNodes);
  }
}

export default Heartbeat;
