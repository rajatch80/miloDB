import Heartbeat from "../../src/lib/heartbeat";
import axios from "axios";

jest.mock("axios");

describe("Heartbeat", () => {
  let heartbeat: Heartbeat;
  const nodes = ["http://localhost:3001", "http://localhost:3002"];

  beforeEach(() => {
    heartbeat = new Heartbeat(nodes, 5000);
    jest.clearAllMocks();
  });

  it("should mark nodes as failed if they do not respond", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Node down"));
    await new Promise((r) => setTimeout(r, 5100)); // Wait for heartbeat interval
    expect(heartbeat.getFailedNodes()).toContain("http://localhost:3001");
  });

  it("should not mark nodes as failed if they respond", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { alive: true } });
    await new Promise((r) => setTimeout(r, 5100));
    expect(heartbeat.getFailedNodes()).not.toContain("http://localhost:3001");
  });
});
