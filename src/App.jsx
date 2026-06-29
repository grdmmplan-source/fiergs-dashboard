
import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, ComposedChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import BrMaisProdutivo from "./BrMaisProdutivo.jsx";
import DiagnosticoDiscagem from "./DiagnosticoDiscagem.jsx";
import PerformanceAgente from "./PerformanceAgente.jsx";
import { _F, _M } from "./dados.js";

// ============================================================
// CONSOLIDADO — calculado dinamicamente a partir de _F e _M
// ============================================================
function mergeHoras(a, b) {
  const map = {};
  [...(a||[]), ...(b||[])].forEach(h => {
    if (!map[h.hora]) map[h.hora] = { hora: h.hora, tentativas: 0, atendidas: 0, interesse: 0 };
    map[h.hora].tentativas += h.tentativas;
    map[h.hora].atendidas  += h.atendidas;
    map[h.hora].interesse  += h.interesse;
  });
  return Object.values(map).sort((a, b) => a.hora.localeCompare(b.hora));
}

function mergeDias(a, b) {
  const map = {};
  [...(a||[]), ...(b||[])].forEach(d => {
    if (!map[d.dia]) map[d.dia] = { dia: d.dia, ddd: d.ddd, tent: 0, atend: 0, naoAtend: 0, falha: 0, ocup: 0, int: 0, docs: 0 };
    map[d.dia].tent     += d.tent;
    map[d.dia].atend    += d.atend;
    map[d.dia].naoAtend += d.naoAtend;
    map[d.dia].falha    += (d.falha || 0);
    map[d.dia].ocup     += d.ocup;
    map[d.dia].int      += d.int;
    map[d.dia].docs     += d.docs;
  });
  const days = Object.values(map).sort((a, b) => a.dia.localeCompare(b.dia));
  days.forEach(d => { d.hr = d.tent > 0 ? Math.round(d.atend / d.tent * 10000) / 100 : 0; });
  return days;
}

function mergePorDiaHora(fDH, mDH) {
  const allDates = new Set([...Object.keys(fDH || {}), ...Object.keys(mDH || {})]);
  const result = {};
  allDates.forEach(dia => { result[dia] = mergeHoras((fDH||{})[dia] || [], (mDH||{})[dia] || []); });
  return result;
}

function mergeTabList(a, b) {
  const map = {};
  [...(a||[]), ...(b||[])].forEach(t => {
    if (!map[t.name]) map[t.name] = { name: t.name, qtd: 0 };
    map[t.name].qtd += t.qtd;
  });
  return Object.values(map).sort((a, b) => b.qtd - a.qtd);
}

const _Ctent  = _F.total_tentativas + _M.total_tentativas;
const _Catend = _F.atendidos + _M.atendidos;
const _Cdocs  = _F.discados_unicos + _M.discados_unicos;
const _Cdisc  = _F.mailing_discador + _M.mailing_discador;

const _C = {
  label: "Consolidado — Ativo", carteira: "Todas",
  periodo: _M.periodo,
  mailing_carga: 64013,
  mailing_discador: _Cdisc,
  discados_unicos: _Cdocs,
  nao_discados: _F.nao_discados + _M.nao_discados,
  cobertura_pct: Math.round(_Cdocs / _Cdisc * 10000) / 100,
  penetracao_pct: Math.round(_Cdocs / 64013 * 10000) / 100,
  total_tentativas: _Ctent,
  atendidos: _Catend,
  nao_atendeu: _F.nao_atendeu + _M.nao_atendeu,
  falha_telefonia: _F.falha_telefonia + _M.falha_telefonia,
  ocupado: _F.ocupado + _M.ocupado,
  hit_rate_pct: Math.round(_Catend / _Ctent * 10000) / 100,
  cpc: _F.cpc + _M.cpc,
  cpca: _F.cpca + _M.cpca,
  pct_cpc:  Math.round((_F.cpc  + _M.cpc)  / _Catend * 10000) / 100,
  pct_cpca: Math.round((_F.cpca + _M.cpca) / (_F.cpc + _M.cpc) * 10000) / 100,
  interessados: _F.interessados + _M.interessados,
  contatos_decisor: _F.contatos_decisor + _M.contatos_decisor,
  media_tent_empresa: Math.round(_Ctent / _Cdocs * 10) / 10,
  sem_sucesso: _F.sem_sucesso + _M.sem_sucesso,
  acordos: 0, conversao_pct: 0,
  por_hora: mergeHoras(_F.por_hora, _M.por_hora),
  por_dia: mergeDias(_F.por_dia, _M.por_dia),
  por_dia_hora: mergePorDiaHora(_F.por_dia_hora, _M.por_dia_hora),
  status_dist: [
    { name: "Atendido",        value: _F.atendidos       + _M.atendidos,       cor: "#22c55e" },
    { name: "Falha Telefonia", value: _F.falha_telefonia + _M.falha_telefonia, cor: "#ef4444" },
    { name: "Não Atendeu",     value: _F.nao_atendeu     + _M.nao_atendeu,     cor: "#6b7280" },
    { name: "Ocupado",         value: _F.ocupado         + _M.ocupado,         cor: "#f59e0b" },
  ],
  tabulacoes: mergeTabList(_F.tabulacoes, _M.tabulacoes),
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

  const total_tentativas   = src.reduce((s, d) => s + d.tent, 0);
  const atendidos          = src.reduce((s, d) => s + d.atend, 0);
  const nao_atendeu        = src.reduce((s, d) => s + d.naoAtend, 0);
  const falha_telefonia    = src.reduce((s, d) => s + (d.falha || 0), 0);
  const ocupado            = src.reduce((s, d) => s + d.ocup, 0);
  const interessados       = src.reduce((s, d) => s + d.int, 0);
  const discados_unicos    = src.reduce((s, d) => s + d.docs, 0);
  const hit_rate_pct       = total_tentativas > 0
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
    total_tentativas, atendidos, nao_atendeu, falha_telefonia, ocupado,
    interessados, discados_unicos, hit_rate_pct, media_tent_empresa,
    status_dist: [
      { name: "Atendido",        value: atendidos,       cor: "#22c55e" },
      { name: "Falha Telefonia", value: falha_telefonia, cor: "#ef4444" },
      { name: "Não Atendeu",     value: nao_atendeu,     cor: "#6b7280" },
      { name: "Ocupado",         value: ocupado,         cor: "#f59e0b" },
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
  { id: "visaogeral",        icon: "👁",  label: "Visão Geral",                   short: "Visão"       },
  { id: "cobertura",         icon: "📋", label: "Cobertura Mailing",              short: "Cobertura"   },
  { id: "esforco",           icon: "📊", label: "Esforço de Discagem",            short: "Esforço"     },
  { id: "conversao",         icon: "↗",  label: "Conversão",                      short: "Conversão"   },
  { id: "coberturaempresas", icon: "🏢", label: "Cobertura Empresas",             short: "Empresas"    },
  { id: "brprodutivo",       icon: "🇧🇷", label: "Perfil BR + Produtivo",         short: "BR+Prod"     },
  { id: "diagnostico",       icon: "🔬", label: "Diagnóstico Perfil x Discagem",  short: "Diagnóstico" },
  { id: "performanceagente", icon: "👤", label: "Performance Agente",             short: "Agente"      },
  { id: "exportar",          icon: "⬇",  label: "Exportar Dados",                short: "Exportar"    },
];

// Módulos que participam da rotação do Modo Painel (sem Exportar)
const MODULOS_PAINEL = SECOES.filter(s => s.id !== "exportar").map(s => s.id);

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
      {sub && <div style={{ fontSize: 11, color: "#9a9a9a" }}>{sub}</div>}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", borderTop: "1px solid #2a2a2a", paddingTop: 18 }}>
          {[
            { v: fmt(c.discados_unicos),   l: "Empresas Discadas" },
            { v: fmt(c.total_tentativas),  l: "Total de Tentativas" },
            { v: fmt(c.atendidos),         l: "Atendidas" },
            { v: fmt(c.interessados),      l: "Interessados" },
            { v: pct(c.cpc > 0 ? c.cpca / c.cpc * 100 : 0), l: "% Conversão" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center", padding: "6px 0",
              borderRight: i < 4 ? "1px solid #2a2a2a" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{item.v}</div>
              <div style={{ fontSize: 11, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{item.l}</div>
            </div>
          ))}
        </div>
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
              <XAxis dataKey={xKey} tick={{ fill: "#9a9a9a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9a9a9a", fontSize: 11 }} />
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
            <XAxis type="number" tick={{ fill: "#9a9a9a", fontSize: 11 }} />
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
  const falhaTel = c.falha_telefonia || 0;
  const falhas = c.nao_atendeu + c.ocupado;
  const cpc = c.interessados;
  const acordos = c.acordos;
  const nodes = [
    { label: "Esforço",        value: total,    pct: "100%",                             cor: "#f97316" },
    { label: "Atendidas",      value: atend,    pct: pct(atend/total*100),                cor: "#22c55e" },
    { label: "Falha Telefonia",value: falhaTel, pct: pct(falhaTel/total*100),             cor: "#ef4444" },
    { label: "Não Atendeu",    value: falhas,   pct: pct(falhas/total*100),               cor: "#6b7280" },
    { label: "CPC",            value: cpc,      pct: pct(atend > 0 ? cpc/atend*100 : 0), cor: "#3b82f6" },
    { label: "Acordos",        value: acordos,  pct: pct(cpc > 0 ? acordos/cpc*100 : 0), cor: "#8b5cf6" },
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
                <div style={{ fontSize: 10, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: 0.5 }}>{n.label}</div>
              </div>
              {i < nodes.length - 1 && <div key={`arr${i}`} style={{ color: "#333", fontSize: 22, flexShrink: 0 }}>→</div>}
            </>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KpiCard label="Total Discagens"   value={fmt(c.total_tentativas)}            sub="Esforço total"                   accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas"         value={fmt(c.atendidos)}                   sub={`Hit Rate: ${pct(c.hit_rate_pct)}`} accent="#22c55e" icon="✅" />
        <KpiCard label="Falha Telefonia"   value={fmt(c.falha_telefonia || 0)}        sub="ISDN 128 / 131 / 147"            accent="#ef4444" icon="⚡" />
        <KpiCard label="Não Atendeu"       value={fmt(c.nao_atendeu + c.ocupado)}     sub="Sem contato + Ocupado"           accent="#6b7280" icon="❌" />
        <KpiCard label="CPC"               value={fmt(c.interessados)}                sub="Contatos qualificados"           accent="#3b82f6" icon="🎯" />
        <KpiCard label="Acordos"           value={fmt(c.acordos)}                     sub="Fechamentos"                     accent="#8b5cf6" icon="🤝" />
      </div>
    </>
  );
}

function EsforcoDicagem({ camp: c }) {
  const xKey = c.xKey || "hora";
  const chartData = c.chartData || c.por_hora;
  const esforcoData = chartData.map(d => ({
    ...d,
    esforco: d.atendidas > 0 ? Math.round(d.tentativas / d.atendidas * 10) / 10 : 0,
  }));
  const diaData = c.por_dia.map(d => ({
    dia: d.dia, ddd: d.ddd, tent: d.tent, atend: d.atend,
    esforco: d.atend > 0 ? Math.round(d.tent / d.atend * 10) / 10 : 0,
  }));
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total Tentativas"      value={fmt(c.total_tentativas)}   sub="Chamadas realizadas"              accent="#f97316" icon="📞" />
        <KpiCard label="Atendidas"             value={fmt(c.atendidos)}          sub={`${pct(c.hit_rate_pct)} hit rate`} accent="#22c55e" icon="✅" />
        <KpiCard label="Falha Telefonia"       value={fmt(c.falha_telefonia||0)} sub="ISDN 128/131/147 — erro de rota"   accent="#ef4444" icon="⚡" />
        <KpiCard label="Não Atendeu"           value={fmt(c.nao_atendeu)}        sub="Sem contato real"                 accent="#6b7280" icon="📵" />
        <KpiCard label="Ocupado"               value={fmt(c.ocupado)}            sub="Linha ocupada"                    accent="#f59e0b" icon="🔴" />
        <KpiCard label="Média Tent./Empresa"   value={String(c.media_tent_empresa).replace(".", ",")} sub="Esforço médio" accent="#3b82f6" icon="🔁" />
      </div>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Discagens por {xKey === "hora" ? "Hora" : xKey === "ddd" ? "Dia da Semana" : "Dia"} — Detalhe</div>
        <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Atendidas, Tentativas e Esforço (tent./atend.) por período</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={esforcoData}>
            <CartesianGrid stroke="#2a2a2a" />
            <XAxis dataKey={xKey} tick={{ fill: "#9a9a9a", fontSize: 11 }} />
            <YAxis yAxisId="left"  tick={{ fill: "#9a9a9a", fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a855f7", fontSize: 11 }} unit="x" />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0" }} />
            <Bar yAxisId="left" dataKey="atendidas"  name="Atendidas"        stackId="a" fill="#22c55e" />
            <Bar yAxisId="left" dataKey="tentativas" name="Tentativas Total"  stackId="a" fill="#f97316" opacity={0.5} radius={[3,3,0,0]} />
            <Line yAxisId="right" dataKey="esforco" name="Esforço (tent/atend)" stroke="#a855f7" strokeWidth={2}
              dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {diaData.length > 1 && (
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Evolução Diária — Detalhe</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 16 }}>Tentativas, atendidas e esforço por dia</div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={diaData}>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis dataKey="dia" tick={{ fill: "#9a9a9a", fontSize: 11 }} />
              <YAxis yAxisId="left"  tick={{ fill: "#9a9a9a", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a855f7", fontSize: 11 }} unit="x" />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a0a0" }} />
              <Bar yAxisId="left" dataKey="tent"  name="Tentativas" fill="#f97316" opacity={0.7} radius={[3,3,0,0]} />
              <Bar yAxisId="left" dataKey="atend" name="Atendidas"  fill="#22c55e" opacity={0.9} radius={[3,3,0,0]} />
              <Line yAxisId="right" dataKey="esforco" name="Esforço (tent/atend)" stroke="#a855f7" strokeWidth={2}
                dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
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
              <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9a9a9a", textTransform: "uppercase",
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
              <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9a9a9a", textTransform: "uppercase",
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
// COBERTURA EMPRESAS
// ============================================================
function CoberturaEmpresas({ camp }) {
  const colunas = [
    { key: "Consolidado",    data: _C },
    { key: "Fiergs0106",     data: _F },
    { key: "MGE_E_4_6_1063", data: _M },
  ];
  const rows = [
    { label: "Empresas Discadas",  fn: c => fmt(c.discados_unicos) },
    { label: "Tentativas",        fn: c => fmt(c.total_tentativas) },
    { label: "Alô (Atendidos)",   fn: c => fmt(c.atendidos) },
    { label: "Hit Rate",          fn: c => pct(c.hit_rate_pct) },
    { label: "CPC",               fn: c => fmt(c.cpc) },
    { label: "CPCA",              fn: c => fmt(c.cpca) },
    { label: "% Conversão (CPCA/CPC)", fn: c => pct(c.cpc > 0 ? c.cpca / c.cpc * 100 : 0) },
  ];
  return (
    <>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Comparativo por Campanha</div>
        <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 20 }}>Empresas · Tentativas · Alô · CPC · CPCA · Conversão</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #333", color: "#9a9a9a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Indicador</th>
              {colunas.map(col => (
                <th key={col.key} style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #333", color: col.key === "Consolidado" ? "#f97316" : "#a0a0a0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  {col.data.label.replace(" - Ativo","").replace(" — Ativo","")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #222", color: "#d0d0d0", fontWeight: 500 }}>{row.label}</td>
                {colunas.map(col => (
                  <td key={col.key} style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #222",
                    color: col.key === "Consolidado" ? "#f0f0f0" : "#a0a0a0", fontWeight: col.key === "Consolidado" ? 700 : 400 }}>
                    {row.fn(col.data)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {camp.por_dia.length > 0 && (
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Evolução Diária — {camp.label}</div>
          <div style={{ fontSize: 12, color: "#a0a0a0", marginBottom: 20 }}>Empresas discadas, alô e interesse por dia</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Dia", "Semana", "Empresas", "Tentativas", "Alô", "% Alô", "Interesse"].map(h => (
                  <th key={h} style={{ textAlign: h === "Dia" || h === "Semana" ? "left" : "right", padding: "6px 10px", borderBottom: "1px solid #333", color: "#9a9a9a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {camp.por_dia.map((d, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #222", color: "#f0f0f0", fontWeight: 600 }}>{d.dia}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid #222", color: "#9a9a9a" }}>{d.ddd}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #222", color: "#a0a0a0" }}>{fmt(d.docs)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #222", color: "#a0a0a0" }}>{fmt(d.tent)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #222", color: "#22c55e", fontWeight: 600 }}>{fmt(d.atend)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #222", color: "#f97316" }}>{pct(d.hr)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #222", color: "#a855f7" }}>{fmt(d.int)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ============================================================
// EXPORTAR DADOS
// ============================================================
function ExportarDados() {
  const downloadCSV = (filename, rows) => {
    const content = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportInteressados = () => {
    const rows = [["Campanha", "Carteira", "Status", "Quantidade"]];
    [_F, _M].forEach(camp => {
      camp.tabulacoes
        .filter(t => t.name === "Interesse" || t.name === "Oportunidade")
        .forEach(t => rows.push([camp.label, camp.carteira, t.name, t.qtd]));
    });
    downloadCSV("interessados_oportunidades.csv", rows);
  };

  const exportDiscagem = () => {
    const rows = [["Campanha", "Carteira", "Periodo", "Dia", "DiaSemana", "Empresas", "Tentativas", "Atendidos", "Nao_Atendeu", "Falha_Telefonia", "Ocupado", "Interesse", "HitRate_pct"]];
    [_F, _M].forEach(camp => {
      camp.por_dia.forEach(d => {
        rows.push([camp.label, camp.carteira, camp.periodo, d.dia, d.ddd, d.docs, d.tent, d.atend, d.naoAtend, d.falha||0, d.ocup, d.int, d.hr]);
      });
    });
    downloadCSV("discagem_fila_resumo.csv", rows);
  };

  const BtnExport = ({ label, sub, icon, onClick, color }) => (
    <div style={{ background: "#1a1a1a", border: `1px solid ${color}44`, borderRadius: 10, padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{icon} {label}</div>
      <div style={{ fontSize: 12, color: "#9a9a9a", lineHeight: 1.5 }}>{sub}</div>
      <button onClick={onClick} style={{
        marginTop: 8, background: color, border: "none", color: "#fff",
        fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700,
        padding: "10px 20px", borderRadius: 6, cursor: "pointer", alignSelf: "flex-start",
      }}>
        Baixar CSV
      </button>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <BtnExport
          label="Interessados e Oportunidades"
          sub="Exporta o total de contatos classificados como Interesse ou Oportunidade, agrupados por campanha e carteira."
          icon="◎" color="#22c55e"
          onClick={exportInteressados}
        />
        <BtnExport
          label="Resumo Discagem Fila"
          sub="Exporta a evolução diária de discagem: empresas, tentativas, atendidos, falhas e interesse por dia e campanha."
          icon="📋" color="#3b82f6"
          onClick={exportDiscagem}
        />
      </div>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, color: "#9a9a9a", lineHeight: 1.8 }}>
          <strong style={{ color: "#d0d0d0" }}>Arquivo CSV completo (Discagem_Fila.csv)</strong><br />
          O arquivo bruto com todos os registros encontra-se em:<br />
          <code style={{ background: "#111", padding: "4px 8px", borderRadius: 4, color: "#f97316", fontSize: 12 }}>
            C:\1Claude\FIERGS\Arquivos\Discagem_Fila.csv
          </code>
        </div>
      </div>
    </>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function App() {
  const [campKey,    setCampKey]    = useState("Consolidado");
  const [secao,      setSecao]      = useState("visaogeral");
  const [gran,       setGran]       = useState("mensal");
  const [sel,        setSel]        = useState(new Set());
  const [modopainel, setModopainel] = useState(false);
  const [contagem,   setContagem]   = useState(10);
  const secaoRef = useRef(secao);
  secaoRef.current = secao;

  // Timer de rotação do Modo Painel — avança módulo a cada 10 s
  useEffect(() => {
    if (!modopainel) { setContagem(10); return; }
    setContagem(10);
    const interval = setInterval(() => {
      setContagem(prev => {
        if (prev <= 1) {
          const idx = MODULOS_PAINEL.indexOf(secaoRef.current);
          setSecao(MODULOS_PAINEL[(idx + 1) % MODULOS_PAINEL.length]);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [modopainel]);

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
      case "brprodutivo":       return <BrMaisProdutivo />;
      case "diagnostico":       return <DiagnosticoDiscagem />;
      case "performanceagente": return <PerformanceAgente />;
      case "coberturaempresas": return <CoberturaEmpresas camp={camp} />;
      case "exportar":          return <ExportarDados />;
      case "conversao":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <KpiCard label="Interessados"      value="—" sub="Em apuração"          accent="#22c55e" icon="◎" />
            <KpiCard label="Acordos"           value="—" sub="Em apuração"          accent="#8b5cf6" icon="🤝" />
            <KpiCard label="Taxa de Conversão" value="—" sub="Em apuração"          accent="#ec4899" icon="💹" />
            <KpiCard label="Valor Total"       value="—" sub="Em apuração"          accent="#f59e0b" icon="💰" />
            <KpiCard label="CPC"               value="—" sub="Em apuração"          accent="#3b82f6" icon="👤" />
            <KpiCard label="CPCA"              value="—" sub="Em apuração"          accent="#ef4444" icon="🎯" />
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
          <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: 1, padding: "0 4px" }}>
            Módulos na barra superior ↑
          </div>
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
            <span style={{ fontSize: 12, color: "#9a9a9a" }}>Campanha</span>
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
                color: gran === g.key ? "#f97316" : "#9a9a9a",
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
                      color: ativo ? "#22c55e" : "#9a9a9a",
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

        {/* BARRA DE MÓDULOS */}
        <div style={{
          background: "#0f0f0f", borderBottom: "1px solid #2a2a2a",
          padding: "0 28px", display: "flex", alignItems: "center",
          gap: 4, position: "sticky", top: 57, zIndex: 49, overflowX: "auto",
        }}>
          {SECOES.map(s => {
            const ativo = secao === s.id;
            return (
              <button key={s.id} onClick={() => { setSecao(s.id); if (modopainel) setModopainel(false); }} style={{
                background: "transparent",
                borderBottom: ativo ? "2px solid #f97316" : "2px solid transparent",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                color: ativo ? "#f97316" : "#6a6a6a",
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: ativo ? 700 : 500,
                padding: "10px 14px", cursor: "pointer", whiteSpace: "nowrap",
                transition: "all .15s",
              }}>
                {s.icon} {s.short}
              </button>
            );
          })}

          {/* Separador */}
          <div style={{ flex: 1 }} />

          {/* Botão Modo Painel */}
          <button onClick={() => setModopainel(p => !p)} style={{
            background: modopainel ? "rgba(168,85,247,.2)" : "rgba(249,115,22,.1)",
            border: `1px solid ${modopainel ? "rgba(168,85,247,.5)" : "rgba(249,115,22,.3)"}`,
            color: modopainel ? "#a855f7" : "#f97316",
            fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700,
            padding: "5px 14px", borderRadius: 6, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, margin: "0 0 0 8px",
            transition: "all .2s",
          }}>
            {modopainel ? "⏸" : "▶"} Modo Painel
            {modopainel && (
              <span style={{
                background: "#a855f7", color: "#fff", fontSize: 11, fontWeight: 800,
                borderRadius: 10, padding: "1px 7px", minWidth: 24, textAlign: "center",
              }}>{contagem}s</span>
            )}
          </button>
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
