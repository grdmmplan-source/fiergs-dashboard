import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend, ScatterChart, Scatter, ReferenceLine
} from "recharts";

const NAVY = "#141414";
const GREEN = "#22c55e";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const ORANGE = "#f97316";
const PURPLE = "#a855f7";
const LIGHT = "#f0f0f0";
const CARD = "#1a1a1a";
const BORDER = "#2a2a2a";

// ─── DATA (dinâmico — gerado por atualizar.ps1 em src/dados.js) ────────────────
import { _D } from "./dados.js";

const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");

const agentes = _D.agentes;

// Eixo de dias e dia-da-semana (derivados de _D)
const DIAS = _D.dias || [];
const DIA_SEM = {};
_D.por_dia.forEach(d => {
  const m = /^(\d{2}\/\d{2})\s*\(([^)]+)\)/.exec(d.dia);
  if (m) DIA_SEM[m[1]] = m[2];
});

// Top agentes com série diária (positivos + volume)
const topAgD = _D.agente_dia || [];

// Paleta para as linhas/colunas por agente (chaveado por 1º nome)
const PALETTE = ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#a855f7", "#06b6d4", "#ec4899", "#84cc16"];
const AGENT_COLORS = {};
topAgD.forEach((a, i) => { AGENT_COLORS[a.primeiro] = PALETTE[i % PALETTE.length]; });

// Evolução diária de positivos: uma linha por dia, uma coluna por agente (1º nome)
const evolucaoDiaria = DIAS.map(dia => {
  const row = { dia };
  topAgD.forEach(a => {
    const dd = a.dias.find(x => x.dia === dia);
    row[a.primeiro] = dd ? dd.pos : 0;
  });
  return row;
});

const periodoTxt = _D.resumo.periodo;
const diasTrab = _D.resumo.diasTrabalhados;
const nAgentesAtivos = agentes.filter(a => a.total > 100).length;

// Compute derived metrics
const agentesComp = agentes.map(ag => {
  const positivos = ag.interesse + ag.oportunidade + ag.retorno;
  const taxaInt = ag.convReal > 0 ? +((ag.interesse + ag.oportunidade) / ag.convReal * 100).toFixed(1) : 0;
  const taxaPos = ag.convReal > 0 ? +(positivos / ag.convReal * 100).toFixed(1) : 0;
  const taxaConv = ag.convReal > 0 ? +(ag.interesse / ag.convReal * 100).toFixed(1) : 0;
  return { ...ag, positivos, taxaInt, taxaPos, taxaConv };
});

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color = GREEN, size = "normal" }) {
  return (
    <div style={{
      background: CARD, borderRadius: 10, position: "relative", overflow: "hidden",
      border: `1px solid ${BORDER}`,
      padding: size === "big" ? "18px 20px" : "14px 18px",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color }} />
      <div style={{ fontSize: 12, color: "#a0a0a0", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ color, fontSize: size === "big" ? 28 : 22, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9a9a9a" }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <h2 style={{ color: LIGHT, fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
      {badge && <span style={{ background: badge.color + "22", color: badge.color, border: `1px solid ${badge.color}44`, borderRadius: 3, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{badge.text}</span>}
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

function AlertBox({ type, children }) {
  const colors = { red: RED, yellow: YELLOW, green: GREEN, blue: BLUE };
  const c = colors[type] || BLUE;
  return (
    <div style={{ padding: "10px 14px", background: c + "11", border: `1px solid ${c}33`, borderLeft: `3px solid ${c}`, borderRadius: 4, fontSize: 12, color: "#d4d4d4", lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function TabRanking() {
  const [sort, setSort] = useState("positivos");
  const sorted = [...agentesComp].sort((a, b) => b[sort] - a[sort]);
  const totalPos = agentesComp.reduce((s, a) => s + a.positivos, 0);
  const totalInt = agentesComp.reduce((s, a) => s + a.interesse, 0);
  const totalOpor = agentesComp.reduce((s, a) => s + a.oportunidade, 0);
  const totalRet = agentesComp.reduce((s, a) => s + a.retorno, 0);
  const avgTma = Math.round(agentesComp.filter(a => a.total > 100).reduce((s, a) => s + a.tma, 0) / agentesComp.filter(a => a.total > 100).length);
  const topInt  = [...agentesComp].reduce((m, a) => a.interesse > (m.interesse || 0) ? a : m, {});
  const topPos  = [...agentesComp].reduce((m, a) => a.positivos > (m.positivos || 0) ? a : m, {});
  const topOpor = [...agentesComp].reduce((m, a) => a.oportunidade > (m.oportunidade || 0) ? a : m, {});
  const fn = (a) => a && a.nome ? a.nome.split(" ")[0] : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <MetricCard label="Total Positivos" value={totalPos.toLocaleString("pt-BR")} sub="Int. + Opor. + Retorno" color={GREEN} size="big" />
        <MetricCard label="Interesses" value={totalInt.toLocaleString("pt-BR")} sub="Leads qualificados" color={BLUE} size="big" />
        <MetricCard label="Oportunidades" value={totalOpor} sub="Pipeline quente" color={PURPLE} size="big" />
        <MetricCard label="Retornos" value={totalRet.toLocaleString("pt-BR")} sub="Pipeline agendado" color={YELLOW} size="big" />
        <MetricCard label="TMA Médio" value={`${avgTma}s`} sub={`~${Math.floor(avgTma/60)}min — agentes ativos`} color={ORANGE} size="big" />
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>Ranking — {diasTrab} Dias de Operação</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["positivos", "Positivos"],
              ["interesse", "Interesse"],
              ["retorno", "Retorno"],
              ["total", "Volume"],
              ["tma", "TMA"],
              ["taxaInt", "Taxa Conv."],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)} style={{
                padding: "5px 10px", borderRadius: 3, border: `1px solid ${sort === k ? GREEN : BORDER}`,
                background: sort === k ? GREEN + "22" : "transparent", color: sort === k ? GREEN : "#9a9a9a",
                cursor: "pointer", fontSize: 11
              }}>{l}</button>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#111" }}>
              {["#", "Agente", "ID", "Atendimentos", "Interesse", "Opor.", "Retorno", "Positivos", "Taxa Int.", "TMA (s)"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#9a9a9a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ag, i) => {
              const isTop = i < 3;
              const medalhas = ["🥇", "🥈", "🥉"];
              return (
                <tr key={ag.id} style={{ borderBottom: `1px solid ${BORDER}`, background: isTop ? GREEN + "08" : i % 2 === 0 ? "transparent" : "#111" }}>
                  <td style={{ padding: "8px 10px", color: isTop ? GREEN : "#4a4a4a", fontWeight: isTop ? 700 : 400, fontFamily: "monospace" }}>
                    {isTop ? medalhas[i] : i + 1}
                  </td>
                  <td style={{ padding: "8px 10px", color: LIGHT, fontWeight: 600 }}>{ag.nome}</td>
                  <td style={{ padding: "8px 10px", color: "#4a4a4a", fontFamily: "monospace", fontSize: 11 }}>{ag.id}</td>
                  <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace" }}>{ag.total.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "8px 10px", color: BLUE, fontFamily: "monospace", fontWeight: 700 }}>{ag.interesse}</td>
                  <td style={{ padding: "8px 10px", color: ag.oportunidade > 0 ? PURPLE : "#4a4a4a", fontFamily: "monospace", fontWeight: ag.oportunidade > 0 ? 700 : 400 }}>{ag.oportunidade}</td>
                  <td style={{ padding: "8px 10px", color: YELLOW, fontFamily: "monospace" }}>{ag.retorno}</td>
                  <td style={{ padding: "8px 10px", color: GREEN, fontFamily: "monospace", fontWeight: 700 }}>{ag.positivos}</td>
                  <td style={{ padding: "8px 10px", color: ag.taxaInt > 12 ? GREEN : ag.taxaInt > 8 ? YELLOW : RED, fontFamily: "monospace" }}>
                    {ag.taxaInt}%
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ height: 4, width: Math.min(60, ag.tma), background: ag.tma > 55 ? GREEN : ag.tma > 40 ? YELLOW : RED, borderRadius: 2 }} />
                      <span style={{ color: ag.tma > 55 ? GREEN : ag.tma > 40 ? YELLOW : RED, fontFamily: "monospace", fontWeight: 700, fontSize: 11 }}>{ag.tma}s</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <AlertBox type="green">
            🏆 <strong style={{ color: GREEN }}>Top conversão: {fn(topInt)} — {topInt.interesse} interesses em {diasTrab} dias</strong><br />
            {fn(topInt)} lidera em interesse absoluto. {fn(topPos)} lidera em positivos totais ({topPos.positivos}) somando interesse, oportunidade e retorno.
          </AlertBox>
          <AlertBox type="blue">
            💼 <strong style={{ color: BLUE }}>Oportunidades quentes: {fn(topOpor)} ({topOpor.oportunidade}) lidera</strong><br />
            {totalOpor} oportunidades no total — pipeline imediato para fechamento.
          </AlertBox>
        </div>
      </div>
    </div>
  );
}

function TabVisual() {
  const sorted = [...agentesComp].sort((a, b) => b.positivos - a.positivos);
  const sortedTma = [...agentesComp].filter(a => a.total > 100).sort((a, b) => b.tma - a.tma);
  const fn = (a) => a.nome.split(" ")[0];
  const bandAlta  = sortedTma.filter(a => a.tma > 55);
  const bandMedia = sortedTma.filter(a => a.tma > 40 && a.tma <= 55);
  const bandBaixa = sortedTma.filter(a => a.tma <= 40);
  const listaBanda = (arr) => arr.slice(0, 3).map(a => `${fn(a)} (${a.tma}s)`).join(" · ") || "—";

  const scatterData = agentesComp.filter(a => a.total > 100).map(a => ({
    nome: a.nome.split(" ")[0],
    tma: a.tma,
    taxaInt: a.taxaInt,
    positivos: a.positivos,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Positivos por agente */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Positivos por Agente (Interesse + Oportunidade + Retorno)" badge={{ text: `${diasTrab} dias`, color: GREEN }} />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="nome" tick={{ fill: "#a0a0a0", fontSize: 10 }} angle={-12} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            <Bar dataKey="interesse" name="Interesse" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="oportunidade" name="Oportunidade" stackId="a" fill={PURPLE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="retorno" name="Retorno" stackId="a" fill={YELLOW} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TMA Comparativo */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="TMA Comparativo — Tempo Médio de Atendimento" badge={{ text: "Meta: 60-120s", color: YELLOW }} />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sortedTma} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="nome" tick={{ fill: "#a0a0a0", fontSize: 10 }} angle={-12} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} unit="s" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} formatter={(v) => [v + "s", "TMA"]} />
            <ReferenceLine y={60} stroke={GREEN} strokeDasharray="4 4" label={{ value: "60s (mín. ideal)", fill: GREEN, fontSize: 10 }} />
            <Bar dataKey="tma" name="TMA (s)" radius={[2, 2, 0, 0]}>
              {sortedTma.map((entry, i) => (
                <Cell key={i} fill={entry.tma > 55 ? GREEN : entry.tma > 40 ? YELLOW : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
          <div style={{ background: GREEN + "11", border: `1px solid ${GREEN}33`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>Acima de 55s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{listaBanda(bandAlta)}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11, marginTop: 2 }}>Conversa mais longa — maior engajamento com decisor</div>
          </div>
          <div style={{ background: YELLOW + "11", border: `1px solid ${YELLOW}33`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ color: YELLOW, fontSize: 11, fontWeight: 700 }}>40 a 55s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{listaBanda(bandMedia)}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11, marginTop: 2 }}>Faixa produtiva — script sendo completado</div>
          </div>
          <div style={{ background: RED + "11", border: `1px solid ${RED}33`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ color: RED, fontSize: 11, fontWeight: 700 }}>Abaixo de 40s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{listaBanda(bandBaixa)}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11, marginTop: 2 }}>Alto volume, TMA curto — volume vs. qualidade</div>
          </div>
        </div>
      </div>

      {/* Taxa de conversão vs volume */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Volume de Atendimentos × Taxa de Interesse" />
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="tma" name="TMA (s)" tick={{ fill: "#a0a0a0", fontSize: 10 }} label={{ value: "TMA (s)", fill: "#9a9a9a", position: "insideBottom", offset: -5, fontSize: 11 }} />
                <YAxis dataKey="taxaInt" name="Taxa Interesse %" tick={{ fill: "#a0a0a0", fontSize: 10 }} label={{ value: "Taxa Int. (%)", fill: "#9a9a9a", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                  formatter={(value, name) => [name === "TMA (s)" ? value + "s" : value + "%", name]}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                        <div style={{ color: LIGHT, fontWeight: 700, marginBottom: 4 }}>{d.nome}</div>
                        <div style={{ color: "#9a9a9a" }}>TMA: {d.tma}s</div>
                        <div style={{ color: GREEN }}>Taxa Int.: {d.taxaInt}%</div>
                        <div style={{ color: YELLOW }}>Positivos: {d.positivos}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill={BLUE}>
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.taxaInt > 12 ? GREEN : entry.taxaInt > 8 ? YELLOW : ORANGE} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 8 }}>
            {scatterData.sort((a, b) => b.taxaInt - a.taxaInt).map((ag, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#111", borderRadius: 4 }}>
                <span style={{ color: "#a0a0a0", fontSize: 12 }}>{ag.nome}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "#4a4a4a", fontFamily: "monospace", fontSize: 11 }}>{ag.tma}s</span>
                  <span style={{ color: ag.taxaInt > 12 ? GREEN : ag.taxaInt > 8 ? YELLOW : ORANGE, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{ag.taxaInt}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <AlertBox type="yellow">
          <strong style={{ color: YELLOW }}>Observação:</strong> TMA mais alto não garante maior taxa de interesse. Agentes com TMA ~40-64s apresentam as maiores taxas. Abaixo de 40s indica chamadas muito curtas — possíveis desconexões antes do pitch completo.
        </AlertBox>
      </div>
    </div>
  );
}

function TabEvolucao() {
  const top5 = topAgD.slice(0, 5).map(a => a.primeiro);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title={`Evolução de Leads Positivos por Agente — ${diasTrab} Dias`} badge={{ text: "Top 5 por volume", color: GREEN }} />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolucaoDiaria}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="dia" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            {top5.map(name => (
              <Line key={name} type="monotone" dataKey={name} stroke={AGENT_COLORS[name]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          <AlertBox type="green">
            📈 <strong style={{ color: GREEN }}>Crescimento consistente</strong> — Volume de positivos por dia cresceu ao longo da operação. Curva de aprendizado do time em evolução.
          </AlertBox>
          <AlertBox type="yellow">
            ⚠ <strong style={{ color: YELLOW }}>Ausências impactam resultado</strong> — Oscilações na linha refletem dias com agentes ausentes. Constância na presença é o principal fator de acúmulo.
          </AlertBox>
          <AlertBox type="blue">
            📋 <strong style={{ color: BLUE }}>Líder de constância</strong> — {topAgD.length ? topAgD[0].primeiro : "—"} lidera em volume acumulado no período. Maior constância = maior acumulado de positivos.
          </AlertBox>
        </div>
      </div>

      {/* All agents evolution */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Evolução Completa do Time — Positivos Diários" badge={{ text: "Todos os agentes", color: BLUE }} />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={evolucaoDiaria} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="dia" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            {Object.keys(AGENT_COLORS).map(name => (
              <Bar key={name} dataKey={name} stackId="a" fill={AGENT_COLORS[name]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TabPresenca() {
  const allDays = DIAS;
  const diasSemanas = DIA_SEM;
  // Presença + volume por agente (top por volume), derivado de _D.agente_dia
  const presenca = topAgD.map(a => {
    const volByDay = {};
    a.dias.forEach(d => { volByDay[d.dia] = d.vol; });
    return { nome: a.nome, volumes: allDays.map(d => volByDay[d] || 0) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Mapa de Presença e Volume — por Agente e Dia" badge={{ text: "Intensidade de chamadas", color: BLUE }} />

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#111" }}>
                <th style={{ padding: "8px 12px", color: "#9a9a9a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, minWidth: 120 }}>Agente</th>
                {allDays.map(d => (
                  <th key={d} style={{ padding: "6px 8px", color: "#9a9a9a", textAlign: "center", borderBottom: `1px solid ${BORDER}`, minWidth: 52 }}>
                    <div>{d}</div>
                    <div style={{ color: "#4a4a4a", fontSize: 10 }}>{diasSemanas[d]}</div>
                  </th>
                ))}
                <th style={{ padding: "6px 8px", color: "#9a9a9a", textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {presenca.map(({ nome, volumes }) => {
                const total = volumes.reduce((s, v) => s + v, 0);
                return (
                  <tr key={nome} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "7px 12px", color: LIGHT, fontWeight: 600 }}>{nome}</td>
                    {allDays.map((d, di) => {
                      const vol = volumes[di] || 0;
                      const ativo = vol > 0;
                      const intensity = vol > 200 ? 1 : vol > 100 ? 0.7 : vol > 50 ? 0.45 : vol > 0 ? 0.25 : 0;
                      return (
                        <td key={d} style={{ padding: "4px", textAlign: "center" }}>
                          <div style={{
                            background: ativo ? `rgba(34,197,94,${intensity})` : "#111",
                            border: ativo ? `1px solid rgba(34,197,94,${intensity + 0.1})` : "1px solid #222",
                            borderRadius: 3, padding: "4px 2px", fontSize: 10,
                            color: ativo && vol > 0 ? LIGHT : "#3a3a3a",
                            fontFamily: "monospace",
                          }}>
                            {vol > 0 ? vol : ativo ? "—" : "·"}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ padding: "7px 8px", color: GREEN, fontFamily: "monospace", fontWeight: 700, textAlign: "center" }}>
                      {total.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#9a9a9a" }}>Intensidade:</span>
          {[
            { label: ">200 lig.", bg: "rgba(34,197,94,1.0)" },
            { label: "101-200", bg: "rgba(34,197,94,0.7)" },
            { label: "51-100", bg: "rgba(34,197,94,0.45)" },
            { label: "1-50", bg: "rgba(34,197,94,0.25)" },
            { label: "Ausente", bg: "#111" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 14, background: item.bg, border: "1px solid #333", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#9a9a9a" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AlertBox type="yellow">
        <strong style={{ color: YELLOW }}>Insights de Presença:</strong> A tabela mostra o volume diário de chamadas por agente ao longo dos {diasTrab} dias de operação ({periodoTxt}). Células vazias indicam ausência no dia. Constância de presença é o principal fator do volume acumulado.
      </AlertBox>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = ["Ranking", "Visual", "Evolução Diária", "Presença"];

export default function PerformanceAgente() {
  const [active, setActive] = useState(0);
  const tabComponents = [<TabRanking />, <TabVisual />, <TabEvolucao />, <TabPresenca />];

  const totalPositivos = agentesComp.reduce((s, a) => s + a.positivos, 0);
  const topAgent = [...agentesComp].sort((a, b) => b.positivos - a.positivos)[0];
  const topConv = [...agentesComp].filter(a => a.total > 200).sort((a, b) => b.taxaInt - a.taxaInt)[0];

  return (
    <div style={{ color: LIGHT }}>
      {/* Hero */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: "18px 24px", marginBottom: 20, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: GREEN }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ background: GREEN + "22", color: GREEN, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: `1px solid ${GREEN}44` }}>PERFORMANCE AGENTE</span>
            <span style={{ background: BLUE + "22", color: BLUE, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: `1px solid ${BLUE}44` }}>DISCAGEM FILA 1063</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Análise Completa de Agentes</span>
          </div>
          <div style={{ fontSize: 12, color: "#9a9a9a" }}>
            {nAgentesAtivos} agentes ativos · {periodoTxt} · {diasTrab} dias úteis · Fonte: Discagem_Fila.csv
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, textAlign: "right", paddingRight: 4 }}>
          {[
            { v: totalPositivos.toLocaleString("pt-BR"), l: "positivos totais",   c: GREEN  },
            { v: topAgent.nome.split(" ")[0], l: `melhor (${topAgent.positivos} pos.)`, c: YELLOW },
            { v: topConv.taxaInt + "%", l: `melhor taxa (${topConv.nome.split(" ")[0]})`, c: BLUE },
          ].map(item => (
            <div key={item.l}>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.c, lineHeight: 1 }}>{item.v}</div>
              <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "8px 16px", background: "transparent", border: "none",
            borderBottom: `2px solid ${i === active ? GREEN : "transparent"}`,
            color: i === active ? GREEN : "#9a9a9a",
            cursor: "pointer", fontSize: 12, fontWeight: i === active ? 700 : 400,
            transition: "all 0.15s", fontFamily: "Inter, sans-serif", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tabComponents[active]}

      <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a3a3a" }}>
        <span>Fonte: Discagem_Fila.csv · Fila 1063 - FiergsAtivo</span>
        <span>Operação: {periodoTxt} · {diasTrab} dias úteis</span>
      </div>
    </div>
  );
}
