import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Clairvoyant } from 'clairvoyant-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS with exposed Clairvoyant latency headers
app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Clairvoyant', 'X-Clairvoyant-Saved-Ms']
}));

app.use(express.json());

// 🔮 Register Clairvoyant Predictive Negative-Latency Middleware
app.use(
  Clairvoyant.observe({
    confidenceThreshold: 0.60, // Minimum 60% probability to trigger background pre-fetch
    minSamples: 3,             // Wait for 3 transitions before emitting predictions
    maxCacheSize: 500,         // Maximum O(1) LRU cached responses in RAM
    ttlMs: 20000,              // 20s TTL for pre-fetched responses
    debug: true,               // Print ANSI telemetry in console
    port: PORT                 // Port for loopback pre-fetch
  })
);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// Simulated Database latency helper (160ms PostgreSQL query delay)
const simulateDbQuery = (ms: number = 160): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// In-memory workspace notifications state
interface NotificationItem {
  id: string;
  type: 'mention' | 'alert' | 'deployment';
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_001',
    type: 'mention',
    author: 'Elena Rostova (Staff SRE)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
    message: '@team Production ingress router latency dropped to 1.2ms following Clairvoyant cache deployment.',
    timestamp: '2m ago',
    read: false
  },
  {
    id: 'notif_002',
    type: 'deployment',
    author: 'GitHub Actions CI/CD',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop&crop=faces',
    message: 'Pipeline #4892 deployed to us-east-1: "nexus-workspace-api:v2.4.0 (green build)".',
    timestamp: '8m ago',
    read: false
  },
  {
    id: 'notif_003',
    type: 'alert',
    author: 'Prometheus Alertmanager',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=64&h=64&fit=crop&crop=faces',
    message: 'Database query load reduced by 84.6% after predictive pre-fetching enabled.',
    timestamp: '18m ago',
    read: false
  }
];

let workspaceNotifications: NotificationItem[] = JSON.parse(JSON.stringify(initialNotifications));

// ==========================================
// 1. GET /api/workspace/overview
// ==========================================
app.get('/api/workspace/overview', async (_req: Request, res: Response) => {
  await simulateDbQuery(160);

  res.json({
    workspace: {
      id: 'ws_nexus_enterprise_01',
      name: 'Nexus Cloud Infrastructure',
      tier: 'Enterprise Dedicated',
      region: 'us-east-1'
    },
    sprint: {
      name: 'Sprint 42 — Predictive Edge Optimization',
      velocity: {
        targetPoints: 85,
        completedPoints: 68,
        burndownPercent: 80.0,
        cycleTimeDays: 2.4
      },
      daysRemaining: 3
    },
    serverHealth: {
      status: 'healthy',
      clusterUptime: '99.98%',
      activeNodes: 24,
      cpuUsage: '34.2%',
      memoryUsage: '48.7%',
      kubernetesPods: 142
    },
    team: {
      activeMembers: 18,
      onCallLead: 'Elena Rostova',
      openPullRequests: 7,
      incidentCount24h: 0
    },
    simulatedLatencyMs: 160,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. GET /api/workspace/notifications
// ==========================================
app.get('/api/workspace/notifications', async (_req: Request, res: Response) => {
  await simulateDbQuery(160);

  const unreadCount = workspaceNotifications.filter((n) => !n.read).length;

  res.json({
    unreadCount,
    alerts: workspaceNotifications,
    recentDeployments: [
      { service: 'nexus-auth-service', version: 'v3.1.2', status: 'deployed', duration: '42s' },
      { service: 'edge-predictive-router', version: 'v1.0.0', status: 'deployed', duration: '1m 08s' },
      { service: 'telemetry-collector', version: 'v2.0.4', status: 'deployed', duration: '51s' }
    ],
    simulatedLatencyMs: 160,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 3. GET /api/workspace/analytics
// ==========================================
app.get('/api/workspace/analytics', async (_req: Request, res: Response) => {
  await simulateDbQuery(160);

  res.json({
    timeRange: 'Last 24 Hours',
    aggregateMetrics: {
      totalRequests: 18452091,
      avgRps: 213.5,
      p95Latency: '18.4ms',
      p99Latency: '42.1ms',
      globalErrorRate: '0.012%'
    },
    timeSeries: [
      { timestamp: '08:00', throughput: 1240, errorRate: 0.008, p95Ms: 14.2 },
      { timestamp: '10:00', throughput: 2890, errorRate: 0.011, p95Ms: 16.5 },
      { timestamp: '12:00', throughput: 4120, errorRate: 0.015, p95Ms: 19.8 },
      { timestamp: '14:00', throughput: 3950, errorRate: 0.013, p95Ms: 18.2 },
      { timestamp: '16:00', throughput: 3210, errorRate: 0.009, p95Ms: 15.1 },
      { timestamp: '18:00', throughput: 2150, errorRate: 0.007, p95Ms: 13.9 }
    ],
    breakdownByRoute: [
      { route: '/api/workspace/overview', calls: 482010, predictiveHitRate: '88.4%' },
      { route: '/api/workspace/notifications', calls: 391402, predictiveHitRate: '92.1%' },
      { route: '/api/workspace/analytics', calls: 210940, predictiveHitRate: '84.7%' }
    ],
    simulatedLatencyMs: 160,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 4. POST /api/workspace/notifications/clear
// ==========================================
app.post('/api/workspace/notifications/clear', async (_req: Request, res: Response) => {
  // State-mutating operation
  await simulateDbQuery(40);

  const previousCount = workspaceNotifications.filter((n) => !n.read).length;
  workspaceNotifications = workspaceNotifications.map((n) => ({ ...n, read: true }));

  res.json({
    success: true,
    message: 'All unread notifications cleared. Clairvoyant automatically purged the client predictive cache.',
    clearedCount: previousCount,
    unreadRemaining: 0,
    simulatedLatencyMs: 40,
    timestamp: new Date().toISOString()
  });
});

// Helper endpoint to reset notifications back to unread for demo re-runs
app.post('/api/workspace/notifications/reset', async (_req: Request, res: Response) => {
  await simulateDbQuery(20);
  workspaceNotifications = JSON.parse(JSON.stringify(initialNotifications));
  res.json({
    success: true,
    message: 'Notifications re-populated for demonstration.',
    unreadCount: workspaceNotifications.length,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 5. GET /api/clairvoyant-status
// ==========================================
app.get('/api/clairvoyant-status', (_req: Request, res: Response) => {
  res.json(Clairvoyant.getStats());
});

// Root route fallback to serve frontend dashboard
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Nexus Workspace API listening at http://localhost:${PORT}`);
  console.log(`🔮 clairvoyant-js predictive negative-latency active`);
  console.log(`📊 Open dashboard at: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
