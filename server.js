// 📦 Import modules
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// 🌐 Enable CORS + JSON parsing
app.use(cors());
app.use(express.json());

// 📊 Agent Mock Data
const agents = [
  { code: "A001", name: "Ciel", status: "Available" },
  { code: "A002", name: "Jane Smith", status: "Active" },
  { code: "A003", name: "Mike Chan", status: "Not Ready" },
];

// 🏠 Root Route
app.get("/", (req, res) => {
  res.send("Hello Agent Wallboard!");
});

// 🩺 Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/agents/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    agentCount: agents.length,
    timestamp: new Date().toISOString(),
  });
});


// 📋 Get all agents
app.get("/api/agents", (req, res) => {
  res.json({
    success: true,
    data: agents,
    count: agents.length,
    timestamp: new Date().toISOString(),
  });
});

// 🔢 Get agent count only
app.get("/api/agents/count", (req, res) => {
  res.json({
    success: true,
    count: agents.length,
    timestamp: new Date().toISOString(),
  });
});


// 🔄 Change agent status
app.patch("/api/agents/:code/status", (req, res) => {
  const agentCode = req.params.code;
  const newStatus = req.body.status;

  const agent = agents.find((a) => a.code === agentCode);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  const validStatuses = [
    "Available",
    "Active",
    "Wrap Up",
    "Not Ready",
    "Offline",
  ];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const oldStatus = agent.status;
  agent.status = newStatus;

  console.log(
    `[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`
  );

  res.json({ success: true, oldStatus, newStatus });
});

// 📊 Dashboard Statistics
app.get("/api/dashboard/stats", (req, res) => {
  const total = agents.length;
  const breakdown = (status) =>
    agents.filter((a) => a.status === status).length;
  const percent = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const available = breakdown("Available");
  const active = breakdown("Active");
  const wrapUp = breakdown("Wrap Up");
  const notReady = breakdown("Not Ready");
  const offline = breakdown("Offline");

  res.json({
    success: true,
    data: {
      total,
      statusBreakdown: {
        available: { count: available, percent: percent(available) },
        active: { count: active, percent: percent(active) },
        wrapUp: { count: wrapUp, percent: percent(wrapUp) },
        notReady: { count: notReady, percent: percent(notReady) },
        offline: { count: offline, percent: percent(offline) },
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// 🔐 Agent Login
app.post("/api/agents/:code/login", (req, res) => {
  const agentCode = req.params.code;
  const { name } = req.body;

  let agent = agents.find((a) => a.code === agentCode);
  if (!agent) {
    agent = {
      code: agentCode,
      name,
      status: "Available",
      loginTime: new Date().toISOString(),
    };
    agents.push(agent);
  } else {
    agent.status = "Available";
    agent.loginTime = new Date().toISOString();
  }

  res.json({ success: true, agent });
});

// 🔓 Agent Logout
app.post("/api/agents/:code/logout", (req, res) => {
  const agentCode = req.params.code;
  const agent = agents.find((a) => a.code === agentCode);

  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  agent.status = "Offline";
  delete agent.loginTime;

  res.json({ success: true, message: "Agent logged out", agent });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
