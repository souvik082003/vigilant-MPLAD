import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API: Get Projects
app.get('/api/projects', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM projects LIMIT 100');
    
    // Map to the shape expected by the frontend
    const projects = rows.map(r => ({
      id: r.work_id,
      name: r.work_category, // Assuming work category since name isn't there
      mp: r.mp_name,
      constituency: r.constituency,
      district: r.constituency, // using constituency as district
      state: r.state,
      category: r.work_category,
      approved: r.sanction_amount / 100000, // mock conversion to Lakhs
      utilized: (r.sanction_amount * (r.utilization_pct_completed || 0) / 100) / 100000,
      completion: r.utilization_pct_completed || 0,
      status: r.work_status,
      risk: r.risk_score || 0,
      riskLevel: r.risk_category || 'Low',
      lastUpdated: new Date().toLocaleDateString(),
      agency: "State Dept", // mock
      vendor: "Vendor Ltd", // mock
      startDate: "2024-01-01", // mock
      expectedCompletion: "2026-12-31", // mock
    }));

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const db = await getDb();
    const stateSummaries = await db.all('SELECT * FROM state_summaries');
    
    let totalProjects = 0;
    let totalSanctioned = 0;
    stateSummaries.forEach(s => {
      totalProjects += s.total_works;
      totalSanctioned += s.total_sanctioned_amount;
    });

    res.json({
      totalProjects,
      totalPayments: totalSanctioned / 10000000, // to Crores
      avgCost: (totalSanctioned / totalProjects) / 100000, // to Lakhs
      activeAlerts: Math.floor(totalProjects * 0.05), // mock
      resolvedAlerts: Math.floor(totalProjects * 0.03), // mock
      highRiskProjects: Math.floor(totalProjects * 0.1), // mock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Alerts (derived from high risk projects)
app.get('/api/alerts', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM projects WHERE risk_category = 'High' OR risk_category = 'Critical' LIMIT 20");
    
    const alerts = rows.map((r, i) => ({
      id: `ALT-${2026}-${i.toString().padStart(4, '0')}`,
      severity: r.risk_category,
      project: r.work_id,
      projectName: r.work_category,
      amount: `₹${(r.sanction_amount / 100000).toFixed(1)} L`,
      anomaly: "High Risk Flags Detected",
      confidence: Math.floor(r.risk_score) || 85,
      date: new Date().toLocaleDateString(),
      status: "Pending Verification",
      district: r.constituency,
      description: `Analysis identified this project as ${r.risk_category} risk with score ${r.risk_score}.`,
    }));
    
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generative/Mock endpoints derived dynamically from real Projects data
app.get('/api/vendors', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT constituency, state, COUNT(*) as projects, SUM(sanction_amount) as totalPayments, AVG(risk_score) as risk 
      FROM projects 
      WHERE constituency IS NOT NULL 
      GROUP BY constituency, state 
      ORDER BY totalPayments DESC LIMIT 50
    `);
    const vendors = rows.map((r, i) => ({
      id: `VND-${i.toString().padStart(3, '0')}`,
      name: `M/s ${r.constituency.split(' ')[0]} Constructions`,
      regId: `CIN-U45201${r.state.substring(0,2).toUpperCase()}2018PTC${Math.floor(100000 + Math.random() * 900000)}`,
      projects: r.projects,
      totalPayments: (r.totalPayments / 10000000).toFixed(2), // Crores
      avgCost: ((r.totalPayments / r.projects) / 100000).toFixed(2), // Lakhs
      risk: Math.floor(r.risk),
      anomalies: r.risk > 70 ? Math.floor(r.projects * 0.2) : 0,
      state: r.state,
      status: r.risk > 80 ? "Flagged" : "Active"
    }));
    res.json(vendors);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM projects ORDER BY RANDOM() LIMIT 50");
    const txns = rows.map((r, i) => ({
      id: `TXN-${i.toString().padStart(4, '0')}`,
      projectId: r.work_id,
      vendor: `M/s ${r.constituency?.split(' ')[0] || 'State'} Corp`,
      amount: (r.sanction_amount / 100000).toFixed(1), // Lakhs
      date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
      expectedRange: r.cost_deviation_pct ? `${Math.max(0, 100 - r.cost_deviation_pct)}-100` : "90-100",
      deviation: r.cost_deviation_pct ? `+${r.cost_deviation_pct}%` : "0%",
      flag: r.risk_category === "Critical" ? "HIGH" : r.risk_category === "High" ? "MEDIUM" : "LOW",
      type: "Works Payment"
    }));
    res.json(txns);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.get('/api/audit-log', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM projects WHERE risk_category IN ('High', 'Critical') LIMIT 50");
    const logs = rows.map((r) => ({
      timestamp: new Date(Date.now() - Math.random() * 5000000000).toLocaleString(),
      user: "AI Risk Engine",
      role: "System",
      action: "Flagged Anomaly",
      module: "Risk Intelligence",
      project: r.work_id,
      oldValue: "Normal",
      newValue: r.risk_category,
      ip: "10.0.0.1"
    }));
    res.json(logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.get('/api/dashboard/monthly', async (req, res) => {
  try {
    const db = await getDb();
    const { total, sanctioned } = await db.get("SELECT COUNT(*) as total, SUM(sanction_amount) as sanctioned FROM projects");
    const sCrores = sanctioned / 10000000;
    res.json([
      { month: "Mar '26", allocated: Math.floor(sCrores * 0.1), utilized: Math.floor(sCrores * 0.08), projects: Math.floor(total * 0.1) },
      { month: "Apr '26", allocated: Math.floor(sCrores * 0.15), utilized: Math.floor(sCrores * 0.12), projects: Math.floor(total * 0.15) },
      { month: "May '26", allocated: Math.floor(sCrores * 0.2), utilized: Math.floor(sCrores * 0.18), projects: Math.floor(total * 0.2) },
      { month: "Jun '26", allocated: Math.floor(sCrores * 0.3), utilized: Math.floor(sCrores * 0.25), projects: Math.floor(total * 0.3) },
      { month: "Jul '26", allocated: Math.floor(sCrores * 0.15), utilized: Math.floor(sCrores * 0.12), projects: Math.floor(total * 0.15) },
      { month: "Aug '26", allocated: Math.floor(sCrores * 0.1), utilized: Math.floor(sCrores * 0.09), projects: Math.floor(total * 0.1) },
    ]);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.get('/api/dashboard/district-risk', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT constituency as district, 
             SUM(CASE WHEN risk_category = 'Critical' OR risk_category = 'High' THEN 1 ELSE 0 END) as high,
             SUM(CASE WHEN risk_category = 'Medium' THEN 1 ELSE 0 END) as medium,
             SUM(CASE WHEN risk_category = 'Low' THEN 1 ELSE 0 END) as low,
             COUNT(*) as total
      FROM projects
      WHERE constituency IS NOT NULL
      GROUP BY constituency
      ORDER BY high DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.get('/api/dashboard/risk-trend', async (req, res) => {
  try {
    const db = await getDb();
    const { critical, high, medium, low } = await db.get(`
      SELECT 
        SUM(CASE WHEN risk_category = 'Critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN risk_category = 'High' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN risk_category = 'Medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN risk_category = 'Low' THEN 1 ELSE 0 END) as low
      FROM projects
    `);
    res.json([
      { month: "Mar", critical: Math.floor(critical*0.1), high: Math.floor(high*0.1), medium: Math.floor(medium*0.1), low: Math.floor(low*0.1) },
      { month: "Apr", critical: Math.floor(critical*0.15), high: Math.floor(high*0.15), medium: Math.floor(medium*0.15), low: Math.floor(low*0.15) },
      { month: "May", critical: Math.floor(critical*0.2), high: Math.floor(high*0.2), medium: Math.floor(medium*0.2), low: Math.floor(low*0.2) },
      { month: "Jun", critical: Math.floor(critical*0.3), high: Math.floor(high*0.3), medium: Math.floor(medium*0.3), low: Math.floor(low*0.3) },
      { month: "Jul", critical: Math.floor(critical*0.15), high: Math.floor(high*0.15), medium: Math.floor(medium*0.15), low: Math.floor(low*0.15) },
      { month: "Aug", critical: Math.floor(critical*0.1), high: Math.floor(high*0.1), medium: Math.floor(medium*0.1), low: Math.floor(low*0.1) },
    ]);
  } catch (err) { res.status(500).json({error: err.message}); }
});

// Serve React App in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Catch-all route for SPA navigation (Express 5 compatible)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
});
