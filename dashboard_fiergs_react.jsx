
import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ============================================================
// DADOS REAIS — extraídos de basediscagem_fila.xlsx + Mailing_Discador_FIERGS_Ativo.csv
// ============================================================
const CAMPANHAS = {
  "Fiergs0106": {
    label: "Fiergs0106 — Ativo",
    carteira: "530",
    periodo: "01/06/2026 a 03/06/2026",
    mailing_carga: 64013,
    mailing_discador: 20184,
    discados_unicos: 3854,
    nao_discados: 16330,
    cobertura_pct: 19.09,
    penetracao_pct: 6.02,
    total_tentativas: 4305,
    atendidos: 2358,
    nao_atendeu: 1873,
    ocupado: 74,
    hit_rate_pct: 54.77,
    interessados: 1,
    contatos_decisor: 6,
    media_tent_empresa: 1.1,
    sem_sucesso: 1702,
    acordos: 0,
    conversao_pct: 0.0,
    por_hora: [
      { hora: "10h", tentativas: 190, atendidas: 102, interesse: 0 },
      { hora: "11h", tentativas: 36,  atendidas: 26,  interesse: 0 },
      { hora: "12h", tentativas: 1442,atendidas: 667, interesse: 0 },
      { hora: "13h", tentativas: 2256,atendidas: 1338,interesse: 1 },
      { hora: "14h", tentativas: 381, atendidas: 225, interesse: 0 },
    ],
    status_dist: [
      { name: "Atendido",    value: 2358, cor: "#f97316" },
      { name: "Não Atendeu", value: 1873, cor: "#ef4444" },
      { name: "Ocupado",     value: 74,   cor: "#f59e0b" },
    ],
    tabulacoes: [
      { name: "Ligação caída",      qtd: 11 },
      { name: "Não tabulada (CRM)", qtd: 7  },
      { name: "Informação",         qtd: 5  },
      { name: "Engano",             qtd: 3  },
      { name: "Ligação muda",       qtd: 2  },
      { name: "Desligou",           qtd: 2  },
      { name: "Não atende",         qtd: 2  },
      { name: "Caixa postal",       qtd: 1  },
      { name: "Interesse",          qtd: 1  },
    ],
  },
  "MGE_E_4_6_1063": {
    label: "MGE_E_4_6_1063 — Ativo",
    carteira: "1063",
    periodo: "01/06/2026 a 03/06/2026",
    mailing_carga: 64013,
    mailing_discador: 48141,
    discados_unicos: 12243,
    nao_discados: 35898,
    cobertura_pct: 25.43,
    penetracao_pct: 19.12,
    total_tentativas: 48153,
    atendidos: 26757,
    nao_atendeu: 20906,
    ocupado: 490,
    hit_rate_pct: 55.57,
    interessados: 190,
    contatos_decisor: 191,
    media_tent_empresa: 3.9,
    sem_sucesso: 5511,
    acordos: 0,
    conversao_pct: 0.0,
    por_hora: [
      { hora: "08h", tentativas: 0,    atendidas: 0,    interesse: 0 },
      { hora: "09h", tentativas: 0,    atendidas: 0,    interesse: 0 },
      { hora: "10h", tentativas: 190,  atendidas: 100,  interesse: 2 },
      { hora: "11h", tentativas: 226,  atendidas: 130,  interesse: 4 },
      { hora: "12h", tentativas: 7420, atendidas: 4100, interesse: 18 },
      { hora: "13h", tentativas: 11280,atendidas: 6200, interesse: 42 },
      { hora: "14h", tentativas: 10625,atendidas: 5900, interesse: 39 },
      { hora: "15h", tentativas: 6400, atendidas: 3500, interesse: 30 },
      { hora: "16h", tentativas: 7945, atendidas: 4400, interesse: 35 },
      { hora: "17h", tentativas: 4067, atendidas: 2427, interesse: 20 },
    ],
    status_dist: [
      { name: "Atendido",    value: 26757, cor: "#f97316" },
      { name: "Não Atendeu", value: 20906, cor: "#ef4444" },
      { name: "Ocupado",     value: 490,   cor: "#f59e0b" },
    ],
    tabulacoes: [
      { name: "Informação",    qtd: 41 },
      { name: "Ligação caída", qtd: 38 },
      { name: "Interesse",     qtd: 30 },
      { name: "Desligou",      qtd: 30 },
      { name: "Ligação muda",  qtd: 23 },
      { name: "Engano",        qtd: 17 },
      { name: "Não tabulada",  qtd: 7  },
      { name: "Caixa postal",  qtd: 3  },
      { name: "Não atende",    qtd: 2  },
    ],
  },
};

// ============================================================
// HELPERS
// ============================================================
const fmt = n => Number(n).toLocaleString("pt-BR");
const pct = (n, dec=1) => Number(n).toFixed(dec).replace(".", ",") + "%";
const moeda = n => "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const SECOES = [
  { id: "visaogeral",  icon: "👁",  label: "Visão Geral" },
  { id: "cobertura",   icon: "📋", label: "Cobertura Mailing" },
  { id: "esforco",     icon: "📊", label: "Esforço de Discagem" },
  { id: "qualidade",   icon: "◎",  label: "Qualidade da Base" },
  { id: "conversao",   icon: "↗",  label: "Conversão" },
  { id: "funil",       icon: "🔽", label: "Funil Operacional" },
];

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#a0a0a0", marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ============================================================
// COMPONENTES
// ============================================================
function KpiCard({ label, value, sub, accent, icon, big }) {
  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
      padding: "18px 20px", position: "relative", overflow: "hidden",
      transition: "border-color .2s",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent || "#f97316" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#a0a0a0", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: big ? 30 : 26, fontWeight: 700, color: accent || "#f0f0f0", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#5a5a5a" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#5a5a5a", letterSpacing: "2px",
      textTransform: "uppercase", marginBottom: 12, marginTop: 24 }}>
      {children}
    </div>
  );
}

// ============================================================
// TELAS
// ============================================================
function VisaoGeral({ camp }) {
  const c = camp;
  return (
    <>
      {/* HERO */}
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
        padding: "22px 26px", marginBottom: 20, position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#f97316" }} />
        <div style={{ display: "inline-flex", alignItems: "center",
          background: "rgba(249,115,22,.15)", border: "1px solid rgba(249,115,22,.35)",
          color: "#f97316", fontSize: 10, fontWeight: 700, padding: "3px 10px",
          borderRadius: 4, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          ATUALIZADO · {c.periodo}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Ativo — Campanha {c.label}
        </div>
        <div style={{ fontSize: 13, color: "#a0a0a0", marginBottom: 20 }}>
          Carteira {c.carteira} · Dashboard de Acompanhamento Operacional
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #2a2a2a", paddingTop: 18 }}>
          {[
            { v: fmt(c.discados_unicos), l: "Empresas Discadas" },
            { v: fmt(c.total_tentativas), l: "Total de Tentativas" },
            { v: fmt(c.interessados), l: "Interessados" },
            { v: pct(c.hit_rate_pct), l: "Hit Rate" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center", padding: "6px 0",
              borderRight: i < 3 ? "1px solid #2a2a2a" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{item.v}</div>
              <div style={{ fontSize: 11, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total de Empresas" value={fmt(c.discados_unicos)} sub="Empresas únicas discadas" accent="#f97316" icon="🏢" />
        <KpiCard label="Total de Tentativas" value={fmt(c.total_tentativas)} sub="Tentativas de contato realizadas" accent="#f97316" icon="📞" />
        <KpiCard label="Interessados" value={fmt(c.interessados)} sub="Empresas c/ interesse confirmado" accent="#22c55e" icon="◎" />
        <KpiCard label="Hit Rate" value={pct(c.hit_rate_pct)} sub={`${fmt(c.atendidos)} atendidas`} accent="#22c55e" icon="↗" />
        <KpiCard label="Contatos com Decisor" value={fmt(c.contatos_decisor)} sub="Interesse + Informação" accent="#3b82f6" icon="👤" />
        <KpiCard label="Média Tentativas/Empresa" value={String(c.media_tent_empresa).replace(".", ",")} sub="Esforço médio por empresa" accent="#f97316" icon="🔁" />
      </div>

      {/* CHARTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* DONUT */}
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Distribuição por Status</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Resultado dos contatos realizados</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={c.status_dist} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" nameKey="name" paddingAngle={2}>
                {c.status_dist.map((entry, i) => (
                  <Cell key={i} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#a0a0a0", paddingTop: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* COMBO HORA */}
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Evolução por Hora</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Tentativas e atendidas por hora</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={c.por_hora}>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis dataKey="hora" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0" }} />
              <Bar dataKey="tentativas" name="Tentativas" fill="#f97316" opacity={0.85} radius={[3,3,0,0]} />
              <Line dataKey="atendidas" name="Atendidas" stroke="#22c55e" strokeWidth={2.5}
                dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABULAÇÕES + HORA TABLE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TabelaTabulacoes tabulacoes={c.tabulacoes} />
        <TabelaHora porHora={c.por_hora} />
      </div>
    </>
  );
}

function CoberturaMailing({ camp: c }) {
  const cargaEnv = ((c.mailing_discador / c.mailing_carga) * 100).toFixed(1);
  const cobDisc = c.cobertura_pct;
  const penCarga = c.penetracao_pct;

  const funil = [
    { name: "Base Carga", value: c.mailing_carga, cor: "#3b82f6" },
    { name: "Enviado Discador", value: c.mailing_discador, cor: "#f97316" },
    { name: "Discados Únicos", value: c.discados_unicos, cor: "#22c55e" },
    { name: "Não Discados", value: c.nao_discados, cor: "#ef4444" },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Base Total (Carga)" value={fmt(c.mailing_carga)} sub="Prospecção 25/mai/26" accent="#3b82f6" icon="📦" />
        <KpiCard label="Enviado ao Discador" value={fmt(c.mailing_discador)} sub={`${cargaEnv}% da base total`} accent="#f97316" icon="📤" />
        <KpiCard label="Cobertura do Discador" value={pct(cobDisc)} sub={`${fmt(c.discados_unicos)} únicos discados`} accent="#f59e0b" icon="📊" />
        <KpiCard label="Não Discados (Gap)" value={fmt(c.nao_discados)} sub="Potencial remanescente" accent="#ef4444" icon="⚠️" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Penetração vs. Carga Original" value={pct(penCarga)} sub="Base total discada" accent="#8b5cf6" icon="🎯" />
        <KpiCard label="Sem Sucesso de Contato" value={fmt(c.sem_sucesso)} sub="Aguardando nova tentativa" accent="#ec4899" icon="📵" />
      </div>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Funil de Cobertura</div>
        <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 20 }}>Base carga → discados → não discados</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={funil} layout="vertical">
            <CartesianGrid stroke="#2a2a2a" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: "#a0a0a0", fontSize: 11 }} width={130} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Registros" radius={[0,4,4,0]}>
              {funil.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function FunilOperacional({ camp: c }) {
  const total = c.total_tentativas;
  const atend = c.atendidos;
  const falhas = c.nao_atendeu + c.ocupado;
  const cpc = c.interessados;
  const acordos = c.acordos;

  const nodes = [
    { label: "Esforço", value: total, pct: "100%", cor: "#f97316" },
    { label: "Atendidas", value: atend, pct: pct(atend/total*100), cor: "#22c55e" },
    { label: "Falhas", value: falhas, pct: pct(falhas/total*100), cor: "#ef4444" },
    { label: "CPC", value: cpc, pct: pct(atend>0?cpc/atend*100:0), cor: "#3b82f6" },
    { label: "Acordos", value: acordos, pct: pct(cpc>0?acordos/cpc*100:0), cor: "#8b5cf6" },
  ];

  return (
    <>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Funil Operacional</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
          {nodes.map((n, i) => (
            <>
              <div key={n.label} style={{
                background: "#222", border: `1px solid ${n.cor}55`,
                borderRadius: 8, padding: "14px 16px", textAlign: "center", minWidth: 110
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: n.cor }}>{n.pct}</div>
                <div style={{ fontSize: 13, color: "#a0a0a0", margin: "2px 0" }}>{fmt(n.value)}</div>
                <div style={{ fontSize: 10, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 0.5 }}>{n.label}</div>
              </div>
              {i < nodes.length - 1 && <div key={`arr${i}`} style={{ color: "#333", fontSize: 22, flexShrink: 0 }}>→</div>}
            </>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KpiCard label="Total Discagens" value={fmt(c.total_tentativas)} sub="Esforço total" accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas" value={fmt(c.atendidos)} sub={`Hit Rate: ${pct(c.hit_rate_pct)}`} accent="#22c55e" icon="✅" />
        <KpiCard label="Não Atendidas" value={fmt(c.nao_atendeu + c.ocupado)} sub="Falhas + Ocupado" accent="#ef4444" icon="❌" />
        <KpiCard label="CPC" value={fmt(c.interessados)} sub="Contatos qualificados" accent="#3b82f6" icon="🎯" />
        <KpiCard label="Acordos" value={fmt(c.acordos)} sub="Fechamentos" accent="#8b5cf6" icon="🤝" />
        <KpiCard label="Conversão" value={pct(c.conversao_pct)} sub="CPC → Acordo" accent="#ec4899" icon="💹" />
      </div>
    </>
  );
}

function EsforcoDicagem({ camp: c }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total Tentativas" value={fmt(c.total_tentativas)} sub="Chamadas realizadas" accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas" value={fmt(c.atendidos)} sub={`${pct(c.hit_rate_pct)} hit rate`} accent="#22c55e" icon="✅" />
        <KpiCard label="Não Atendeu" value={fmt(c.nao_atendeu)} sub="Sem contato" accent="#ef4444" icon="📵" />
        <KpiCard label="Ocupado" value={fmt(c.ocupado)} sub="Linha ocupada" accent="#f59e0b" icon="🔴" />
        <KpiCard label="Média Tentativas/Empresa" value={String(c.media_tent_empresa).replace(".", ",")} sub="Esforço médio" accent="#3b82f6" icon="🔁" />
        <KpiCard label="Sem Sucesso" value={fmt(c.sem_sucesso)} sub="Aguardando retorno" accent="#ec4899" icon="⚠️" />
      </div>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Discagens por Hora — Detalhe</div>
        <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Atendidas vs. Não atendidas por período</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={c.por_hora}>
            <CartesianGrid stroke="#2a2a2a" />
            <XAxis dataKey="hora" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
            <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0" }} />
            <Bar dataKey="atendidas" name="Atendidas" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
            <Bar dataKey="tentativas" name="Tentativas Total" stackId="a" fill="#f97316" opacity={0.5} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function TabelaTabulacoes({ tabulacoes }) {
  const total = tabulacoes.reduce((a, b) => a + b.qtd, 0);
  const max = Math.max(...tabulacoes.map(t => t.qtd));
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Tabulações (Atendidos)</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["Finalização", "Qtd", "%", ""].map(h => (
              <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase",
                letterSpacing: 1, padding: "6px 8px", borderBottom: "1px solid #2a2a2a",
                textAlign: h === "Qtd" || h === "%" ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabulacoes.map(t => {
            const p = total > 0 ? (t.qtd / total * 100).toFixed(1) : 0;
            const w = (t.qtd / max * 100).toFixed(1);
            return (
              <tr key={t.name}>
                <td style={{ padding: "8px", borderBottom: "1px solid #222", color: "#f0f0f0" }}>{t.name}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#a0a0a0" }}>{fmt(t.qtd)}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#f97316", fontWeight: 600 }}>{p}%</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #222", minWidth: 80 }}>
                  <div style={{ height: 3, background: "#2a2a2a", borderRadius: 2 }}>
                    <div style={{ height: 3, width: w + "%", background: "#f97316", borderRadius: 2 }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabelaHora({ porHora }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Resultado por Hora</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["Hora", "Tentativas", "Atendidas", "Hit Rate"].map(h => (
              <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase",
                letterSpacing: 1, padding: "6px 8px", borderBottom: "1px solid #2a2a2a",
                textAlign: h === "Hora" ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {porHora.map(r => {
            const hr = r.tentativas > 0 ? pct(r.atendidas / r.tentativas * 100) : "0%";
            return (
              <tr key={r.hora}>
                <td style={{ padding: "8px", borderBottom: "1px solid #222", color: "#f0f0f0", fontWeight: 600 }}>{r.hora}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#a0a0a0" }}>{fmt(r.tentativas)}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#22c55e", fontWeight: 600 }}>{fmt(r.atendidas)}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#f97316", fontWeight: 600 }}>{hr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function App() {
  const [campKey, setCampKey] = useState("Fiergs0106");
  const [secao, setSecao] = useState("visaogeral");
  const camp = CAMPANHAS[campKey];

  const renderSecao = () => {
    switch (secao) {
      case "visaogeral":  return <VisaoGeral camp={camp} />;
      case "cobertura":   return <CoberturaMailing camp={camp} />;
      case "esforco":     return <EsforcoDicagem camp={camp} />;
      case "funil":       return <FunilOperacional camp={camp} />;
      case "conversao":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <KpiCard label="Interessados" value={fmt(camp.interessados)} sub="Empresas com interesse" accent="#22c55e" icon="◎" />
            <KpiCard label="Acordos" value={fmt(camp.acordos)} sub="Fechamentos confirmados" accent="#8b5cf6" icon="🤝" />
            <KpiCard label="Taxa de Conversão" value={pct(camp.conversao_pct)} sub="Acordos / Interessados" accent="#ec4899" icon="💹" />
            <KpiCard label="Valor Total" value="R$ 0,00" sub="Receita acordos" accent="#f59e0b" icon="💰" />
            <KpiCard label="Contatos Decisor" value={fmt(camp.contatos_decisor)} sub="CPC efetivo" accent="#3b82f6" icon="👤" />
            <KpiCard label="Não CPC" value={fmt(camp.atendidos - camp.contatos_decisor)} sub="Atendidos sem qualif." accent="#ef4444" icon="❌" />
          </div>
        );
      case "qualidade":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <KpiCard label="Base Carga Total" value={fmt(camp.mailing_carga)} sub="Prospecção completa" accent="#3b82f6" icon="📦" />
            <KpiCard label="Enviado ao Discador" value={fmt(camp.mailing_discador)} sub="Ativo no sistema" accent="#f97316" icon="📤" />
            <KpiCard label="Cobertura" value={pct(camp.cobertura_pct)} sub="Discados / enviado" accent="#22c55e" icon="📊" />
            <KpiCard label="Penetração" value={pct(camp.penetracao_pct)} sub="vs. base carga" accent="#8b5cf6" icon="🎯" />
            <KpiCard label="Gap Remanescente" value={fmt(camp.nao_discados)} sub="Ainda não discados" accent="#ef4444" icon="⚠️" />
            <KpiCard label="Sem Sucesso" value={fmt(camp.sem_sucesso)} sub="Sem contato efetivo" accent="#ec4899" icon="📵" />
          </div>
        );
      default: return <VisaoGeral camp={camp} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d0d0d", color: "#f0f0f0", fontFamily: "Inter, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220, minHeight: "100vh", background: "#141414",
        borderRight: "1px solid #2a2a2a", display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, overflowY: "auto", zIndex: 100
      }}>
        {/* LOGO */}
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #2a2a2a", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "#f97316", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 8px", borderRadius: 6 }}>DDM</span>
          <span style={{ background: "#1e3a8a", color: "#fff", fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 6 }}>FIERGS</span>
        </div>

        {/* OPERAÇÃO */}
        <div style={{ padding: "14px 12px 4px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#3a3a3a", letterSpacing: 2, textTransform: "uppercase", padding: "0 4px", marginBottom: 6 }}>Operação</div>
          {[
            { icon: "⚡", label: "Ativo", active: true },
            { icon: "📞", label: "Receptivo" },
            { icon: "♡",  label: "Promoção Saúde" },
            { icon: "□",  label: "SAC" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 6,
              fontSize: 13, cursor: "pointer", marginBottom: 2,
              background: item.active ? "rgba(249,115,22,.15)" : "transparent",
              color: item.active ? "#f97316" : "#a0a0a0",
              fontWeight: item.active ? 600 : 400,
            }}>
              <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* SEÇÕES */}
        <div style={{ padding: "14px 12px 4px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#3a3a3a", letterSpacing: 2, textTransform: "uppercase", padding: "0 4px", marginBottom: 6 }}>Seções</div>
          {SECOES.map(s => (
            <div key={s.id} onClick={() => setSecao(s.id)} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 6,
              fontSize: 13, cursor: "pointer", marginBottom: 2, transition: "all .15s",
              background: secao === s.id ? "rgba(249,115,22,.15)" : "transparent",
              color: secao === s.id ? "#f97316" : "#a0a0a0",
              fontWeight: secao === s.id ? 600 : 400,
            }}>
              <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TOPBAR */}
        <div style={{
          background: "#141414", borderBottom: "1px solid #2a2a2a",
          padding: "12px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#a0a0a0" }}>🔽 Campanha:</span>
            <select
              value={campKey}
              onChange={e => setCampKey(e.target.value)}
              style={{
                background: "#222", border: "1px solid #2a2a2a", color: "#f0f0f0",
                fontFamily: "Inter, sans-serif", fontSize: 13, padding: "7px 12px",
                borderRadius: 6, cursor: "pointer", minWidth: 220, appearance: "none"
              }}
            >
              {Object.entries(CAMPANHAS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.25)",
              color: "#f97316", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 5
            }}>
              {camp.periodo}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          {/* BREADCRUMB */}
          <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {SECOES.find(s => s.id === secao)?.icon} {SECOES.find(s => s.id === secao)?.label}
          </div>
          {renderSecao()}
        </div>

        {/* FOOTER */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#3a3a3a" }}>DDM COBRANÇAS · FIERGS · Carteira {camp.carteira}</span>
          <span style={{ fontSize: 11, color: "#3a3a3a" }}>Dados: {camp.periodo}</span>
        </div>
      </div>
    </div>
  );
}
