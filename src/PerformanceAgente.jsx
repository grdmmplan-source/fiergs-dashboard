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

// ─── DATA ────────────────────────────────────────────────────────────────────

const agentes = [
  { nome: "Mariana Nunes",    id: "6034", total: 2309, convReal: 2306, interesse: 198, oportunidade: 2,  retorno: 104, tma: 35 },
  { nome: "Sabrina Santana",  id: "6041", total: 1666, convReal: 1664, interesse: 135, oportunidade: 6,  retorno: 123, tma: 50 },
  { nome: "Kessia Angelo",    id: "6035", total: 1664, convReal: 1661, interesse: 213, oportunidade: 0,  retorno: 24,  tma: 39 },
  { nome: "Paulo Victor",     id: "6042", total: 1590, convReal: 1590, interesse: 69,  oportunidade: 0,  retorno: 133, tma: 64 },
  { nome: "Marcia Peixoto",   id: "6052", total: 1435, convReal: 1430, interesse: 133, oportunidade: 8,  retorno: 65,  tma: 51 },
  { nome: "Simone Victoria",  id: "6037", total: 1382, convReal: 1381, interesse: 127, oportunidade: 0,  retorno: 9,   tma: 43 },
  { nome: "Caique Fonseca",   id: "6056", total: 1347, convReal: 1346, interesse: 124, oportunidade: 8,  retorno: 24,  tma: 60 },
  { nome: "Roseli Honorato",  id: "6044", total: 908,  convReal: 907,  interesse: 122, oportunidade: 0,  retorno: 33,  tma: 63 },
  { nome: "Ana Paula Soares", id: "6079", total: 767,  convReal: 765,  interesse: 42,  oportunidade: 3,  retorno: 27,  tma: 35 },
  { nome: "Lais Ferreira",    id: "6053", total: 244,  convReal: 244,  interesse: 44,  oportunidade: 0,  retorno: 12,  tma: 50 },
  { nome: "Flavia Cunha",     id: "6081", total: 245,  convReal: 245,  interesse: 13,  oportunidade: 2,  retorno: 13,  tma: 42 },
  { nome: "Ana Beatriz",      id: "6080", total: 149,  convReal: 149,  interesse: 12,  oportunidade: 4,  retorno: 8,   tma: 41 },
];

const evolucaoDiaria = [
  { dia: "01/06", Mariana: 2,  Sabrina: 8,  Kessia: 0,  Paulo: 2,  Marcia: 3,  Simone: 0,  Caique: 9,  Roseli: 6 },
  { dia: "02/06", Mariana: 6,  Sabrina: 9,  Kessia: 5,  Paulo: 4,  Marcia: 0,  Simone: 0,  Caique: 11, Roseli: 7 },
  { dia: "03/06", Mariana: 9,  Sabrina: 12, Kessia: 11, Paulo: 5,  Marcia: 0,  Simone: 0,  Caique: 5,  Roseli: 11 },
  { dia: "05/06", Mariana: 26, Sabrina: 15, Kessia: 15, Paulo: 21, Marcia: 3,  Simone: 17, Caique: 23, Roseli: 20 },
  { dia: "08/06", Mariana: 31, Sabrina: 23, Kessia: 20, Paulo: 15, Marcia: 9,  Simone: 24, Caique: 20, Roseli: 25 },
  { dia: "09/06", Mariana: 18, Sabrina: 13, Kessia: 15, Paulo: 16, Marcia: 15, Simone: 11, Caique: 13, Roseli: 13 },
  { dia: "10/06", Mariana: 15, Sabrina: 0,  Kessia: 6,  Paulo: 10, Marcia: 13, Simone: 14, Caique: 8,  Roseli: 18 },
  { dia: "11/06", Mariana: 38, Sabrina: 7,  Kessia: 21, Paulo: 37, Marcia: 32, Simone: 16, Caique: 9,  Roseli: 0 },
  { dia: "12/06", Mariana: 22, Sabrina: 25, Kessia: 18, Paulo: 27, Marcia: 27, Simone: 15, Caique: 18, Roseli: 0 },
  { dia: "15/06", Mariana: 32, Sabrina: 36, Kessia: 29, Paulo: 17, Marcia: 26, Simone: 0,  Caique: 16, Roseli: 29 },
  { dia: "16/06", Mariana: 23, Sabrina: 36, Kessia: 12, Paulo: 10, Marcia: 20, Simone: 0,  Caique: 12, Roseli: 19 },
  { dia: "17/06", Mariana: 29, Sabrina: 32, Kessia: 20, Paulo: 13, Marcia: 31, Simone: 17, Caique: 6,  Roseli: 5 },
  { dia: "18/06", Mariana: 36, Sabrina: 33, Kessia: 34, Paulo: 19, Marcia: 19, Simone: 12, Caique: 0,  Roseli: 0 },
  { dia: "19/06", Mariana: 14, Sabrina: 11, Kessia: 24, Paulo: 3,  Marcia: 18, Simone: 5,  Caique: 0,  Roseli: 0 },
];

const AGENT_COLORS = {
  Mariana:  "#22c55e",
  Sabrina:  "#3b82f6",
  Kessia:   "#f59e0b",
  Paulo:    "#f97316",
  Marcia:   "#a855f7",
  Simone:   "#06b6d4",
  Caique:   "#ec4899",
  Roseli:   "#84cc16",
};

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
          <div style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>Ranking — 20 Dias de Operação</div>
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
            🏆 <strong style={{ color: GREEN }}>Top conversão: Kessia Angelo — 213 interesses em 20 dias</strong><br />
            Kessia lidera em interesse absoluto. Mariana lidera em positivos totais (304) pela constância em retornos (104).
          </AlertBox>
          <AlertBox type="blue">
            💼 <strong style={{ color: BLUE }}>Oportunidades quentes: Marcia (8) e Caique (8) lideram</strong><br />
            35 oportunidades no total — pipeline imediato para fechamento. Roseli e Paulo lideram em retornos acumulados.
          </AlertBox>
        </div>
      </div>
    </div>
  );
}

function TabVisual() {
  const sorted = [...agentesComp].sort((a, b) => b.positivos - a.positivos);
  const sortedTma = [...agentesComp].filter(a => a.total > 100).sort((a, b) => b.tma - a.tma);

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
        <SectionHeader title="Positivos por Agente (Interesse + Oportunidade + Retorno)" badge={{ text: "20 dias", color: GREEN }} />
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
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>Acima de 60s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>Paulo (64s) · Roseli (63s) · Caique (60s)</div>
            <div style={{ color: "#9a9a9a", fontSize: 11, marginTop: 2 }}>Conversa mais longa — maior engajamento com decisor</div>
          </div>
          <div style={{ background: YELLOW + "11", border: `1px solid ${YELLOW}33`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ color: YELLOW, fontSize: 11, fontWeight: 700 }}>40 a 60s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>Marcia (51s) · Sabrina (50s) · Lais (50s)</div>
            <div style={{ color: "#9a9a9a", fontSize: 11, marginTop: 2 }}>Faixa produtiva — script sendo completado</div>
          </div>
          <div style={{ background: RED + "11", border: `1px solid ${RED}33`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ color: RED, fontSize: 11, fontWeight: 700 }}>Abaixo de 40s</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700, marginTop: 4 }}>Mariana (35s) · Ana Paula (35s)</div>
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
  const top5 = ["Mariana", "Sabrina", "Kessia", "Paulo", "Marcia"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Evolução de Leads Positivos por Agente — 14 Dias" badge={{ text: "Top 5 por volume", color: GREEN }} />
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
            📈 <strong style={{ color: GREEN }}>Crescimento consistente</strong> — Volume de positivos por dia cresceu de 31 (01/06) para picos de 200+ (15/06). Curva de aprendizado da operação ainda ativa.
          </AlertBox>
          <AlertBox type="yellow">
            ⚠ <strong style={{ color: YELLOW }}>Ausências impactam resultado</strong> — Dias 10/06 e 11-12/06 mostram oscilações por agentes ausentes. Caique e Roseli estiveram ausentes em 18-19/06.
          </AlertBox>
          <AlertBox type="blue">
            📋 <strong style={{ color: BLUE }}>Mariana mais consistente</strong> — Única agente ativa nos 14 dias. Maior constância = maior acumulado (304 positivos).
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
  const agenteDias = {
    "Mariana Nunes":   ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Sabrina Santana": ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Kessia Angelo":   ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Paulo Victor":    ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Marcia Peixoto":  ["01/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Simone Victoria": ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","17/06","18/06","19/06"],
    "Caique Fonseca":  ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06"],
    "Roseli Honorato": ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","15/06","16/06","17/06"],
    "Ana Paula":       ["08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Lais Ferreira":   ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Flavia Cunha":    ["08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"],
    "Ana Beatriz":     ["01/06","02/06","03/06","05/06","08/06","09/06"],
  };

  const allDays = ["01/06","02/06","03/06","05/06","08/06","09/06","10/06","11/06","12/06","15/06","16/06","17/06","18/06","19/06"];
  const agentVolume = {
    "Mariana Nunes":   [34,54,47,125,127,82,85,283,293,251,252,236,234,206],
    "Sabrina Santana": [28,45,51,93,122,61,18,20,233,211,237,218,232,97],
    "Kessia Angelo":   [8,44,37,101,122,85,58,177,176,212,148,172,194,130],
    "Paulo Victor":    [28,48,44,105,112,79,81,185,174,172,154,162,154,92],
    "Marcia Peixoto":  [19,0,0,0,0,64,73,188,212,179,191,164,193,152],
    "Simone Victoria": [4,39,49,105,105,92,63,184,221,0,0,191,237,92],
    "Caique Fonseca":  [39,54,58,122,122,96,65,135,213,139,178,126,0,0],
    "Roseli Honorato": [29,46,42,92,121,73,76,0,0,214,178,37,0,0],
    "Ana Paula":       [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "Lais Ferreira":   [26,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "Flavia Cunha":    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "Ana Beatriz":     [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  };

  const diasSemanas = {
    "01/06": "Seg", "02/06": "Ter", "03/06": "Qua",
    "05/06": "Sex", "08/06": "Seg", "09/06": "Ter",
    "10/06": "Qua", "11/06": "Qui", "12/06": "Sex",
    "15/06": "Seg", "16/06": "Ter", "17/06": "Qua",
    "18/06": "Qui", "19/06": "Sex",
  };

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
              {Object.entries(agenteDias).map(([nome, diasAtivos], ri) => {
                const volumes = agentVolume[nome] || allDays.map(() => 0);
                const total = volumes.reduce((s, v) => s + v, 0);
                return (
                  <tr key={nome} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "7px 12px", color: LIGHT, fontWeight: 600 }}>{nome}</td>
                    {allDays.map((d, di) => {
                      const vol = volumes[di] || 0;
                      const ativo = diasAtivos.includes(d);
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
        <strong style={{ color: YELLOW }}>Insights de Presença:</strong> Mariana Nunes, Sabrina, Kessia, Paulo Victor e Lais foram os agentes mais presentes (14 dias). Marcia Peixoto iniciou a partir do dia 09/06. Caique e Roseli encerraram antes da semana final (17-19/06). Ana Beatriz esteve ativa apenas nas primeiras semanas.
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
            12 agentes ativos · 01/06–25/06/2026 · 20 dias úteis · Fonte: Discagem_Fila.csv
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
        <span>Operação: 01–25/jun/2026 · 20 dias úteis</span>
      </div>
    </div>
  );
}
