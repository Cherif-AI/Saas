import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    background: #080F1A;
    min-height: 100vh;
    font-family: 'Syne', sans-serif;
    color: #E8E4DC;
    overflow-x: hidden;
  }

  .mono { font-family: 'JetBrains Mono', monospace; }

  /* ── HEADER ── */
  .header {
    padding: 28px 40px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .logo {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #fff;
  }
  .logo span { color: #F0A500; }
  .logo-sub {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-top: 2px;
    font-family: 'JetBrains Mono', monospace;
  }
  .stack-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pill {
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.5px;
  }
  .pill.hot { border-color: #F0A500; color: #F0A500; }

  /* ── TABS ── */
  .tabs {
    display: flex;
    gap: 0;
  }
  .tab {
    padding: 14px 30px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.3);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tab:hover { color: rgba(255,255,255,0.6); }
  .tab.active { color: #fff; border-bottom-color: #F0A500; }
  .tab-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor; opacity: 0.6;
  }

  /* ── CANVAS ── */
  .canvas {
    padding: 36px 40px;
  }

  /* ── NODES ── */
  .node {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .node:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  }
  .node-header {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .node-icon { font-size: 16px; }
  .node-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .node-body { padding: 12px 16px; }

  .tag {
    display: inline-block;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    margin: 3px;
    color: rgba(255,255,255,0.7);
  }
  .tag.accent { border-color: #F0A500; color: #F0A500; background: rgba(240,165,0,0.08); }
  .tag.green { border-color: #22C55E; color: #22C55E; background: rgba(34,197,94,0.08); }
  .tag.blue { border-color: #60A5FA; color: #60A5FA; background: rgba(96,165,250,0.08); }
  .tag.red { border-color: #F87171; color: #F87171; background: rgba(248,113,113,0.08); }
  .tag.purple { border-color: #C084FC; color: #C084FC; background: rgba(192,132,252,0.08); }

  /* ── ARROW ── */
  .arrow-h {
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.2); font-size: 18px; padding: 0 6px;
  }
  .arrow-v {
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.2); font-size: 18px; padding: 4px 0;
  }
  .arrow-label {
    font-size: 9px; font-family: 'JetBrains Mono', monospace;
    color: rgba(255,255,255,0.25); text-align: center; line-height: 1.4;
  }

  /* ── ZONE LABEL ── */
  .zone {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 20px;
    position: relative;
    margin-bottom: 16px;
  }
  .zone-label {
    position: absolute;
    top: -10px; left: 20px;
    background: #080F1A;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── FLOW LINE ── */
  .flow-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  }
  .flow-step {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 10px 14px;
    flex: 1;
  }
  .flow-num {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
  }
  .step-title { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
  .step-sub { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.35); }

  /* ── DB TABLE ── */
  .dbt { 
    border-radius: 8px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .dbt-head {
    padding: 8px 12px;
    font-size: 11px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.5px;
  }
  .dbt-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 5px 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
  .dbt-row.pk { background: rgba(240,165,0,0.06); }
  .dbt-row.fk { background: rgba(96,165,250,0.04); }
  .field-name { color: rgba(255,255,255,0.8); }
  .field-name.pk-name { color: #F0A500; font-weight: 700; }
  .field-name.fk-name { color: #60A5FA; }
  .field-type { color: rgba(255,255,255,0.25); font-size: 10px; }

  /* ── SECTION TITLE ── */
  .sec-title {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; gap: 8px;
  }
  .sec-title::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.06);
  }

  /* ── ENDPOINT ── */
  .ep {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-family: 'JetBrains Mono', monospace;
  }
  .method {
    font-size: 10px; font-weight: 800; padding: 2px 7px;
    border-radius: 3px; min-width: 44px; text-align: center;
  }
  .GET { background: rgba(34,197,94,0.15); color: #22C55E; border: 1px solid rgba(34,197,94,0.3); }
  .POST { background: rgba(96,165,250,0.15); color: #60A5FA; border: 1px solid rgba(96,165,250,0.3); }
  .PUT { background: rgba(240,165,0,0.15); color: #F0A500; border: 1px solid rgba(240,165,0,0.3); }
  .DELETE { background: rgba(248,113,113,0.15); color: #F87171; border: 1px solid rgba(248,113,113,0.3); }
  .ep-path { font-size: 12px; color: rgba(255,255,255,0.6); flex: 1; }
  .ep-desc { font-size: 11px; color: rgba(255,255,255,0.25); }

  /* ── LAYER BADGE ── */
  .layer-badge {
    padding: 3px 10px; border-radius: 3px;
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; font-family: 'JetBrains Mono', monospace;
  }

  /* ── CONNECTOR ── */
  .conn-line {
    display: flex; align-items: center; gap: 4px;
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    color: rgba(255,255,255,0.2); padding: 2px 0;
  }
  .conn-dash { flex: 1; border-top: 1px dashed rgba(255,255,255,0.1); }
`;

// ═══════════════════════════════════════════════════════════
// VUE GLOBALE
// ═══════════════════════════════════════════════════════════
function VueGlobale() {
  const layers = [
    {
      id: "CLIENT", label: "Clients", icon: "👤", color: "#4B5563",
      items: ["Navigateur Web", "Mobile (PWA installable)", "Tablette"],
    },
    {
      id: "FRONTEND", label: "Frontend", icon: "⚛️", color: "#1D4ED8",
      items: ["React 18 + Vite", "React Query", "Zustand", "Tailwind CSS", "PWA / Service Worker"],
    },
    {
      id: "GATEWAY", label: "Gateway", icon: "🔀", color: "#374151",
      items: ["NGINX Reverse Proxy", "SSL/TLS Termination", "Rate Limiting", "CORS Policy"],
    },
    {
      id: "BACKEND", label: "Backend", icon: "☕", color: "#065F46",
      items: ["Spring Boot 3", "Spring Security + JWT", "JPA / Hibernate", "API REST JSON"],
    },
    {
      id: "DB", label: "Data", icon: "🗄️", color: "#7C3AED",
      items: ["PostgreSQL 16", "Row Level Security", "Flyway Migrations", "Backups S3"],
    },
  ];

  const integrations = [
    { icon: "💸", name: "Wave API", color: "#22C55E" },
    { icon: "📱", name: "Orange Money", color: "#F0A500" },
    { icon: "💬", name: "Twilio / WA", color: "#60A5FA" },
    { icon: "🤖", name: "Ollama LLM", color: "#C084FC" },
    { icon: "📧", name: "SMTP Mail", color: "#F87171" },
  ];

  const devops = ["Docker", "Docker Compose", "GitLab CI/CD", "Vault", "Consul", "OVH / AWS af-south"];

  return (
    <div>
      {/* Architecture en couches */}
      <div className="sec-title">Architecture système</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
        {layers.map((layer, i) => (
          <div key={layer.id} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div className="node" style={{ minWidth: 160, background: `${layer.color}18` }}>
              <div className="node-header" style={{ background: `${layer.color}33` }}>
                <span className="node-icon">{layer.icon}</span>
                <div>
                  <div className="node-title" style={{ color: "#fff" }}>{layer.label}</div>
                  <div style={{ fontSize: 9, opacity: 0.4, fontFamily: "JetBrains Mono", letterSpacing: 1 }}>{layer.id}</div>
                </div>
              </div>
              <div className="node-body">
                {layer.items.map((item, j) => (
                  <div key={j} className="tag" style={{ display: "block", marginBottom: 4 }}>{item}</div>
                ))}
              </div>
            </div>
            {i < layers.length - 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div className="arrow-h">→</div>
                <div className="arrow-label">HTTP<br/>JSON</div>
              </div>
            )}
          </div>
        ))}

        {/* Integrations */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div className="arrow-h">↔</div>
          <div className="arrow-label">APIs<br/>ext.</div>
        </div>
        <div className="node" style={{ minWidth: 140, background: "rgba(255,255,255,0.02)" }}>
          <div className="node-header" style={{ background: "rgba(255,255,255,0.05)" }}>
            <span className="node-icon">🔌</span>
            <div className="node-title" style={{ color: "rgba(255,255,255,0.6)" }}>Intégrations</div>
          </div>
          <div className="node-body">
            {integrations.map((int, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 14 }}>{int.icon}</span>
                <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: int.color }}>{int.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DevOps Layer */}
      <div style={{ marginTop: 24 }}>
        <div className="sec-title">Infrastructure & DevOps</div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 20px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)", marginRight: 8 }}>INFRA</span>
          {devops.map((d, i) => <span key={i} className="tag">{d}</span>)}
        </div>
      </div>

      {/* Multi-tenant */}
      <div style={{ marginTop: 24 }}>
        <div className="sec-title">Stratégie Multi-tenant</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { name: "Boutique Diallo", t: "tenant_id: 1", color: "#1D4ED8" },
            { name: "Resto Fatou", t: "tenant_id: 2", color: "#065F46" },
            { name: "Garage Moussa", t: "tenant_id: 3", color: "#7C3AED" },
            { name: "+ N tenants...", t: "scalable", color: "#374151" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ border: `1px solid ${t.color}55`, borderRadius: 8, padding: "10px 14px", background: `${t.color}11`, textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>🏢</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: t.color, marginTop: 4 }}>{t.t}</div>
              </div>
              {i < 3 && <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</div>}
            </div>
          ))}
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 18px", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🗄️</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>1 DB PostgreSQL</div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>WHERE tenant_id = ?</div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#C084FC", marginTop: 2 }}>Row Level Security</div>
          </div>
        </div>
      </div>

      {/* Flux JWT */}
      <div style={{ marginTop: 24 }}>
        <div className="sec-title">Flux d'authentification JWT</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { n: "1", label: "POST /auth/login", sub: "email + password", color: "#60A5FA" },
            { n: "2", label: "Vérification", sub: "Spring Security", color: "#F0A500" },
            { n: "3", label: "JWT généré", sub: "exp: 24h", color: "#22C55E" },
            { n: "4", label: "Bearer Token", sub: "dans chaque header", color: "#C084FC" },
            { n: "5", label: "Refresh Token", sub: "rotation 7 jours", color: "#F87171" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="flow-step" style={{ minWidth: 140 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="flow-num" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>{s.n}</div>
                  <div>
                    <div className="step-title" style={{ color: "#fff" }}>{s.label}</div>
                    <div className="step-sub">{s.sub}</div>
                  </div>
                </div>
              </div>
              {i < 4 && <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VUE FRONTEND
// ═══════════════════════════════════════════════════════════
function VueFrontend() {
  const pages = [
    { name: "Dashboard", icon: "📊", hooks: ["useDashboard"], stores: ["tenantStore"], api: ["/transactions/dashboard"] },
    { name: "Factures", icon: "🧾", hooks: ["useFactures", "useClients"], stores: ["authStore"], api: ["/factures", "/factures/:id/pdf"] },
    { name: "Stock", icon: "📦", hooks: ["useStock", "useMouvements"], stores: [], api: ["/produits", "/produits/alertes"] },
    { name: "Comptabilité", icon: "💰", hooks: ["useTransactions"], stores: [], api: ["/transactions", "/transactions/export"] },
    { name: "Paramètres", icon: "⚙️", hooks: ["useTenant", "useUsers"], stores: ["authStore"], api: ["/tenants/me", "/users"] },
  ];

  const stack = [
    { lib: "React 18", cat: "Core", color: "#60A5FA", detail: "Hooks + Suspense + Concurrent" },
    { lib: "Vite", cat: "Build", color: "#F0A500", detail: "HMR ultra-rapide, ESM natif" },
    { lib: "React Router v6", cat: "Routing", color: "#22C55E", detail: "Routes protégées + lazy loading" },
    { lib: "React Query", cat: "Server State", color: "#C084FC", detail: "Cache, sync, invalidation auto" },
    { lib: "Zustand", cat: "Client State", color: "#F87171", detail: "Auth + tenant global state" },
    { lib: "Tailwind CSS", cat: "Styling", color: "#60A5FA", detail: "Utility-first, mobile-first" },
    { lib: "React Hook Form", cat: "Forms", color: "#F0A500", detail: "Validation + performance" },
    { lib: "Recharts", cat: "Charts", color: "#22C55E", detail: "Graphiques revenus/stock" },
    { lib: "Vite PWA", cat: "PWA", color: "#C084FC", detail: "Service Worker, offline ready" },
    { lib: "Axios", cat: "HTTP", color: "#F87171", detail: "Interceptors JWT + refresh" },
  ];

  const compStructure = [
    { name: "App.jsx", type: "root", depth: 0 },
    { name: "AuthProvider", type: "provider", depth: 1 },
    { name: "QueryClientProvider", type: "provider", depth: 1 },
    { name: "Router", type: "router", depth: 1 },
    { name: "PrivateRoute (JWT guard)", type: "guard", depth: 2 },
    { name: "AppLayout", type: "layout", depth: 3 },
    { name: "Sidebar", type: "component", depth: 4 },
    { name: "TopBar", type: "component", depth: 4 },
    { name: "<Outlet /> → pages", type: "outlet", depth: 4 },
    { name: "PublicRoute", type: "guard", depth: 2 },
    { name: "LoginPage / RegisterPage", type: "page", depth: 3 },
  ];

  const typeColors = {
    root: "#F0A500", provider: "#60A5FA", router: "#22C55E",
    guard: "#C084FC", layout: "#F87171", component: "rgba(255,255,255,0.4)",
    outlet: "#F0A500", page: "rgba(255,255,255,0.3)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Stack */}
      <div>
        <div className="sec-title">Stack & dépendances</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {stack.map((s, i) => (
            <div key={i} className="node" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 700, color: s.color }}>{s.lib}</span>
                  <span style={{ fontSize: 9, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 3, padding: "1px 5px", fontFamily: "JetBrains Mono" }}>{s.cat}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Arborescence composants */}
        <div>
          <div className="sec-title">Arbre des composants</div>
          <div className="node" style={{ background: "rgba(255,255,255,0.02)", padding: 16 }}>
            {compStructure.map((node, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", marginLeft: node.depth * 16 }}>
                <span style={{ color: typeColors[node.type], fontSize: 11, lineHeight: 1 }}>
                  {node.depth > 0 ? "└─ " : ""}
                </span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: typeColors[node.type] }}>
                  {node.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern React Query */}
        <div>
          <div className="sec-title">Pattern data fetching</div>
          <div className="node" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#C084FC" }}>useFactures.js</span>
            </div>
            <pre style={{ padding: "14px 16px", fontSize: 11, fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, overflowX: "auto", margin: 0 }}>
{`<span style="color:#C084FC">import</span> { useQuery, useMutation } 
  from <span style="color:#22C55E">'@tanstack/react-query'</span>;

<span style="color:#60A5FA">export const</span> useFactures = (filters) => {
  <span style="color:#F0A500">return</span> useQuery({
    queryKey: [<span style="color:#22C55E">'factures'</span>, filters],
    queryFn: () => api.get(<span style="color:#22C55E">'/factures'</span>, filters),
    staleTime: <span style="color:#F87171">5 * 60 * 1000</span>, <span style="color:#4B5563">// 5min cache</span>
  });
};

<span style="color:#60A5FA">export const</span> useCreateFacture = () => {
  <span style="color:#F0A500">return</span> useMutation({
    mutationFn: api.post(<span style="color:#22C55E">'/factures'</span>),
    onSuccess: () => {
      qc.invalidateQueries([<span style="color:#22C55E">'factures'</span>]);
      qc.invalidateQueries([<span style="color:#22C55E">'dashboard'</span>]);
    }
  });
};`}
            </pre>
          </div>
        </div>
      </div>

      {/* Pages & dépendances */}
      <div>
        <div className="sec-title">Pages → Hooks → Endpoints</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pages.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <div style={{ minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{p.name}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>→</div>
              <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
                {p.hooks.map((h, j) => <span key={j} className="tag purple">{h}</span>)}
                {p.stores.map((s, j) => <span key={j} className="tag blue">{s}</span>)}
              </div>
              <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>→</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {p.api.map((a, j) => <span key={j} className="tag mono" style={{ fontSize: 10, color: "#22C55E", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)" }}>{a}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PWA */}
      <div>
        <div className="sec-title">Stratégie PWA & Offline</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { icon: "📲", title: "Installable", desc: "manifest.json + icônes — ajout écran d'accueil mobile" },
            { icon: "📶", title: "Offline-first", desc: "Service Worker cache les assets et dernières données" },
            { icon: "🔄", title: "Background Sync", desc: "Factures créées hors-ligne synchronisées au retour réseau" },
            { icon: "🔔", title: "Push Notifs", desc: "Alertes stock bas, factures impayées (V2)" },
          ].map((item, i) => (
            <div key={i} className="node" style={{ background: "rgba(255,255,255,0.02)", padding: 14 }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VUE BACKEND
// ═══════════════════════════════════════════════════════════
function VueBackend() {
  const modules = [
    {
      name: "Auth", color: "#7C3AED", prefix: "/api/v1/auth",
      endpoints: [
        { m: "POST", p: "/login", d: "Connexion + génération JWT" },
        { m: "POST", p: "/refresh", d: "Renouveler access token" },
        { m: "POST", p: "/logout", d: "Invalider le token" },
        { m: "POST", p: "/register", d: "Créer un compte tenant" },
      ]
    },
    {
      name: "Factures", color: "#F0A500", prefix: "/api/v1/factures",
      endpoints: [
        { m: "GET", p: "/", d: "Liste avec filtres + pagination" },
        { m: "POST", p: "/", d: "Créer devis ou facture" },
        { m: "PUT", p: "/:id", d: "Modifier une facture" },
        { m: "POST", p: "/:id/valider", d: "Devis → Facture officielle" },
        { m: "GET", p: "/:id/pdf", d: "Générer PDF (JasperReports)" },
        { m: "POST", p: "/:id/relance", d: "SMS/WhatsApp via Twilio" },
      ]
    },
    {
      name: "Stock", color: "#22C55E", prefix: "/api/v1/produits",
      endpoints: [
        { m: "GET", p: "/", d: "Catalogue produits du tenant" },
        { m: "POST", p: "/", d: "Créer un produit" },
        { m: "PUT", p: "/:id", d: "Modifier (prix, stock min...)" },
        { m: "DELETE", p: "/:id", d: "Soft delete (deleted_at)" },
        { m: "POST", p: "/:id/mouvement", d: "Entrée ou sortie de stock" },
        { m: "GET", p: "/alertes", d: "Produits sous seuil minimum" },
      ]
    },
    {
      name: "Comptabilité", color: "#60A5FA", prefix: "/api/v1/transactions",
      endpoints: [
        { m: "GET", p: "/", d: "Toutes les transactions" },
        { m: "POST", p: "/", d: "Enregistrer recette ou dépense" },
        { m: "GET", p: "/dashboard", d: "KPIs revenus / dépenses" },
        { m: "GET", p: "/export", d: "Export Excel ou PDF" },
      ]
    },
  ];

  const tables = [
    {
      name: "factures", color: "#F0A500",
      fields: [
        { name: "id", type: "UUID PK", pk: true },
        { name: "tenant_id", type: "UUID FK", fk: true },
        { name: "client_id", type: "UUID FK", fk: true },
        { name: "numero", type: "VARCHAR(20)" },
        { name: "statut", type: "ENUM" },
        { name: "montant_ttc", type: "DECIMAL(14,2)" },
        { name: "date_echeance", type: "DATE" },
      ]
    },
    {
      name: "produits", color: "#22C55E",
      fields: [
        { name: "id", type: "UUID PK", pk: true },
        { name: "tenant_id", type: "UUID FK", fk: true },
        { name: "nom", type: "VARCHAR(200)" },
        { name: "prix_unitaire", type: "DECIMAL(12,2)" },
        { name: "stock_actuel", type: "INTEGER" },
        { name: "stock_minimum", type: "INTEGER" },
        { name: "deleted_at", type: "TIMESTAMP NULL" },
      ]
    },
    {
      name: "transactions", color: "#60A5FA",
      fields: [
        { name: "id", type: "UUID PK", pk: true },
        { name: "tenant_id", type: "UUID FK", fk: true },
        { name: "facture_id", type: "UUID FK NULL", fk: true },
        { name: "type", type: "ENUM" },
        { name: "montant", type: "DECIMAL(14,2)" },
        { name: "categorie", type: "VARCHAR(100)" },
        { name: "date_transaction", type: "DATE" },
      ]
    },
  ];

  const springLayers = [
    { layer: "Controller", desc: "Validation requête, mapping DTO → réponse HTTP", color: "#F0A500" },
    { layer: "Service", desc: "Logique métier, transactions @Transactional", color: "#22C55E" },
    { layer: "Repository", desc: "JPA + requêtes custom JPQL, filtrage tenant_id", color: "#60A5FA" },
    { layer: "Entity", desc: "Entités JPA + @TenantFilter Hibernate", color: "#C084FC" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Architecture Spring Boot */}
      <div>
        <div className="sec-title">Architecture Spring Boot — couches</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {springLayers.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: `${l.color}15`, border: `1px solid ${l.color}40`, borderRadius: 8, padding: "14px 18px", minWidth: 180 }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: l.color, marginBottom: 6 }}>@{l.layer}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{l.desc}</div>
              </div>
              {i < springLayers.length - 1 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>↓</div>
                </div>
              )}
            </div>
          ))}
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 16, marginLeft: 4 }}>→</div>
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: "#C084FC", marginBottom: 4 }}>PostgreSQL</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Row Level Security</div>
          </div>
        </div>
      </div>

      {/* Endpoints par module */}
      <div>
        <div className="sec-title">Endpoints REST par module</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {modules.map((mod, i) => (
            <div key={i} className="node" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="node-header" style={{ background: `${mod.color}18` }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: mod.color }}>{mod.name}</span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{mod.prefix}</span>
              </div>
              <div style={{ padding: "6px 14px" }}>
                {mod.endpoints.map((ep, j) => (
                  <div key={j} className="ep">
                    <span className={`method ${ep.m}`}>{ep.m}</span>
                    <span className="ep-path">{ep.p}</span>
                    <span className="ep-desc">{ep.d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schéma BDD */}
      <div>
        <div className="sec-title">Schéma base de données (tables principales)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {tables.map((t, i) => (
            <div key={i} className="dbt">
              <div className="dbt-head" style={{ background: `${t.color}22`, color: t.color }}>📋 {t.name}</div>
              {t.fields.map((f, j) => (
                <div key={j} className={`dbt-row ${f.pk ? "pk" : f.fk ? "fk" : ""}`}>
                  <span className={`field-name ${f.pk ? "pk-name" : f.fk ? "fk-name" : ""}`}>
                    {f.pk ? "🔑 " : f.fk ? "🔗 " : "   "}{f.name}
                  </span>
                  <span className="field-type">{f.type}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { icon: "🔑", label: "Clé primaire (UUID)", color: "#F0A500" },
            { icon: "🔗", label: "Clé étrangère (FK)", color: "#60A5FA" },
            { icon: "🛡️", label: "Row Level Security sur toutes les tables", color: "#22C55E" },
            { icon: "📜", label: "Migrations versionnées via Flyway", color: "#C084FC" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 13 }}>{r.icon}</span>
              <span style={{ fontSize: 11, color: r.color, fontFamily: "JetBrains Mono" }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Format réponse */}
      <div>
        <div className="sec-title">Format de réponse standard</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "✅ Succès 200", color: "#22C55E", code: `{
  "data": {
    "id": "uuid-...",
    "numero": "FAC-2025-001",
    "montant_ttc": 150000,
    "statut": "en_attente"
  },
  "meta": {
    "timestamp": "2025-03-11T10:00:00Z",
    "page": 1, "total": 42
  }
}` },
            { label: "❌ Erreur 4xx/5xx", color: "#F87171", code: `{
  "errors": [{
    "code": "STOCK_INSUFFISANT",
    "message": "Stock insuffisant",
    "field": "quantite",
    "detail": "Dispo: 3, demandé: 10"
  }],
  "meta": {
    "timestamp": "2025-03-11T10:00:00Z"
  }
}` },
          ].map((block, i) => (
            <div key={i} className="node" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: block.color }}>{block.label}</span>
              </div>
              <pre style={{ padding: 14, fontSize: 11, fontFamily: "JetBrains Mono", color: `${block.color}aa`, lineHeight: 1.7, margin: 0, overflowX: "auto" }}>
                {block.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════
const TABS = [
  { label: "Vue Globale", icon: "🌐" },
  { label: "Frontend", icon: "⚛️" },
  { label: "Backend", icon: "☕" },
];

export default function App() {
  const [active, setActive] = useState(0);
  const views = [VueGlobale, VueFrontend, VueBackend];
  const View = views[active];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div>
              <div className="logo">DIM<span>BA</span></div>
              <div className="logo-sub">Architecture Technique — v1.0</div>
            </div>
            <div className="stack-pills">
              <span className="pill hot">React 18</span>
              <span className="pill hot">Spring Boot 3</span>
              <span className="pill hot">PostgreSQL 16</span>
              <span className="pill">Docker</span>
              <span className="pill">GitLab CI/CD</span>
              <span className="pill">JWT</span>
              <span className="pill">PWA</span>
            </div>
          </div>
          <div className="tabs">
            {TABS.map((t, i) => (
              <button key={i} className={`tab ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>
                <span>{t.icon}</span>
                {t.label}
                {active === i && <span className="tab-dot" />}
              </button>
            ))}
          </div>
        </div>

        <div className="canvas">
          <View />
        </div>
      </div>
    </>
  );
}
