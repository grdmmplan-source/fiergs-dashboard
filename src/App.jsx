
import { useState, useMemo } from "react";
import {
  BarChart, Bar, ComposedChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import BrMaisProdutivo from "./BrMaisProdutivo.jsx";
import DiagnosticoDiscagem from "./DiagnosticoDiscagem.jsx";

// ============================================================
// DADOS — extraídos de Discagem_Fila.csv (01/06/2026 a 05/06/2026)
// ============================================================
const _F = {
  label: "Fiergs0106 — Ativo", carteira: "530",
  periodo: "01/06/2026 a 05/06/2026",
  mailing_carga: 64013, mailing_discador: 20184,
  discados_unicos: 3854, nao_discados: 16330,
  cobertura_pct: 19.09, penetracao_pct: 6.02,
  total_tentativas: 4305, atendidos: 2358, nao_atendeu: 1873, ocupado: 74,
  hit_rate_pct: 54.77, interessados: 1, contatos_decisor: 6,
  media_tent_empresa: 1.1, sem_sucesso: 3848, acordos: 0, conversao_pct: 0.0,
  por_hora: [
    { hora: "10h", tentativas: 190,  atendidas: 102,  interesse: 0 },
    { hora: "11h", tentativas: 36,   atendidas: 26,   interesse: 0 },
    { hora: "12h", tentativas: 1442, atendidas: 667,  interesse: 0 },
    { hora: "13h", tentativas: 2256, atendidas: 1338, interesse: 1 },
    { hora: "14h", tentativas: 381,  atendidas: 225,  interesse: 0 },
  ],
  por_dia: [
    { dia: "01/06", ddd: "Seg", tent: 4305, atend: 2358, naoAtend: 1873, ocup: 74, int: 1, docs: 3854, hr: 54.77 },
  ],
  por_dia_hora: {
    "01/06": [
      { hora: "10h", tentativas: 190,  atendidas: 102,  interesse: 0 },
      { hora: "11h", tentativas: 36,   atendidas: 26,   interesse: 0 },
      { hora: "12h", tentativas: 1442, atendidas: 667,  interesse: 0 },
      { hora: "13h", tentativas: 2256, atendidas: 1338, interesse: 1 },
      { hora: "14h", tentativas: 381,  atendidas: 225,  interesse: 0 },
    ],
  },
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
    { name: "Desligou",           qtd: 2  },
    { name: "Ligação muda",       qtd: 2  },
    { name: "Não atende",         qtd: 2  },
    { name: "Interesse",          qtd: 1  },
    { name: "Caixa postal",       qtd: 1  },
  ],
};

const _M = {
  label: "MGE_E_4_6_1063 — Ativo", carteira: "1063",
  periodo: "01/06/2026 a 05/06/2026",
  mailing_carga: 64013, mailing_discador: 48141,
  discados_unicos: 19488, nao_discados: 28653,
  cobertura_pct: 40.48, penetracao_pct: 30.44,
  total_tentativas: 67795, atendidos: 36669, nao_atendeu: 30427, ocupado: 699,
  hit_rate_pct: 54.09, interessados: 238, contatos_decisor: 492,
  media_tent_empresa: 3.5, sem_sucesso: 18947, acordos: 0, conversao_pct: 0.0,
  por_hora: [
    { hora: "09h", tentativas: 6385, atendidas: 3732, interesse: 28 },
    { hora: "10h", tentativas: 7221, atendidas: 3977, interesse: 24 },
    { hora: "11h", tentativas: 7070, atendidas: 3637, interesse: 20 },
    { hora: "12h", tentativas: 6183, atendidas: 2832, interesse: 24 },
    { hora: "13h", tentativas: 6325, atendidas: 3395, interesse: 25 },
    { hora: "14h", tentativas: 8691, atendidas: 4962, interesse: 24 },
    { hora: "15h", tentativas: 8232, atendidas: 4681, interesse: 26 },
    { hora: "16h", tentativas: 9659, atendidas: 5246, interesse: 46 },
    { hora: "17h", tentativas: 7986, atendidas: 4190, interesse: 21 },
    { hora: "18h", tentativas: 43,   atendidas: 17,   interesse: 0  },
  ],
  por_dia: [
    { dia: "01/06", ddd: "Seg", tent: 7938,  atend: 4374,  naoAtend: 3474, ocup: 90,  int: 29,  docs: 7938,  hr: 55.10 },
    { dia: "02/06", ddd: "Ter", tent: 20185, atend: 11475, naoAtend: 8491, ocup: 219, int: 40,  docs: 12843, hr: 56.85 },
    { dia: "03/06", ddd: "Qua", tent: 20018, atend: 10906, naoAtend: 8931, ocup: 181, int: 57,  docs: 10448, hr: 54.48 },
    { dia: "05/06", ddd: "Sex", tent: 19654, atend: 9914,  naoAtend: 9531, ocup: 209, int: 112, docs: 12930, hr: 50.44 },
  ],
  por_dia_hora: {
    "01/06": [
      { hora: "14h", tentativas: 1744, atendidas: 1017, interesse: 0  },
      { hora: "15h", tentativas: 1280, atendidas: 715,  interesse: 4  },
      { hora: "16h", tentativas: 2589, atendidas: 1461, interesse: 20 },
      { hora: "17h", tentativas: 2314, atendidas: 1176, interesse: 4  },
      { hora: "18h", tentativas: 11,   atendidas: 5,    interesse: 0  },
    ],
    "02/06": [
      { hora: "09h", tentativas: 2088, atendidas: 1316, interesse: 0  },
      { hora: "10h", tentativas: 2467, atendidas: 1440, interesse: 6  },
      { hora: "11h", tentativas: 2413, atendidas: 1301, interesse: 6  },
      { hora: "12h", tentativas: 2093, atendidas: 951,  interesse: 9  },
      { hora: "13h", tentativas: 2221, atendidas: 1213, interesse: 8  },
      { hora: "14h", tentativas: 2374, atendidas: 1400, interesse: 4  },
      { hora: "15h", tentativas: 2249, atendidas: 1366, interesse: 2  },
      { hora: "16h", tentativas: 2293, atendidas: 1371, interesse: 0  },
      { hora: "17h", tentativas: 1983, atendidas: 1115, interesse: 3  },
      { hora: "18h", tentativas: 4,    atendidas: 2,    interesse: 0  },
    ],
    "03/06": [
      { hora: "09h", tentativas: 1963, atendidas: 1136, interesse: 15 },
      { hora: "10h", tentativas: 2397, atendidas: 1308, interesse: 7  },
      { hora: "11h", tentativas: 2390, atendidas: 1169, interesse: 4  },
      { hora: "12h", tentativas: 1926, atendidas: 923,  interesse: 6  },
      { hora: "13h", tentativas: 2151, atendidas: 1299, interesse: 2  },
      { hora: "14h", tentativas: 2243, atendidas: 1313, interesse: 4  },
      { hora: "15h", tentativas: 2396, atendidas: 1434, interesse: 3  },
      { hora: "16h", tentativas: 2572, atendidas: 1252, interesse: 8  },
      { hora: "17h", tentativas: 1955, atendidas: 1063, interesse: 8  },
      { hora: "18h", tentativas: 25,   atendidas: 9,    interesse: 0  },
    ],
    "05/06": [
      { hora: "09h", tentativas: 2334, atendidas: 1280, interesse: 12 },
      { hora: "10h", tentativas: 2357, atendidas: 1229, interesse: 11 },
      { hora: "11h", tentativas: 2267, atendidas: 1167, interesse: 10 },
      { hora: "12h", tentativas: 2164, atendidas: 958,  interesse: 9  },
      { hora: "13h", tentativas: 1953, atendidas: 883,  interesse: 15 },
      { hora: "14h", tentativas: 2330, atendidas: 1232, interesse: 15 },
      { hora: "15h", tentativas: 2307, atendidas: 1166, interesse: 17 },
      { hora: "16h", tentativas: 2205, atendidas: 1162, interesse: 17 },
      { hora: "17h", tentativas: 1734, atendidas: 836,  interesse: 6  },
      { hora: "18h", tentativas: 3,    atendidas: 0,    interesse: 0  },
    ],
  },
  status_dist: [
    { name: "Atendido",    value: 36669, cor: "#f97316" },
    { name: "Não Atendeu", value: 30427, cor: "#ef4444" },
    { name: "Ocupado",     value: 699,   cor: "#f59e0b" },
  ],
  tabulacoes: [
    { name: "Ligação caída",      qtd: 301 },
    { name: "Desligou",           qtd: 293 },
    { name: "Informação",         qtd: 250 },
    { name: "Interesse",          qtd: 238 },
    { name: "Engano",             qtd: 180 },
    { name: "Fora do perfil",     qtd: 173 },
    { name: "Ligação muda",       qtd: 100 },
    { name: "Não tabulada (CRM)", qtd: 71  },
    { name: "Retorno",            qtd: 49  },
    { name: "Caixa postal",       qtd: 10  },
    { name: "Não atende",         qtd: 7   },
    { name: "Oportunidade",       qtd: 4   },
  ],
};

// Consolidado: soma das duas campanhas
function mergeHoras(a, b) {
  const map = {};
  [...a, ...b].forEach(h => {
    if (!map[h.hora]) map[h.hora] = { hora: h.hora, tentativas: 0, atendidas: 0, interesse: 0 };
    map[h.hora].tentativas += h.tentativas;
    map[h.hora].atendidas  += h.atendidas;
    map[h.hora].interesse  += h.interesse;
  });
  return Object.values(map).sort((a, b) => a.hora.localeCompare(b.hora));
}

const _C = {
  label: "Consolidado — Ativo", carteira: "Todas",
  periodo: "01/06/2026 a 05/06/2026",
  mailing_carga: 64013, mailing_discador: 68325,
  discados_unicos: 23342, nao_discados: 44983,
  cobertura_pct: 34.16, penetracao_pct: 36.46,
  total_tentativas: 72100, atendidos: 39027, nao_atendeu: 32300, ocupado: 773,
  hit_rate_pct: 54.13, interessados: 239, contatos_decisor: 498,
  media_tent_empresa: 3.1, sem_sucesso: 22795, acordos: 0, conversao_pct: 0.0,
  por_hora: mergeHoras(_F.por_hora, _M.por_hora),
  por_dia: [
    { dia: "01/06", ddd: "Seg", tent: 12243, atend: 6732, naoAtend: 5347, ocup: 164, int: 30,  docs: 11792, hr: 54.99 },
    { dia: "02/06", ddd: "Ter", tent: 20185, atend: 11475,naoAtend: 8491, ocup: 219, int: 40,  docs: 12843, hr: 56.85 },
    { dia: "03/06", ddd: "Qua", tent: 20018, atend: 10906,naoAtend: 8931, ocup: 181, int: 57,  docs: 10448, hr: 54.48 },
    { dia: "05/06", ddd: "Sex", tent: 19654, atend: 9914, naoAtend: 9531, ocup: 209, int: 112, docs: 12930, hr: 50.44 },
  ],
  por_dia_hora: {
    "01/06": mergeHoras(_F.por_dia_hora["01/06"], _M.por_dia_hora["01/06"]),
    "02/06": _M.por_dia_hora["02/06"],
    "03/06": _M.por_dia_hora["03/06"],
    "05/06": _M.por_dia_hora["05/06"],
  },
  status_dist: [
    { name: "Atendido",    value: 39027, cor: "#f97316" },
    { name: "Não Atendeu", value: 32300, cor: "#ef4444" },
    { name: "Ocupado",     value: 773,   cor: "#f59e0b" },
  ],
  tabulacoes: [
    { name: "Ligação caída",      qtd: 312 },
    { name: "Desligou",           qtd: 295 },
    { name: "Informação",         qtd: 255 },
    { name: "Interesse",          qtd: 239 },
    { name: "Engano",             qtd: 183 },
    { name: "Fora do perfil",     qtd: 173 },
    { name: "Ligação muda",       qtd: 102 },
    { name: "Não tabulada (CRM)", qtd: 78  },
    { name: "Retorno",            qtd: 49  },
    { name: "Caixa postal",       qtd: 11  },
    { name: "Não atende",         qtd: 9   },
    { name: "Oportunidade",       qtd: 4   },
  ],
};

const CAMPANHAS = {
  "Consolidado":    _C,
  "Fiergs0106":     _F,
  "MGE_E_4_6_1063": _M,
};

// ============================================================
// FILTRO: calcula camp com dados filtrados por dia/semana
// ============================================================
function computeFilteredCamp(base, gran, sel) {
  // mensal ou sem seleção → dados totais + por_hora
  if (gran === "mensal" || sel.size === 0) {
    return { ...base, chartData: base.por_hora, xKey: "hora" };
  }

  const diasFiltrados = base.por_dia.filter(d =>
    gran === "dia" ? sel.has(d.dia) : sel.has(d.ddd)
  );
  const src = diasFiltrados.length > 0 ? diasFiltrados : base.por_dia;

  const total_tentativas  = src.reduce((s, d) => s + d.tent, 0);
  const atendidos         = src.reduce((s, d) => s + d.atend, 0);
  const nao_atendeu       = src.reduce((s, d) => s + d.naoAtend, 0);
  const ocupado           = src.reduce((s, d) => s + d.ocup, 0);
  const interessados      = src.reduce((s, d) => s + d.int, 0);
  const discados_unicos   = src.reduce((s, d) => s + d.docs, 0);
  const hit_rate_pct      = total_tentativas > 0
    ? Math.round(atendidos / total_tentativas * 10000) / 100 : 0;
  const media_tent_empresa = discados_unicos > 0
    ? Math.round(total_tentativas / discados_unicos * 10) / 10 : 0;

  // Chart: se 1 dia selecionado e temos por_dia_hora → mostrar por hora
  let chartData, xKey;
  if (gran === "dia" && src.length === 1 && base.por_dia_hora[src[0].dia]) {
    chartData = base.por_dia_hora[src[0].dia];
    xKey = "hora";
  } else {
    xKey = gran === "semana" ? "ddd" : "dia";
    chartData = src.map(d => ({
      [xKey]: gran === "semana" ? d.ddd : d.dia,
      tentativas: d.tent, atendidas: d.atend, interesse: d.int,
    }));
  }

  return {
    ...base,
    total_tentativas, atendidos, nao_atendeu, ocupado,
    interessados, discados_unicos, hit_rate_pct, media_tent_empresa,
    status_dist: [
      { name: "Atendido",    value: atendidos,  cor: "#f97316" },
      { name: "Não Atendeu", value: nao_atendeu, cor: "#ef4444" },
      { name: "Ocupado",     value: ocupado,    cor: "#f59e0b" },
    ],
    chartData, xKey,
  };
}

// ============================================================
// HELPERS
// ============================================================
const fmt = n => Number(n).toLocaleString("pt-BR");
const pct = (n, dec = 1) => Number(n).toFixed(dec).replace(".", ",") + "%";

const SECOES = [
  { id: "visaogeral",  icon: "👁",  label: "Visão Geral" },
  { id: "cobertura",   icon: "📋", label: "Cobertura Mailing" },
  { id: "esforco",     icon: "📊", label: "Esforço de Discagem" },
  { id: "qualidade",   icon: "◎",  label: "Qualidade da Base" },
  { id: "conversao",   icon: "↗",  label: "Conversão" },
  { id: "funil",       icon: "🔽", label: "Funil Operacional" },
  { id: "brprodutivo",  icon: "🇧🇷", label: "Perfil BR + Produtivo" },
  { id: "diagnostico",  icon: "🔬", label: "Diagnóstico Perfil x Discagem" },
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
function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
      padding: "18px 20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent || "#f97316" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#a0a0a0", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || "#f0f0f0", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#5a5a5a" }}>{sub}</div>}
    </div>
  );
}

// ============================================================
// TELAS
// ============================================================
function VisaoGeral({ camp }) {
  const c = camp;
  const xKey = c.xKey || "hora";
  const chartData = c.chartData || c.por_hora;
  return (
    <>
      <div style={{
        background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
        padding: "22px 26px", marginBottom: 20, position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#f97316" }} />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Ativo — Campanha {c.label}
        </div>
        <div style={{ fontSize: 13, color: "#a0a0a0", marginBottom: 20 }}>
          Carteira {c.carteira} · Dashboard de Acompanhamento Operacional
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #2a2a2a", paddingTop: 18 }}>
          {[
            { v: fmt(c.discados_unicos),   l: "Empresas Discadas" },
            { v: fmt(c.total_tentativas),  l: "Total de Tentativas" },
            { v: fmt(c.interessados),      l: "Interessados" },
            { v: pct(c.hit_rate_pct),      l: "Hit Rate" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center", padding: "6px 0",
              borderRight: i < 3 ? "1px solid #2a2a2a" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{item.v}</div>
              <div style={{ fontSize: 11, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total de Empresas"       value={fmt(c.discados_unicos)}   sub="Empresas únicas discadas"         accent="#f97316" icon="🏢" />
        <KpiCard label="Total de Tentativas"     value={fmt(c.total_tentativas)}  sub="Tentativas de contato realizadas" accent="#f97316" icon="📞" />
        <KpiCard label="Interessados"            value={fmt(c.interessados)}       sub="Empresas c/ interesse confirmado" accent="#22c55e" icon="◎" />
        <KpiCard label="Hit Rate"                value={pct(c.hit_rate_pct)}      sub={`${fmt(c.atendidos)} atendidas`}  accent="#22c55e" icon="↗" />
        <KpiCard label="Contatos com Decisor"   value={fmt(c.contatos_decisor)}   sub="Interesse + Informação"           accent="#3b82f6" icon="👤" />
        <KpiCard label="Média Tent./Empresa"    value={String(c.media_tent_empresa).replace(".", ",")} sub="Esforço médio por empresa" accent="#f97316" icon="🔁" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Distribuição por Status</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Resultado dos contatos realizados</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={c.status_dist} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" nameKey="name" paddingAngle={2}>
                {c.status_dist.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0", paddingTop: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Evolução por {xKey === "hora" ? "Hora" : xKey === "ddd" ? "Dia da Semana" : "Dia"}</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Tentativas e atendidas por período</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis dataKey={xKey} tick={{ fill: "#5a5a5a", fontSize: 11 }} />
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TabelaTabulacoes tabulacoes={c.tabulacoes} />
        <TabelaPeriodo chartData={chartData} xKey={xKey} />
      </div>
    </>
  );
}

function CoberturaMailing({ camp: c }) {
  const cargaEnv = ((c.mailing_discador / c.mailing_carga) * 100).toFixed(1);
  const funil = [
    { name: "Base Carga",       value: c.mailing_carga,    cor: "#3b82f6" },
    { name: "Enviado Discador", value: c.mailing_discador, cor: "#f97316" },
    { name: "Discados Únicos",  value: c.discados_unicos,  cor: "#22c55e" },
    { name: "Não Discados",     value: c.nao_discados,     cor: "#ef4444" },
  ];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Base Total (Carga)"    value={fmt(c.mailing_carga)}    sub="Prospecção 25/mai/26"          accent="#3b82f6" icon="📦" />
        <KpiCard label="Enviado ao Discador"   value={fmt(c.mailing_discador)} sub={`${cargaEnv}% da base total`}  accent="#f97316" icon="📤" />
        <KpiCard label="Cobertura do Discador" value={pct(c.cobertura_pct)}    sub={`${fmt(c.discados_unicos)} únicos discados`} accent="#f59e0b" icon="📊" />
        <KpiCard label="Não Discados (Gap)"    value={fmt(c.nao_discados)}     sub="Potencial remanescente"        accent="#ef4444" icon="⚠️" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Penetração vs. Carga" value={pct(c.penetracao_pct)} sub="Base total discada"        accent="#8b5cf6" icon="🎯" />
        <KpiCard label="Sem Sucesso"          value={fmt(c.sem_sucesso)}    sub="Aguardando nova tentativa" accent="#ec4899" icon="📵" />
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
              {funil.map((e, i) => <Cell key={i} fill={e.cor} />)}
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
    { label: "Esforço",  value: total,  pct: "100%",                            cor: "#f97316" },
    { label: "Atendidas",value: atend,  pct: pct(atend/total*100),               cor: "#22c55e" },
    { label: "Falhas",   value: falhas, pct: pct(falhas/total*100),              cor: "#ef4444" },
    { label: "CPC",      value: cpc,    pct: pct(atend > 0 ? cpc/atend*100 : 0), cor: "#3b82f6" },
    { label: "Acordos",  value: acordos,pct: pct(cpc > 0 ? acordos/cpc*100 : 0), cor: "#8b5cf6" },
  ];
  return (
    <>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Funil Operacional</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
          {nodes.map((n, i) => (
            <>
              <div key={n.label} style={{ background: "#222", border: `1px solid ${n.cor}55`,
                borderRadius: 8, padding: "14px 16px", textAlign: "center", minWidth: 110 }}>
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
        <KpiCard label="Total Discagens"  value={fmt(c.total_tentativas)}          sub="Esforço total"          accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas"        value={fmt(c.atendidos)}                 sub={`Hit Rate: ${pct(c.hit_rate_pct)}`} accent="#22c55e" icon="✅" />
        <KpiCard label="Não Atendidas"    value={fmt(c.nao_atendeu + c.ocupado)}   sub="Falhas + Ocupado"       accent="#ef4444" icon="❌" />
        <KpiCard label="CPC"              value={fmt(c.interessados)}              sub="Contatos qualificados"  accent="#3b82f6" icon="🎯" />
        <KpiCard label="Acordos"          value={fmt(c.acordos)}                   sub="Fechamentos"            accent="#8b5cf6" icon="🤝" />
        <KpiCard label="Conversão"        value={pct(c.conversao_pct)}             sub="CPC → Acordo"           accent="#ec4899" icon="💹" />
      </div>
    </>
  );
}

function EsforcoDicagem({ camp: c }) {
  const xKey = c.xKey || "hora";
  const chartData = c.chartData || c.por_hora;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total Tentativas"       value={fmt(c.total_tentativas)} sub="Chamadas realizadas"      accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas"              value={fmt(c.atendidos)}        sub={`${pct(c.hit_rate_pct)} hit rate`} accent="#22c55e" icon="✅" />
        <KpiCard label="Não Atendeu"            value={fmt(c.nao_atendeu)}      sub="Sem contato"             accent="#ef4444" icon="📵" />
        <KpiCard label="Ocupado"                value={fmt(c.ocupado)}          sub="Linha ocupada"           accent="#f59e0b" icon="🔴" />
        <KpiCard label="Média Tent./Empresa"   value={String(c.media_tent_empresa).replace(".", ",")} sub="Esforço médio" accent="#3b82f6" icon="🔁" />
        <KpiCard label="Sem Sucesso"            value={fmt(c.sem_sucesso)}      sub="Aguardando retorno"      accent="#ec4899" icon="⚠️" />
      </div>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Discagens por {xKey === "hora" ? "Hora" : xKey === "ddd" ? "Dia da Semana" : "Dia"} — Detalhe</div>
        <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Atendidas vs. Não atendidas por período</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#2a2a2a" />
            <XAxis dataKey={xKey} tick={{ fill: "#5a5a5a", fontSize: 11 }} />
            <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0" }} />
            <Bar dataKey="atendidas"  name="Atendidas"       stackId="a" fill="#22c55e" />
            <Bar dataKey="tentativas" name="Tentativas Total" stackId="a" fill="#f97316" opacity={0.5} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function TabelaTabulacoes({ tabulacoes }) {
  const total = tabulacoes.reduce((a, b) => a + b.qtd, 0);
  const max   = Math.max(...tabulacoes.map(t => t.qtd));
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

function TabelaPeriodo({ chartData, xKey }) {
  const colLabel = xKey === "hora" ? "Hora" : xKey === "ddd" ? "Dia Semana" : "Dia";
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Resultado por {colLabel}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {[colLabel, "Tentativas", "Atendidas", "Hit Rate"].map(h => (
              <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#5a5a5a", textTransform: "uppercase",
                letterSpacing: 1, padding: "6px 8px", borderBottom: "1px solid #2a2a2a",
                textAlign: h === colLabel ? "left" : "right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.map((r, i) => {
            const label = r[xKey] || r.hora || r.dia || r.ddd;
            const tent  = r.tentativas || 0;
            const atend = r.atendidas  || 0;
            const hr    = tent > 0 ? pct(atend / tent * 100) : "0%";
            return (
              <tr key={i}>
                <td style={{ padding: "8px", borderBottom: "1px solid #222", color: "#f0f0f0", fontWeight: 600 }}>{label}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#a0a0a0" }}>{fmt(tent)}</td>
                <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #222", color: "#22c55e", fontWeight: 600 }}>{fmt(atend)}</td>
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
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function App() {
  const [campKey, setCampKey] = useState("Consolidado");
  const [secao,   setSecao]   = useState("visaogeral");
  const [gran,    setGran]    = useState("mensal");
  const [sel,     setSel]     = useState(new Set());

  const base = CAMPANHAS[campKey];

  // Dias disponíveis na campanha atual
  const diasDisponiveis = useMemo(() => base.por_dia, [base]);

  // Toggle chip na seleção múltipla
  const toggleSel = (val) => {
    setSel(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  // Ao trocar campanha ou granularidade, limpar seleção
  const handleCampChange = (key) => { setCampKey(key); setSel(new Set()); };
  const handleGranChange = (g)   => { setGran(g);     setSel(new Set()); };

  const camp = useMemo(
    () => computeFilteredCamp(base, gran, sel),
    [base, gran, sel]
  );

  // Label dinâmico do período
  const periodoLabel = useMemo(() => {
    if (gran === "mensal" || sel.size === 0) {
      const d = diasDisponiveis[0];
      if (!d) return base.periodo;
      const [, m, y] = d.dia.split("/");
      return `${MESES[+m - 1]}/${y}`;
    }
    const itens = [...sel].sort();
    return itens.join(" · ");
  }, [gran, sel, diasDisponiveis, base.periodo]);

  // Chips de seleção disponíveis
  const chipsDisponiveis = useMemo(() => {
    if (gran === "dia")    return diasDisponiveis.map(d => ({ val: d.dia, label: `${d.dia} ${d.ddd}` }));
    if (gran === "semana") {
      const seen = new Set();
      return diasDisponiveis
        .filter(d => { if (seen.has(d.ddd)) return false; seen.add(d.ddd); return true; })
        .map(d => ({ val: d.ddd, label: d.ddd }));
    }
    return [];
  }, [gran, diasDisponiveis]);

  const renderSecao = () => {
    switch (secao) {
      case "visaogeral": return <VisaoGeral camp={camp} />;
      case "cobertura":  return <CoberturaMailing camp={camp} />;
      case "esforco":    return <EsforcoDicagem camp={camp} />;
      case "funil":       return <FunilOperacional camp={camp} />;
      case "brprodutivo":  return <BrMaisProdutivo />;
      case "diagnostico":  return <DiagnosticoDiscagem />;
      case "conversao":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <KpiCard label="Interessados"       value={fmt(camp.interessados)}                        sub="Empresas com interesse"    accent="#22c55e" icon="◎" />
            <KpiCard label="Acordos"            value={fmt(camp.acordos)}                             sub="Fechamentos confirmados"   accent="#8b5cf6" icon="🤝" />
            <KpiCard label="Taxa de Conversão"  value={pct(camp.conversao_pct)}                       sub="Acordos / Interessados"    accent="#ec4899" icon="💹" />
            <KpiCard label="Valor Total"        value="R$ 0,00"                                       sub="Receita acordos"           accent="#f59e0b" icon="💰" />
            <KpiCard label="Contatos Decisor"   value={fmt(camp.contatos_decisor)}                    sub="CPC efetivo"               accent="#3b82f6" icon="👤" />
            <KpiCard label="Não CPC"            value={fmt(camp.atendidos - camp.contatos_decisor)}   sub="Atendidos sem qualif."     accent="#ef4444" icon="❌" />
          </div>
        );
      case "qualidade":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <KpiCard label="Base Carga Total"   value={fmt(camp.mailing_carga)}    sub="Prospecção completa"   accent="#3b82f6" icon="📦" />
            <KpiCard label="Enviado ao Discador" value={fmt(camp.mailing_discador)} sub="Ativo no sistema"      accent="#f97316" icon="📤" />
            <KpiCard label="Cobertura"          value={pct(camp.cobertura_pct)}    sub="Discados / enviado"    accent="#22c55e" icon="📊" />
            <KpiCard label="Penetração"         value={pct(camp.penetracao_pct)}   sub="vs. base carga"        accent="#8b5cf6" icon="🎯" />
            <KpiCard label="Gap Remanescente"   value={fmt(camp.nao_discados)}     sub="Ainda não discados"    accent="#ef4444" icon="⚠️" />
            <KpiCard label="Sem Sucesso"        value={fmt(camp.sem_sucesso)}      sub="Sem contato efetivo"   accent="#ec4899" icon="📵" />
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
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #2a2a2a", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "#f97316", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 8px", borderRadius: 6 }}>DDM</span>
          <span style={{ background: "#1e3a8a", color: "#fff", fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 6 }}>FIERGS</span>
        </div>

        <div style={{ padding: "14px 12px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 6,
            fontSize: 13, marginBottom: 2, background: "rgba(249,115,22,.15)", color: "#f97316", fontWeight: 600 }}>
            <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>⚡</span>
            Ativo
          </div>
        </div>

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
          padding: "10px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, gap: 12, flexWrap: "wrap",
        }}>
          {/* LEFT: seletor de campanha */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#5a5a5a" }}>Campanha</span>
            <select value={campKey} onChange={e => handleCampChange(e.target.value)} style={{
              background: "#222", border: "1px solid #2a2a2a", color: "#f0f0f0",
              fontFamily: "Inter, sans-serif", fontSize: 13, padding: "6px 12px",
              borderRadius: 6, cursor: "pointer", minWidth: 220, appearance: "none",
            }}>
              {Object.entries(CAMPANHAS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* RIGHT: filtros de granularidade + chips + período */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {/* Botões de granularidade */}
            {[
              { key: "mensal",  label: "Mensal" },
              { key: "dia",     label: "Dia" },
              { key: "semana",  label: "Semana" },
            ].map(g => (
              <button key={g.key} onClick={() => handleGranChange(g.key)} style={{
                background: gran === g.key ? "rgba(249,115,22,.2)" : "transparent",
                border: `1px solid ${gran === g.key ? "rgba(249,115,22,.5)" : "#2a2a2a"}`,
                color: gran === g.key ? "#f97316" : "#5a5a5a",
                fontSize: 11, fontWeight: gran === g.key ? 700 : 500,
                padding: "5px 12px", borderRadius: 5, cursor: "pointer",
                fontFamily: "Inter, sans-serif", transition: "all .15s",
              }}>{g.label}</button>
            ))}

            {/* Chips de multi-seleção */}
            {chipsDisponiveis.length > 0 && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 4 }}>
                <span style={{ fontSize: 10, color: "#3a3a3a", marginRight: 2 }}>|</span>
                {chipsDisponiveis.map(c => {
                  const ativo = sel.has(c.val);
                  return (
                    <button key={c.val} onClick={() => toggleSel(c.val)} style={{
                      background: ativo ? "rgba(34,197,94,.2)" : "#1a1a1a",
                      border: `1px solid ${ativo ? "rgba(34,197,94,.5)" : "#2a2a2a"}`,
                      color: ativo ? "#22c55e" : "#5a5a5a",
                      fontSize: 11, fontWeight: ativo ? 700 : 400,
                      padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                      fontFamily: "Inter, sans-serif", transition: "all .15s",
                    }}>{c.label}</button>
                  );
                })}
              </div>
            )}

            {/* Label dinâmico do período */}
            <span style={{
              background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.25)",
              color: "#f97316", fontSize: 11, fontWeight: 600,
              padding: "5px 12px", borderRadius: 5, marginLeft: 4,
              minWidth: 80, textAlign: "center",
            }}>
              {periodoLabel}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {SECOES.find(s => s.id === secao)?.icon} {SECOES.find(s => s.id === secao)?.label}
          </div>
          {renderSecao()}
        </div>

        <div style={{ padding: "14px 28px", borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#3a3a3a" }}>DDM COBRANÇAS · FIERGS · Carteira {camp.carteira}</span>
          <span style={{ fontSize: 11, color: "#3a3a3a" }}>Dados: {camp.periodo}</span>
        </div>
      </div>
    </div>
  );
}
