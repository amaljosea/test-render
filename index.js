// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  gameScores;
  notes;
  currentUserId;
  currentScoreId;
  currentNoteId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.gameScores = /* @__PURE__ */ new Map();
    this.notes = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentScoreId = 1;
    this.currentNoteId = 1;
    this.initializeDefaultNotes();
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Game score methods
  async getTopScores(limit) {
    return Array.from(this.gameScores.values()).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  async addScore(insertScore) {
    const id = this.currentScoreId++;
    const score = { ...insertScore, id };
    this.gameScores.set(id, score);
    return score;
  }
  // Notes methods
  async getAllNotes() {
    return Array.from(this.notes.values());
  }
  // Initialize with default notes
  initializeDefaultNotes() {
    const defaultNotes = [
      {
        date: "2023-07-15",
        content: "The blockchain landscape is evolving faster than anticipated. Our positioning with the MicroChain architecture gives us a unique advantage in the market. The scalability solution we're implementing should address the bottlenecks that have plagued most layer-2 implementations.",
        isHighlighted: 0
      },
      {
        date: "2023-07-18",
        content: "Token economics model revision complete. The deflationary mechanism coupled with staking rewards creates the perfect balance for long-term sustainability. The board has approved the final parameters for launch.",
        isHighlighted: 0
      },
      {
        date: "2023-07-22",
        content: "Security audit is in progress. Initial feedback is positive. The novel consensus mechanism we've implemented has received particular praise. Looking forward to the public release and seeing the community's reaction.",
        isHighlighted: 0
      },
      {
        date: "2023-07-23",
        content: "UPCOMING: Major partnership announcement scheduled post-launch",
        isHighlighted: 1
      }
    ];
    defaultNotes.forEach((note) => {
      const id = this.currentNoteId++;
      const completeNote = {
        id,
        date: note.date,
        content: note.content,
        isHighlighted: note.isHighlighted ?? 0
        // Use nullish coalescing to provide a default
      };
      this.notes.set(id, completeNote);
    });
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  score: integer("score").notNull(),
  createdAt: text("created_at").notNull()
});
var notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  content: text("content").notNull(),
  isHighlighted: integer("is_highlighted").default(0)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertGameScoreSchema = createInsertSchema(gameScores).pick({
  walletAddress: true,
  score: true,
  createdAt: true
});
var insertNoteSchema = createInsertSchema(notes).pick({
  date: true,
  content: true,
  isHighlighted: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/notes", async (_req, res) => {
    try {
      const notes2 = await storage.getAllNotes();
      res.json(notes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  app2.get("/api/scores", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const scores = await storage.getTopScores(limit);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  app2.post("/api/scores", async (req, res) => {
    try {
      const validatedData = insertGameScoreSchema.parse({
        ...req.body,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      const newScore = await storage.addScore(validatedData);
      res.status(201).json(newScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add score" });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3001;
  server.listen(
    {
      port,
      host: "0.0.0.0"
      // reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
