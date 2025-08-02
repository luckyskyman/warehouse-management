import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = (message: string) => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${formattedTime} [express] ${message}`);
};

const app = express();

// Enable CORS for all requests with more permissive settings
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 대용량 엑셀 파일 처리를 위해 요청 크기 제한 증가 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Serve static files from client/dist if available
  const staticPath = path.join(__dirname, '../client/dist');
  app.use(express.static(staticPath));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Specific route handlers for SPA
  app.get("/dashboard", (req, res) => {
    const dashboardPath = path.join(__dirname, '../client/dist/dashboard.html');
    res.sendFile(dashboardPath, (err) => {
      if (err) {
        res.status(404).send('Dashboard page not found');
      }
    });
  });

  // Serve index.html for root route
  app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.json({ 
          message: "Warehouse Management System API", 
          status: "Server running on Render",
          version: "1.0.0",
          note: "Frontend build not available",
          endpoints: {
            auth: "/api/auth",
            inventory: "/api/inventory", 
            bom: "/api/bom",
            warehouse: "/api/warehouse",
            users: "/api/users",
            workdiary: "/api/work-diary",
            files: "/api/files"
          }
        });
      }
    });
  });

  // API 404 handler
  app.get("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  // Use Render's PORT environment variable or fallback to 5000
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
