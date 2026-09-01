import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getCoordinates } from "../data/geoCoordinates";

interface GeoMonitoringProps {
  onNavigate: (page: any, data?: any) => void;
}

const RISK_COLOR: Record<string, string> = {
  Critical: "#DC2626",
  High: "#EA580C",
  Medium: "#D97706",
  Low: "#15803D",
};

const CENTER: [number, number] = [20.5937, 78.9629]; // India center

export function GeoMonitoring({ onNavigate }: GeoMonitoringProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  }, []);

  // Compute map markers with coordinates
  const markers = useMemo(() => {
    return projects
      .filter(p => filter === "All" || p.risk_category === filter)
      .map(p => {
        const coords = getCoordinates(p.state, p.constituency);
        return {
          ...p,
          lat: coords.lat,
          lng: coords.lng
        };
      });
  }, [projects, filter]);

  // Compute state summaries for the right panel
  const stateSummaries = useMemo(() => {
    const counts: Record<string, { total: number; highRisk: number }> = {};
    projects.forEach(p => {
      const state = p.state || "Unknown";
      if (!counts[state]) counts[state] = { total: 0, highRisk: 0 };
      counts[state].total++;
      if (p.risk_category === "High" || p.risk_category === "Critical") {
        counts[state].highRisk++;
      }
    });
    return Object.entries(counts)
      .map(([state, stats]) => ({
        label: state,
        projects: stats.total,
        risk: stats.highRisk > 10 ? "High" : stats.highRisk > 0 ? "Medium" : "Low"
      }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 8); // Top 8 states
  }, [projects]);

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#1B3A6B", margin: 0 }}>Geo-Spatial Project Monitoring</h1>
        <div style={{ fontSize: "12px", color: "#6B7480", marginTop: "2px" }}>Interactive map of MPLAD project locations with risk markers | FY 2025–26</div>
      </div>

      {/* Filter + Legend bar */}
      <div style={{ background: "#fff", border: "1px solid #E2E5EA", borderRadius: "3px", padding: "10px 14px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#3A4050" }}>Filter by Risk:</span>
          {["All", "Critical", "High", "Medium", "Low"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "4px 10px", border: `1px solid ${filter === f ? RISK_COLOR[f] || "#1B3A6B" : "#D0D5DD"}`, borderRadius: "3px", background: filter === f ? (RISK_COLOR[f] || "#1B3A6B") : "#fff", color: filter === f ? "#fff" : "#3A4050", fontSize: "11px", fontWeight: filter === f ? 700 : 400, cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {Object.entries(RISK_COLOR).map(([k, v]) => (
            <span key={k} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: v, display: "inline-block" }} />
              {k}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "14px" }}>
        {/* Leaflet Map with Google Tiles */}
        <div style={{ background: "#fff", border: "1px solid #E2E5EA", borderRadius: "3px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #E2E5EA", fontSize: "13px", fontWeight: 700, color: "#1A1D23", display: "flex", justifyContent: "space-between" }}>
            <span>India — Interactive Map Distribution</span>
            <span style={{ fontSize: "11px", color: "#9AA3B0", fontWeight: 400 }}>Click a marker to view details</span>
          </div>
          
          <div style={{ height: "520px", width: "100%", position: "relative", zIndex: 0 }}>
            <MapContainer center={CENTER} zoom={5} style={{ height: "100%", width: "100%" }}>
              {/* Google Maps Road Map Tile Layer */}
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps"
              />
              {markers.map(m => (
                <CircleMarker
                  key={m.id}
                  center={[m.lat, m.lng]}
                  radius={selectedProject?.id === m.id ? 10 : 6}
                  fillColor={RISK_COLOR[m.risk_category] || "#1A1D23"}
                  color="#fff"
                  weight={selectedProject?.id === m.id ? 2 : 1}
                  fillOpacity={0.9}
                  eventHandlers={{
                    click: () => setSelectedProject(m)
                  }}
                >
                  <Tooltip>
                    <div style={{ padding: "2px", minWidth: "150px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px", color: "#1B3A6B" }}>
                        {m.work_category}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6B7480", marginBottom: "6px" }}>
                        {m.constituency}, {m.state}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", borderTop: "1px solid #eee", paddingTop: "4px" }}>
                        <span>Risk:</span>
                        <strong style={{ color: RISK_COLOR[m.risk_category] }}>
                          {m.risk_category}
                        </strong>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Selected project panel */}
          <div style={{ background: "#fff", border: "1px solid #E2E5EA", borderRadius: "3px", padding: "14px", minHeight: "200px" }}>
            {selectedProject ? (
              <>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1B3A6B", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Selected Project Details</div>
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1B3A6B", fontWeight: 700, marginBottom: "4px" }}>{selectedProject.id}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A1D23", marginBottom: "8px", wordBreak: "break-word" }}>{selectedProject.work_category}</div>
                {[
                  { label: "Location", value: `${selectedProject.constituency}, ${selectedProject.state}` },
                  { label: "Status", value: selectedProject.work_status },
                  { label: "AI Risk Score", value: `${Math.floor(selectedProject.risk_score)}/100` },
                  { label: "Risk Level", value: selectedProject.risk_category },
                  { label: "Cost Variance", value: selectedProject.cost_deviation_pct ? `${selectedProject.cost_deviation_pct}%` : "0%" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "5px 0", borderBottom: "1px solid #F7F8FA" }}>
                    <span style={{ color: "#9AA3B0" }}>{r.label}</span>
                    <span style={{ fontWeight: 500, color: "#1A1D23", textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                  <button onClick={() => onNavigate("project-detail", selectedProject)} style={{ flex: 1, padding: "6px", background: "#1B3A6B", color: "#fff", border: "none", borderRadius: "3px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Full Analysis</button>
                  <button onClick={() => setSelectedProject(null)} style={{ padding: "6px 10px", background: "#fff", border: "1px solid #D0D5DD", borderRadius: "3px", fontSize: "11px", cursor: "pointer" }}>×</button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", color: "#9AA3B0", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📍</div>
                <div style={{ fontSize: "12px" }}>Click a map marker to view project details</div>
              </div>
            )}
          </div>

          {/* State Summary */}
          <div style={{ background: "#fff", border: "1px solid #E2E5EA", borderRadius: "3px", padding: "14px", flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#3A4050", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Top Active States</div>
            {stateSummaries.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #F7F8FA", fontSize: "11px" }}>
                <span style={{ color: "#3A4050", fontWeight: 500, textTransform: "capitalize" }}>{s.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#9AA3B0" }}>{s.projects} works</span>
                  <span style={{ background: s.risk === "High" ? "#FFEDD5" : s.risk === "Medium" ? "#FEF3C7" : "#DCFCE7", color: s.risk === "High" ? "#EA580C" : s.risk === "Medium" ? "#D97706" : "#15803D", padding: "1px 5px", borderRadius: "3px", fontSize: "10px", fontWeight: 700 }}>{s.risk} Risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
