import { useState } from "react";
import { useTranslation } from 'react-i18next';

type Page = "dashboard" | "projects" | "project-detail" | "ai-risk" | "fraud-alerts" | "geo-monitoring" | "financial" | "vendors" | "reports" | "audit-trail";

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page, data?: any) => void;
  children: React.ReactNode;
  breadcrumb: { label: string; page?: Page }[];
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "projects", label: "Projects", icon: "📋" },
  { id: "ai-risk", label: "AI Risk Monitoring", icon: "🔍" },
  { id: "fraud-alerts", label: "Alerts & Investigations", icon: "⚠" },
  { id: "financial", label: "Financial Monitoring", icon: "₹" },
  { id: "geo-monitoring", label: "Geo-Spatial Monitoring", icon: "🗺" },
  { id: "vendors", label: "Vendors & Beneficiaries", icon: "🏢" },
  { id: "reports", label: "Reports", icon: "📊" },
  { id: "audit-trail", label: "Audit Trail", icon: "📜" },
];

export function Layout({ currentPage, onNavigate, children, breadcrumb }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const langHindi = i18n.language === 'hi';

  const getModalContent = (title: string) => {
    switch(title) {
      case t('layout.footer_accessibility'):
        return "The Vigilant-MPLAD portal is fully compliant with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. If you experience any accessibility barriers, please contact the support desk.";
      case t('layout.footer_privacy'):
        return "This application collects and processes government data strictly for official monitoring purposes. Unauthorized access or data exfiltration is strictly prohibited under the Information Technology Act, 2000.";
      case t('layout.footer_terms'):
        return "By accessing this portal, you agree to adhere to the National Data Sharing and Accessibility Policy (NDSAP). All project risk scores and AI anomalies are confidential and for internal departmental use only.";
      case t('layout.footer_contact'):
        return "For technical support, please contact the NIC Helpdesk at support-mplad@nic.in or call 1800-111-555 (Toll-Free). Available Mon-Fri, 9:00 AM to 6:00 PM IST.";
      case "Help":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><strong>User Guide:</strong> Please refer to the official MPLADS Portal Handbook for detailed instructions on navigating dashboards, downloading reports, and analyzing project risk markers.</div>
            <div><strong>FAQ:</strong> <br/>- <em>How is AI Risk computed?</em> Risk is assessed based on cost overrun, delay, and anomalous vendor behavior using machine learning.<br/>- <em>Can I export data?</em> Yes, use the 'Export PDF/CSV' button available on specific report pages.</div>
            <div><strong>Support:</strong> If you face persistent issues or incorrect data mapping, raise a ticket via the grievance redressal module or email support-mplad@nic.in.</div>
          </div>
        );
      default:
        return "Information not available.";
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Noto Sans', system-ui, sans-serif" }}>
      {/* Top strip */}
      <div style={{ background: "#0F2244", color: "#fff", fontSize: "12px", padding: "4px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{t('layout.gov_of_india')}</span>
        <span>{t('layout.last_updated')} | {t('layout.data_refreshed')} | <span style={{ color: "#86efac" }}>● {t('layout.system_status')}</span></span>
      </div>

      {/* Main header */}
      <header style={{ background: "#1B3A6B", color: "#fff", borderBottom: "3px solid #F97316", padding: "0 16px", display: "flex", alignItems: "center", height: "64px", flexShrink: 0 }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="#F97316" stroke="#1B3A6B" strokeWidth="2"/>
              <circle cx="50" cy="50" r="38" fill="#fff" stroke="#1B3A6B" strokeWidth="1.5"/>
              <text x="50" y="56" textAnchor="middle" fontSize="22" fill="#1B3A6B" fontWeight="bold">🦁</text>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11px", opacity: 0.85, letterSpacing: "0.05em" }}>{t('layout.title_gov')}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.2 }}>{t('layout.title_main')}</div>
            <div style={{ fontSize: "10px", opacity: 0.75 }}>{t('layout.title_sub')}</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.25)", height: "36px", margin: "0 8px" }} />
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", padding: "4px 6px", borderRadius: "4px", opacity: 0.8 }} title="Toggle Sidebar">☰</button>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button onClick={() => setActiveModal(t('layout.footer_accessibility'))} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "11px", padding: "4px 8px", borderRadius: "3px", opacity: 0.85, display: "flex", alignItems: "center", gap: "4px" }} title="Accessibility">
            <span>♿</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.12)", borderRadius: "3px", overflow: "hidden", fontSize: "11px" }}>
            <button onClick={() => i18n.changeLanguage('en')} style={{ background: !langHindi ? "rgba(255,255,255,0.25)" : "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 8px", fontWeight: !langHindi ? 700 : 400 }}>English</button>
            <button onClick={() => i18n.changeLanguage('hi')} style={{ background: langHindi ? "rgba(255,255,255,0.25)" : "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 8px", fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: langHindi ? 700 : 400 }}>हिंदी</button>
          </div>
          <button onClick={() => setActiveModal("Help")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "11px", padding: "4px 8px", opacity: 0.85 }}>Help</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setProfileOpen(!profileOpen); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "6px 10px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>RK</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "11px", fontWeight: 600 }}>R.K. Sharma</div>
                <div style={{ fontSize: "10px", opacity: 0.75 }}>{t('layout.role_officer')}</div>
              </div>
              <span style={{ fontSize: "10px", opacity: 0.7 }}>▼</span>
            </button>
            {profileOpen && (
              <div style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #D0D5DD", borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", width: "200px", zIndex: 1000, color: "#1A1D23" }}>
                {[t('layout.profile'), t('layout.change_password'), t('layout.preferences'), "─────────", t('layout.sign_out')].map((item, i) => (
                  <button key={i} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", background: "none", border: "none", cursor: item === "─────────" ? "default" : "pointer", fontSize: "13px", color: item === t('layout.sign_out') ? "#DC2626" : item === "─────────" ? "#D0D5DD" : "#1A1D23", borderBottom: i === 3 ? "1px solid #F0F1F4" : "none" }}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside style={{ width: sidebarCollapsed ? "52px" : "220px", background: "#1A2B45", color: "#fff", flexShrink: 0, overflow: "hidden", transition: "width 0.2s", display: "flex", flexDirection: "column" }}>
          <nav style={{ flex: 1, paddingTop: "8px", overflowY: "auto" }}>
            {NAV_ITEMS.map(item => {
              const active = currentPage === item.id || (currentPage === "project-detail" && item.id === "projects");
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as Page)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 14px", background: active ? "#1B3A6B" : "none", border: "none", borderLeft: active ? "3px solid #F97316" : "3px solid transparent", cursor: "pointer", color: active ? "#fff" : "rgba(255,255,255,0.7)", fontSize: "13px", textAlign: "left", transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                  title={item.label}
                >
                  <span style={{ fontSize: "14px", width: "20px", textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  {!sidebarCollapsed && <span style={{ whiteSpace: "nowrap", fontWeight: active ? 600 : 400 }}>{t(`layout.nav_${item.id.replace('-', '')}`)}</span>}
                  {!sidebarCollapsed && item.id === "fraud-alerts" && (
                    <span style={{ marginLeft: "auto", background: "#EA580C", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", fontWeight: 700 }}>8</span>
                  )}
                </button>
              );
            })}
          </nav>
          {!sidebarCollapsed && (
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
              <div>{t('layout.version')}</div>
              <div>{t('layout.copyright')}</div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: "auto", background: "#F7F8FA", display: "flex", flexDirection: "column" }}>
          {/* Breadcrumb */}
          <div style={{ background: "#fff", borderBottom: "1px solid #E2E5EA", padding: "8px 20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6B7480", flexShrink: 0 }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: "#C8CDD6" }}>/</span>}
                {crumb.page ? (
                  <button onClick={() => onNavigate(crumb.page!)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1B3A6B", fontSize: "12px", fontWeight: 500, padding: 0 }}>{crumb.label}</button>
                ) : (
                  <span style={{ color: i === breadcrumb.length - 1 ? "#1A1D23" : "#6B7480", fontWeight: i === breadcrumb.length - 1 ? 500 : 400 }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          
          <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
            {children}
          </div>

          {/* Footer */}
          <footer style={{ background: "#0F2244", color: "rgba(255,255,255,0.6)", fontSize: "11px", padding: "8px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", flexShrink: 0, borderTop: "2px solid #1B3A6B" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              {[t('layout.footer_accessibility'), t('layout.footer_privacy'), t('layout.footer_terms'), t('layout.footer_contact')].map(l => (
                <button key={l} onClick={() => setActiveModal(l)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "11px", fontWeight: 500 }}>{l}</button>
              ))}
            </div>
          </footer>
        </main>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div style={{ background: "#fff", width: "450px", borderRadius: "6px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E5EA", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8F9FA" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A6B", margin: 0 }}>{activeModal}</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: "20px", color: "#6B7480", cursor: "pointer", padding: "0 4px" }}>&times;</button>
            </div>
            <div style={{ padding: "24px 20px", fontSize: "13px", color: "#3A4050", lineHeight: 1.6 }}>
              {getModalContent(activeModal)}
            </div>
            <div style={{ padding: "12px 20px", background: "#F8F9FA", borderTop: "1px solid #E2E5EA", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setActiveModal(null)} style={{ padding: "8px 16px", background: "#1B3A6B", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
