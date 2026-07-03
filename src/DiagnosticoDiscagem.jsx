import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, Legend, ReferenceLine
} from "recharts";

const NAVY = "#141414";
const GREEN = "#22c55e";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const ORANGE = "#f97316";
const LIGHT = "#f0f0f0";
const CARD = "#1a1a1a";
const BORDER = "#2a2a2a";

// ─── DATA (dinâmico — gerado por atualizar.ps1 em src/dados.js) ────────────────
import { _D } from "./dados.js";

// Baselines históricos fixos da Semana 1 (01/06–05/06) — não mudam
const S1 = { positivos: 293, comAgente: 1723, cpc: 843, cpca: 244, oportunidade: 4, retorno: 49, taxaDiscador: 54.1 };

// Helpers de formatação pt-BR
const fmt  = (n) => Number(n || 0).toLocaleString("pt-BR");
const dec1 = (n) => Number(n || 0).toFixed(1).replace(".", ",");
const growth = (atual, base) => base > 0 ? Math.round((atual - base) / base * 100) : 0;

const resumoGeral = _D.resumo;
const porDia = _D.por_dia;
const porHora = _D.por_hora;
const agentes = _D.agentes;

// Rótulo + cor por valor cru de STATUS_NEGOCIO
const NEG_META = {
  "Interesse":             { label: "Interesse",      color: GREEN },
  "Retorno":               { label: "Retorno",        color: YELLOW },
  "Oportunidade":          { label: "Oportunidade",   color: "#A855F7" },
  "Informacao":            { label: "Informação",     color: BLUE },
  "Desligou":              { label: "Desligou",       color: "#EF4444" },
  "Fora do perfl":         { label: "Fora do Perfil", color: "#9a9a9a" },
  "Ligacao caida":         { label: "Ligação Caída",  color: RED },
  "Ligacao muda":          { label: "Lig. Muda",      color: "#4a4a4a" },
  "Engano":                { label: "Engano",         color: "#6a6a6a" },
  "NAO TABULADA PELO CRM": { label: "Não Tabulado",   color: "#3a3a3a" },
  "Caixa postal":          { label: "Caixa Postal",   color: "#5a5a5a" },
  "Nao atende":            { label: "Não Atende",     color: "#4a4a4a" },
};
const negCount = (raw) => { const r = _D.status_negocio.find(s => s.name === raw); return r ? r.value : 0; };
const statusNegocio = _D.status_negocio.map(s => ({
  name:  NEG_META[s.name] ? NEG_META[s.name].label : s.name,
  value: s.value,
  color: NEG_META[s.name] ? NEG_META[s.name].color : "#6a6a6a",
}));

// Descrição por código ISDN
const ISDN_DESC = {
  "128": "Caixa Postal / Secretária",  "147": "Sem Resposta / Transferido",
  "19":  "Não Atendeu (Ring)",         "16":  "Normal Clearing (c/ humano)",
  "1":   "Atendida Normal",            "21":  "Rejeitou Chamada",
  "131": "Número Incompleto / Falha",  "34":  "Sem Canal Disponível",
  "17":  "Ocupado",                    "38":  "Fora de Serviço",
  "Outros": "Outros códigos",
};
const isdnPct = (code) => { const r = _D.isdn.find(x => x.code === code); return r ? r.pct : 0; };
const isdn = _D.isdn.map(r => ({ ...r, desc: ISDN_DESC[r.code] || "Outros códigos" }));

const mailingComparativo = [
  { label: "Base Mailing Total",     value: resumoGeral.mailingTotal,    color: "#4a4a4a" },
  { label: "Com Telefone",           value: resumoGeral.comTelefone,     color: BLUE },
  { label: "Total Tentativas",       value: resumoGeral.totalTentativas, color: "#1E3A5F" },
  { label: "Atendimentos c/ Agente", value: resumoGeral.comAgente,       color: ORANGE },
  { label: "CPC",                    value: resumoGeral.cpc,             color: GREEN },
  { label: "CPCA (Interesse+Opor.)", value: resumoGeral.cpca,            color: "#A855F7" },
  { label: "Oportunidades",          value: resumoGeral.oportunidade,    color: RED },
];

// Derivados de apoio para a narrativa
const nAgentes       = agentes.length;
const nAgentesAtivos = agentes.filter(a => a.total > 100).length;
const primDia   = porDia[0] || {};
const ultDia    = porDia[porDia.length - 1] || {};
const periodoCurto = `${(primDia.dia || "").slice(0, 5)}–${(ultDia.dia || "").slice(0, 5)}/2026`;
const bestDay   = porDia.reduce((m, d) => d.taxaContato > (m.taxaContato || 0) ? d : m, {});
const horasVol  = porHora.filter(h => h.total > 1000);
const bestHour  = horasVol.reduce((m, h) => h.taxa > (m.taxa || 0) ? h : m, {});
const worstHour = horasVol.reduce((m, h) => h.taxa < (m.taxa ?? 999) ? h : m, {});
const peakPos   = porDia.reduce((m, d) => d.positivos > (m.positivos || 0) ? d : m, {});
const totalTabul = _D.status_negocio.reduce((s, x) => s + x.value, 0);
const foraPerfil = negCount("Fora do perfl");
const engano     = negCount("Engano");
const _ativos    = agentes.filter(a => a.total > 100);
const avgTmaAtivos = _ativos.length ? Math.round(_ativos.reduce((s, a) => s + a.tma, 0) / _ativos.length) : 0;
const comAgenteDia = resumoGeral.diasTrabalhados > 0 ? Math.round(resumoGeral.comAgente / resumoGeral.diasTrabalhados) : 0;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color = GREEN, alert, size = "normal" }) {
  return (
    <div style={{
      background: CARD, borderRadius: 10, position: "relative", overflow: "hidden",
      border: `1px solid ${alert ? color + "55" : BORDER}`,
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

function TabFunil() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Alerta principal */}
      <AlertBox type="blue">
        <strong style={{ color: BLUE }}>📊 Dados Acumulados:</strong> Relatório consolidado com <strong style={{ color: LIGHT }}>{resumoGeral.diasTrabalhados} dias de operação</strong> ({resumoGeral.periodo}) · {fmt(resumoGeral.totalTentativas)} registros · {nAgentesAtivos} agentes ativos · Fila 1063 - FiergsAtivo. Fonte: Discagem_Fila.csv.
      </AlertBox>

      {/* KPIs rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Período Trabalhado" value={`${resumoGeral.diasTrabalhados} dias`} sub={resumoGeral.periodo} color={BLUE} size="big" />
        <MetricCard label="Total Tentativas" value={fmt(resumoGeral.totalTentativas)} sub={`Acumulado ${resumoGeral.diasTrabalhados} dias úteis`} color={GREEN} size="big" />
        <MetricCard label="Taxa Contato Discador" value={`${dec1(resumoGeral.taxaContatoDiscador)}%`} sub={`${fmt(resumoGeral.atendidosDiscador)} atendidos pelo discador`} color={YELLOW} size="big" />
        <MetricCard label="Atendimentos c/ Agente" value={fmt(resumoGeral.comAgente)} sub={`${dec1(resumoGeral.taxaContatoReal)}% do total — contato humano real`} color={ORANGE} size="big" />
      </div>

      {/* CPC / CPCA */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Indicadores de Qualificação" badge={{ text: "CPC & CPCA", color: GREEN }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          <MetricCard label="CPC" value={fmt(resumoGeral.cpc)} sub="Contatos produtivos" color={GREEN} />
          <MetricCard label="CPCA" value={fmt(resumoGeral.cpca)} sub="Interesse + Oportunidade" color="#A855F7" />
          <MetricCard label="%CPC" value={`${dec1(resumoGeral.pctCpc)}%`} sub="CPC / Atend. c/ Agente" color={GREEN} />
          <MetricCard label="%CPCA" value={`${dec1(resumoGeral.pctCpca)}%`} sub="CPCA / CPC" color="#A855F7" />
          <MetricCard label="Oportunidades" value={fmt(resumoGeral.oportunidade)} sub="Pipeline quente para fechar" color={RED} />
          <MetricCard label="Retornos" value={fmt(resumoGeral.retorno)} sub="Pipeline agendado" color={YELLOW} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <AlertBox type="green">
            <strong style={{ color: GREEN }}>%CPC de {dec1(resumoGeral.pctCpc)}%</strong> — {fmt(resumoGeral.cpc)} contatos produtivos de {fmt(resumoGeral.comAgente)} atendimentos com agente. Volume de contato humano cresceu {growth(resumoGeral.comAgente, S1.comAgente)}% vs. a semana 1.
          </AlertBox>
          <AlertBox type="blue">
            <strong style={{ color: BLUE }}>%CPCA de {dec1(resumoGeral.pctCpca)}%</strong> — {fmt(resumoGeral.cpca)} de {fmt(resumoGeral.cpc)} CPC geraram qualificação real (Interesse ou Oportunidade). Benchmark B2B: 20–35%. {fmt(resumoGeral.oportunidade)} oportunidades quentes em carteira.
          </AlertBox>
        </div>
      </div>

      {/* FUNIL */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 24 }}>
        <SectionHeader title="Funil Real da Operação" badge={{ text: `Dados reais ${resumoGeral.diasTrabalhados} dias`, color: GREEN }} />
        <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
          {mailingComparativo.map((step, i, arr) => {
            const pctBase = (step.value / resumoGeral.mailingTotal * 100).toFixed(2);
            const pctAnterior = i > 0 ? (step.value / arr[i - 1].value * 100).toFixed(1) : "100";
            return (
              <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                <div style={{
                  background: step.color + "18", border: `1px solid ${step.color}55`,
                  borderRadius: 4, padding: "16px 6px", margin: "0 2px", height: "100%", boxSizing: "border-box"
                }}>
                  <div style={{ fontSize: 10, color: "#9a9a9a", marginBottom: 6, lineHeight: 1.3 }}>{step.label}</div>
                  <div style={{ fontSize: i === 0 ? 22 : 18, fontWeight: 800, color: step.color, fontFamily: "monospace" }}>
                    {step.value.toLocaleString("pt-BR")}
                  </div>
                  <div style={{ fontSize: 10, color: step.color + "bb", marginTop: 4 }}>{pctBase}% base</div>
                  {i > 0 && (
                    <div style={{ fontSize: 10, color: "#4a4a4a", marginTop: 2 }}>▼ {pctAnterior}% ant.</div>
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", color: "#3a3a3a", fontSize: 14, zIndex: 2 }}>▶</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          <AlertBox type="red">
            <strong style={{ color: RED }}>Taxa de Contato REAL: {dec1(resumoGeral.taxaContatoReal)}%</strong><br />
            O discador marca {dec1(resumoGeral.taxaContatoDiscador)}% como "Atendido", mas a maioria é caixa postal/sem agente. {fmt(resumoGeral.comAgente)} chamadas chegaram a agentes humanos em {resumoGeral.diasTrabalhados} dias (+{growth(resumoGeral.comAgente, S1.comAgente)}% vs. semana 1).
          </AlertBox>
          <AlertBox type="yellow">
            <strong style={{ color: YELLOW }}>Base Mailing: {fmt(resumoGeral.mailingTotal)} empresas</strong><br />
            Com {fmt(resumoGeral.totalTentativas)} tentativas em {resumoGeral.diasTrabalhados} dias, o mailing está sendo trabalhado em múltiplas rodadas. Ver aba Cobertura para análise detalhada por CNPJ.
          </AlertBox>
          <AlertBox type="green">
            <strong style={{ color: GREEN }}>Crescimento: +{growth(resumoGeral.totalPositivos, S1.positivos)}% em leads acumulados</strong><br />
            Semana 1: {S1.positivos} positivos → {resumoGeral.diasTrabalhados} dias: {fmt(resumoGeral.totalPositivos)} positivos. Pico: {peakPos.positivos} positivos em {(peakPos.dia || "").slice(0, 5)}. Operação em plena velocidade.
          </AlertBox>
        </div>
      </div>

      {/* ISDN breakdown */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title={`Diagnóstico de "Atendidos" — Códigos ISDN/SIP (${resumoGeral.diasTrabalhados} dias)`} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            {isdn.map((item, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>
                    <span style={{ color: "#4a4a4a", fontFamily: "monospace", marginRight: 6 }}>[{item.code}]</span>
                    {item.desc}
                  </span>
                  <span style={{ color: item.code === "1" ? GREEN : item.code === "147" || item.code === "128" ? YELLOW : "#9a9a9a", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>
                    {item.pct}%
                    <span style={{ color: "#4a4a4a", fontWeight: 400 }}> ({item.count.toLocaleString("pt-BR")})</span>
                  </span>
                </div>
                <div style={{ height: 5, background: "#111", borderRadius: 3 }}>
                  <div style={{ width: item.pct + "%", height: "100%", background: item.code === "1" ? GREEN : item.code === "147" || item.code === "128" ? YELLOW : "#3a3a3a", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: "14px 16px", background: "#111", borderRadius: 4, flex: 1 }}>
              <div style={{ color: YELLOW, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚡ Interpretação dos Códigos</div>
              <div style={{ color: "#a0a0a0", fontSize: 12, lineHeight: 1.7 }}>
                <div>• <strong style={{ color: LIGHT }}>Cód. 147</strong>: número transferido p/ secretária/caixa — call "atendida" pelo sistema mas sem humano</div>
                <div>• <strong style={{ color: LIGHT }}>Cód. 128</strong>: caixa postal — call computada como atendida, nenhuma conversa real</div>
                <div>• <strong style={{ color: LIGHT }}>Cód. 19</strong>: ring sem atendimento — ISDN standard "No Answer"</div>
                <div>• <strong style={{ color: LIGHT }}>Cód. 1</strong>: atendida com conexão normal — base dos contatos com agente</div>
              </div>
            </div>
            <div style={{ padding: "12px 14px", background: RED + "11", border: `1px solid ${RED}33`, borderRadius: 4 }}>
              <div style={{ color: RED, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Impacto na Taxa de Contato</div>
              <div style={{ color: "#a0a0a0", fontSize: 12 }}>
                Caixa postal + sem resposta + ring = <strong style={{ color: RED }}>{dec1(isdnPct("128") + isdnPct("147") + isdnPct("19"))}%</strong> das tentativas.<br />
                Cód. 128 (caixa postal) é o código mais frequente — base mais "madura".<br />
                Taxa real de humano contactado: <strong style={{ color: GREEN }}>~{dec1(resumoGeral.taxaContatoReal)}%</strong> (contato com agente).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabPerformance() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Melhor Taxa Contato" value={`${dec1(bestDay.taxaContato)}%`} sub={bestDay.dia} color={GREEN} />
        <MetricCard label="Melhor Hora" value={bestHour.hora} sub={`${dec1(bestHour.taxa)}% — pior: ${worstHour.hora} (${dec1(worstHour.taxa)}%)`} color={GREEN} />
        <MetricCard label="Pico de Positivos" value={peakPos.positivos} sub={`${(peakPos.dia || "").slice(0, 5)} — melhor dia da operação`} color={YELLOW} />
        <MetricCard label="Agentes Produtivos" value={nAgentesAtivos} sub={`${resumoGeral.diasTrabalhados} dias · ${nAgentes} agentes no total`} color={BLUE} />
      </div>

      {/* Por dia */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title={`Evolução Diária — Tentativas, Contato e Leads (${resumoGeral.diasTrabalhados} dias)`} />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={porDia} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="dia" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a0a0a0", fontSize: 10 }} domain={[0, 80]} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="total" name="Tentativas" fill="#1E3A5F" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="atendido" name="Atendidos (disc.)" fill={BLUE} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="comAgente" name="Com Agente" fill={GREEN} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="positivos" name="Leads Positivos" fill={YELLOW} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <AlertBox type="blue">
          📈 <strong style={{ color: BLUE }}>Crescimento sustentado em {resumoGeral.diasTrabalhados} dias:</strong> {primDia.positivos} positivos ({(primDia.dia || "").slice(0, 5)}) → pico de {peakPos.positivos} ({(peakPos.dia || "").slice(0, 5)}). Volume de atendimentos c/ agente cresceu {growth(resumoGeral.comAgente, S1.comAgente)}% vs. a semana 1 pela expansão da fila e ramp-up do time. A queda na taxa de contato do discador é compensada pelo volume muito maior.
        </AlertBox>
      </div>

      {/* Por hora */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title={`Taxa de Contato por Hora do Dia (média ${resumoGeral.diasTrabalhados} dias)`} badge={{ text: "Otimização de janela", color: YELLOW }} />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={porHora}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="hora" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
            <YAxis domain={[35, 55]} tick={{ fill: "#a0a0a0", fontSize: 10 }} unit="%" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} formatter={(v) => [v + "%", "Taxa Contato"]} />
            <ReferenceLine y={resumoGeral.taxaContatoDiscador} stroke="#4a4a4a" strokeDasharray="4 4" label={{ value: `Média: ${dec1(resumoGeral.taxaContatoDiscador)}%`, fill: "#9a9a9a", fontSize: 11 }} />
            <Line type="monotone" dataKey="taxa" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <div style={{ background: GREEN + "18", border: `1px solid ${GREEN}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>🟢 Melhor Janela</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>{bestHour.hora}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>{bestHour.hora}: {dec1(bestHour.taxa)}% — maior taxa de contato do dia</div>
          </div>
          <div style={{ background: YELLOW + "18", border: `1px solid ${YELLOW}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: YELLOW, fontSize: 11, fontWeight: 700 }}>🟡 Horário Crítico</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>{worstHour.hora}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>Queda para {dec1(worstHour.taxa)}% — menor eficiência operacional</div>
          </div>
          <div style={{ background: BLUE + "18", border: `1px solid ${BLUE}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>🔵 Recomendação</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>Reforçar {bestHour.hora}</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>Concentrar volume nas janelas de maior contato e reduzir pressão em {worstHour.hora}</div>
          </div>
        </div>
      </div>

      {/* Status Negócio */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title={`Status de Negócio — Tabulação dos Agentes (${resumoGeral.diasTrabalhados} dias)`} badge={{ text: `${fmt(totalTabul)} tabulações`, color: BLUE }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusNegocio} layout="vertical" barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis type="number" tick={{ fill: "#a0a0a0", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#a0a0a0", fontSize: 11 }} width={115} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
              <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                {statusNegocio.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#111", borderRadius: 4, padding: 14 }}>
              <div style={{ color: "#9a9a9a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>BREAKDOWN DE NEGÓCIO</div>
              {[
                { label: "Leads Positivos (Int.+Ret.+Opor.)", value: resumoGeral.totalPositivos, color: GREEN },
                { label: "Fora do Perfil / Engano",            value: foraPerfil + engano, color: "#9a9a9a" },
                { label: "Contato Neutro (info+desligou)",     value: negCount("Informacao") + negCount("Desligou"), color: BLUE },
                { label: "Ligação com Problema (caída+muda)",  value: negCount("Ligacao caida") + negCount("Ligacao muda"), color: RED },
                { label: "Não Tabulado pelo CRM",              value: negCount("NAO TABULADA PELO CRM"), color: YELLOW },
                { label: "Oportunidade Quente",                value: resumoGeral.oportunidade, color: "#A855F7" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{fmt(item.value)} <span style={{ color: "#4a4a4a", fontWeight: 400 }}>({dec1(item.value / totalTabul * 100)}%)</span></span>
                </div>
              ))}
            </div>
            <AlertBox type="yellow">
              <strong style={{ color: YELLOW }}>⚠ "Fora do Perfil" = {fmt(foraPerfil)} tabulações ({dec1(foraPerfil / totalTabul * 100)}%)</strong> — maior categoria negativa. Indica desalinhamento entre a base e o perfil do programa. Engano = {fmt(engano)} ({dec1(engano / totalTabul * 100)}%) — qualidade da base de números precisa revisão. Ação: segmentar e remover empresas "Grande" do mailing ativo.
            </AlertBox>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabAgentes() {
  const [sort, setSort] = useState("positivos");
  const sorted = [...agentes].map(ag => ({ ...ag, positivos: ag.interesse + ag.oportunidade + ag.retorno })).sort((a, b) => b[sort] - a[sort]);
  const totalInteresse = agentes.reduce((s, a) => s + a.interesse, 0);
  const totalOport = agentes.reduce((s, a) => s + a.oportunidade, 0);
  const totalRetorno = agentes.reduce((s, a) => s + a.retorno, 0);
  const activeAgentes = agentes.filter(a => a.total > 100);
  const avgTma = Math.round(activeAgentes.reduce((s, a) => s + a.tma, 0) / activeAgentes.length);
  const withPos = agentes.map(a => ({ ...a, positivos: a.interesse + a.oportunidade + a.retorno }));
  const topInteresse = withPos.reduce((m, a) => a.interesse > (m.interesse || 0) ? a : m, {});
  const topPositivos = withPos.reduce((m, a) => a.positivos > (m.positivos || 0) ? a : m, {});
  const topOport     = withPos.reduce((m, a) => a.oportunidade > (m.oportunidade || 0) ? a : m, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Agentes Produtivos" value={nAgentesAtivos} sub={`${nAgentes} no total · ${resumoGeral.diasTrabalhados} dias de operação`} color={BLUE} />
        <MetricCard label="Total Interesses" value={totalInteresse.toLocaleString("pt-BR")} sub={`Distribuídos entre ${nAgentes} agentes`} color={GREEN} />
        <MetricCard label="Oportunidades" value={totalOport} sub="Total qualificações quentes do time" color="#A855F7" />
        <MetricCard label="TMA Médio" value={`${avgTma}s`} sub="agentes ativos — benchmark 60-120s" color={YELLOW} />
      </div>

      {/* Tabela de agentes */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>Ranking de Agentes — {resumoGeral.diasTrabalhados} Dias</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["positivos", "Positivos"], ["interesse", "Interesse"], ["retorno", "Retorno"], ["total", "Volume"], ["tma", "TMA"]].map(([k, l]) => (
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
              {["#", "Agente", "Atendimentos", "Interesse", "Opor.", "Retorno", "Positivos", "TMA (s)", "Taxa Int."].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#9a9a9a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ag, i) => {
              const taxaInt = ag.convReal > 0 ? ((ag.interesse + ag.oportunidade) / ag.convReal * 100).toFixed(1) : "0.0";
              const isTop = i < 3;
              return (
                <tr key={ag.id} style={{ borderBottom: `1px solid ${BORDER}`, background: isTop ? GREEN + "08" : i % 2 === 0 ? "transparent" : "#111" }}>
                  <td style={{ padding: "8px 10px", color: isTop ? GREEN : "#4a4a4a", fontWeight: isTop ? 700 : 400, fontFamily: "monospace" }}>
                    {isTop ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </td>
                  <td style={{ padding: "8px 10px", color: LIGHT, fontWeight: 600 }}>{ag.nome}</td>
                  <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace" }}>{ag.total.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "8px 10px", color: BLUE, fontFamily: "monospace", fontWeight: 700 }}>{ag.interesse}</td>
                  <td style={{ padding: "8px 10px", color: ag.oportunidade > 0 ? "#A855F7" : "#4a4a4a", fontWeight: 700, fontFamily: "monospace" }}>{ag.oportunidade}</td>
                  <td style={{ padding: "8px 10px", color: YELLOW, fontFamily: "monospace" }}>{ag.retorno}</td>
                  <td style={{ padding: "8px 10px", color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>{ag.positivos}</td>
                  <td style={{ padding: "8px 10px", color: ag.tma > 55 ? GREEN : ag.tma > 40 ? YELLOW : RED, fontFamily: "monospace", fontWeight: 700 }}>{ag.tma}s</td>
                  <td style={{ padding: "8px 10px", color: parseFloat(taxaInt) > 12 ? GREEN : parseFloat(taxaInt) > 8 ? YELLOW : "#9a9a9a", fontFamily: "monospace" }}>{taxaInt}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <AlertBox type="green">
            🏆 <strong style={{ color: GREEN }}>Líderes: {topInteresse.nome ? topInteresse.nome.split(" ")[0] : "—"} ({topInteresse.interesse} int.) e {topPositivos.nome ? topPositivos.nome.split(" ")[0] : "—"} ({topPositivos.positivos} positivos)</strong><br />
            {topInteresse.nome ? topInteresse.nome.split(" ")[0] : "—"} tem maior conversão em interesse. {topPositivos.nome ? topPositivos.nome.split(" ")[0] : "—"} lidera positivos totais. {topOport.nome ? topOport.nome.split(" ")[0] : "—"} lidera em oportunidades ({topOport.oportunidade}).
          </AlertBox>
          <AlertBox type="yellow">
            ⚠ <strong style={{ color: YELLOW }}>TMA médio: {avgTma}s</strong> — comparar ao benchmark de campanha gov. (60–120s). Agentes com maior TMA têm maior engajamento na conversa. Ver <em>Performance Agente</em> para análise completa.
          </AlertBox>
        </div>
      </div>

      {/* Gráfico interesse por agente */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Positivos por Agente — Interesse + Oportunidade + Retorno" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...agentes].map(a => ({ ...a, positivos: a.interesse + a.oportunidade + a.retorno })).sort((a, b) => b.positivos - a.positivos)} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="nome" tick={{ fill: "#a0a0a0", fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            <Bar dataKey="interesse" name="Interesse" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="oportunidade" name="Oportunidade" stackId="a" fill="#A855F7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="retorno" name="Retorno" stackId="a" fill={YELLOW} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TabKPIs() {
  const kpis = [
    {
      pilar: "⚡ Eficiência da Discagem", color: GREEN,
      items: [
        { kpi: "Taxa de Contato (Discador)", real: `${dec1(resumoGeral.taxaContatoDiscador)}%`, benchmark: "25–35%", delta: "↑ vol.", status: "green", nota: `Caixa postal domina (${dec1(isdnPct("128"))}% das tentativas); taxa varia com a penetração da base` },
        { kpi: "Taxa de Contato REAL (c/ Agente)", real: `${dec1(resumoGeral.taxaContatoReal)}%`, benchmark: "25–35%", delta: "-21pp", status: "red", nota: `${fmt(resumoGeral.comAgente)} de ${fmt(resumoGeral.totalTentativas)} tentativas chegaram a agente — +${growth(resumoGeral.comAgente, S1.comAgente)}% vs. semana 1` },
        { kpi: `Volume de Tentativas (${resumoGeral.diasTrabalhados} dias)`, real: fmt(resumoGeral.totalTentativas), benchmark: "— (alvo volume)", delta: "—", status: "green", nota: `Média ${fmt(Math.round(resumoGeral.totalTentativas / resumoGeral.diasTrabalhados))} tentativas/dia — volume maduro em plena operação` },
        { kpi: "Abandon Rate", real: "< 1%", benchmark: "< 5%", delta: "✓ OK", status: "green", nota: "Campanha ativa outbound — sem risco de abandono" },
        { kpi: "Atendimentos c/ Agente/Dia", real: `~${fmt(comAgenteDia)}`, benchmark: "—", delta: "—", status: "green", nota: "Cresceu com a expansão da equipe ao longo da operação" },
      ]
    },
    {
      pilar: "🎯 Qualidade do Contato", color: BLUE,
      items: [
        { kpi: "Caixa Postal / Total (cód. 128)", real: `${dec1(isdnPct("128"))}%`, benchmark: "< 30%", delta: "crítico", status: "red", nota: "Caixa postal é o maior grupo ISDN — base madura com muitos números de caixa postal corporativa" },
        { kpi: "TMA Médio (agentes ativos)", real: `~${avgTmaAtivos}s`, benchmark: "60–120s", delta: "abaixo", status: "yellow", nota: "Agentes com maior TMA têm maior engajamento na conversa — replicar padrão" },
        { kpi: "Fora do Perfil / Total Tabulações", real: `${dec1(foraPerfil / totalTabul * 100)}%`, benchmark: "< 10%", delta: "crítico", status: "red", nota: `${fmt(foraPerfil)} tabulações fora do perfil — principal ação: remover empresas 'Grande' do mailing` },
        { kpi: "Não Tabulado pelo CRM", real: `${dec1(negCount("NAO TABULADA PELO CRM") / totalTabul * 100)}%`, benchmark: "< 3%", delta: "✓ OK", status: "green", nota: `${fmt(negCount("NAO TABULADA PELO CRM"))} registros — boa aderência ao CRM` },
        { kpi: "Engano / Total Tabulações", real: `${dec1(engano / totalTabul * 100)}%`, benchmark: "< 5%", delta: "crítico", status: "red", nota: `${fmt(engano)} enganos — qualidade da base de números é o principal problema de longo prazo` },
      ]
    },
    {
      pilar: "🎯 CPC & CPCA — Qualificação", color: "#A855F7",
      items: [
        { kpi: "CPC (Contato Produtivo)", real: fmt(resumoGeral.cpc), benchmark: "—", delta: `+${growth(resumoGeral.cpc, S1.cpc)}%`, status: "green", nota: `Desligou + Informação + Interesse + Oportunidade + Retorno — vs. ${fmt(S1.cpc)} da semana 1` },
        { kpi: "%CPC (CPC / Atend. c/ Agente)", real: `${dec1(resumoGeral.pctCpc)}%`, benchmark: "35–55%", delta: "✓ OK", status: "green", nota: `${fmt(resumoGeral.cpc)} CPC de ${fmt(resumoGeral.comAgente)} atendimentos — dentro da faixa B2B` },
        { kpi: "CPCA (Contato c/ Potencial)", real: fmt(resumoGeral.cpca), benchmark: "—", delta: `+${growth(resumoGeral.cpca, S1.cpca)}%`, status: "green", nota: `Interesse (${fmt(resumoGeral.interesse)}) + Oportunidade (${fmt(resumoGeral.oportunidade)}) — vs. ${fmt(S1.cpca)} da semana 1` },
        { kpi: "%CPCA (CPCA / CPC)", real: `${dec1(resumoGeral.pctCpca)}%`, benchmark: "20–35%", delta: "✓ OK", status: "green", nota: `${fmt(resumoGeral.cpca)} de ${fmt(resumoGeral.cpc)} CPC — dentro da faixa` },
        { kpi: "Oportunidades (quentes)", real: fmt(resumoGeral.oportunidade), benchmark: "—", delta: `+${growth(resumoGeral.oportunidade, S1.oportunidade)}%`, status: "green", nota: `vs. ${S1.oportunidade} da semana 1 — pipeline de fechamento em crescimento` },
        { kpi: "Retornos Agendados", real: fmt(resumoGeral.retorno), benchmark: "—", delta: `+${growth(resumoGeral.retorno, S1.retorno)}%`, status: "green", nota: `vs. ${S1.retorno} da semana 1 — pipeline de aquecimento robusto` },
      ]
    },
    {
      pilar: "📈 Conversão / Negócio", color: YELLOW,
      items: [
        { kpi: "Total Leads Positivos", real: fmt(resumoGeral.totalPositivos), benchmark: "Meta operação", delta: `+${growth(resumoGeral.totalPositivos, S1.positivos)}%`, status: "green", nota: `${fmt(resumoGeral.totalPositivos)} vs. ${S1.positivos} da semana 1` },
        { kpi: "Taxa de Interesse (CPCA/CPC)", real: `${dec1(resumoGeral.pctCpca)}%`, benchmark: "15–25%", delta: "✓ OK", status: "green", nota: `Dentro do benchmark B2B — ${fmt(resumoGeral.cpca)} qualificações de ${fmt(resumoGeral.cpc)} CPC` },
        { kpi: "Oportunidades / CPCA", real: `${dec1(resumoGeral.oportunidade / resumoGeral.cpca * 100)}%`, benchmark: "5–15%", delta: "-3pp", status: "yellow", nota: `${fmt(resumoGeral.oportunidade)} oportunidades de ${fmt(resumoGeral.cpca)} CPCA — funil de fechamento precisa acompanhamento` },
        { kpi: "Pico de Leads/Dia", real: `${peakPos.positivos}`, benchmark: "—", delta: "—", status: "green", nota: `${(peakPos.dia || "").slice(0, 5)} — melhor dia da operação` },
        { kpi: "Evolução Acumulada", real: `+${growth(resumoGeral.totalPositivos, S1.positivos)}%`, benchmark: "Crescente", delta: "✓ Positivo", status: "green", nota: `${S1.positivos} (sem. 1) → ${fmt(resumoGeral.totalPositivos)} (${resumoGeral.diasTrabalhados} dias)` },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AlertBox type="blue">
        <strong style={{ color: BLUE }}>📌 Nota metodológica:</strong> KPIs calculados com base em <strong style={{ color: LIGHT }}>dados reais de operação</strong> ({resumoGeral.diasTrabalhados} dias, {fmt(resumoGeral.totalTentativas)} registros). Taxa de contato do discador ≠ taxa de contato humano. Comparativos "vs. semana 1" referem-se ao período 01/06–05/06. Fonte: Discagem_Fila.csv ({resumoGeral.periodo}).
      </AlertBox>

      {kpis.map((pilar, pi) => (
        <div key={pi} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
          <SectionHeader title={pilar.pilar} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["KPI", "Valor Real", "Benchmark", "∆ vs. Benchmark", "Status", "Observação"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", color: "#9a9a9a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pilar.items.map((row, i) => {
                const sc = { green: GREEN, yellow: YELLOW, red: RED };
                const statusLabel = { green: "✓ OK", yellow: "⚠ Atenção", red: "✗ Crítico" };
                const c = sc[row.status];
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : "#111" }}>
                    <td style={{ padding: "8px 10px", color: LIGHT, fontWeight: 600 }}>{row.kpi}</td>
                    <td style={{ padding: "8px 10px", color: c, fontFamily: "monospace", fontWeight: 700 }}>{row.real}</td>
                    <td style={{ padding: "8px 10px", color: "#a0a0a0" }}>{row.benchmark}</td>
                    <td style={{ padding: "8px 10px", color: row.status === "green" ? GREEN : row.status === "red" ? RED : YELLOW, fontFamily: "monospace" }}>{row.delta}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 3, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{statusLabel[row.status]}</span>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#9a9a9a", fontSize: 11 }}>{row.nota}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function TabAcoes() {
  const acoes = [
    {
      urgencia: "🔴 IMEDIATO", cor: RED,
      titulo: `Segmentar Empresas 'Fora do Perfil' — ${fmt(foraPerfil)} tabulações (${dec1(foraPerfil / totalTabul * 100)}%)`,
      problema: "Fora do Perfil é a maior categoria de tabulação negativa. Base contém empresas inelegíveis ao programa (porte Grande, CNAE fora do escopo).",
      acao: "Filtrar o mailing ativo: remover registros com porte 'Grande' (27,1% da base) para fila separada com script próprio. Rever elegibilidade por CNAE com RFB.",
      impacto: "Redução de tentativas ineficazes + melhora de 5–8pp no %CPC e %CPCA"
    },
    {
      urgencia: "🔴 IMEDIATO", cor: RED,
      titulo: `Investigar Caixa Postal — ISDN 128 (${fmt((_D.isdn.find(x => x.code === "128") || {}).count || 0)} registros, ${dec1(isdnPct("128"))}%)`,
      problema: "Caixa postal é o código mais frequente. Indica base 'madura' com muitos números de caixa postal corporativa.",
      acao: "Auditar amostra de 500 registros cód. 128: verificar se há números duplicados, DDD inválido, ou se é o mesmo número tentado múltiplas vezes.",
      impacto: "Identificar e remover tentativas ineficazes — economia expressiva de volume/semana"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: `Intensificar Horário ${bestHour.hora} e Reduzir Pressão no ${worstHour.hora}`,
      problema: `${worstHour.hora} tem ${dec1(worstHour.taxa)}% de taxa de contato vs. ${dec1(bestHour.taxa)}% às ${bestHour.hora}. O horário fraco desperdiça tentativas com baixo retorno.`,
      acao: `Reduzir volume em ${worstHour.hora}. Redirecionar capacidade para as janelas de maior contato. Concentrar retornos nos melhores horários.`,
      impacto: "Economia de tentativas/semana; +4–6pp de eficiência nas janelas premium"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Replicar Script dos Agentes Líderes",
      problema: "Os agentes de maior conversão em interesse e oportunidade concentram o melhor desempenho. Modelo não replicado para o time.",
      acao: "Gravar e transcrever as melhores calls dos líderes. Extrair padrão de qualificação de oportunidade. Sessão de coaching para os agentes com menor TMA.",
      impacto: "+25–35% de interesses no time se a taxa dos líderes for replicada"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: `Converter os ${fmt(resumoGeral.retorno)} Retornos Agendados`,
      problema: `${fmt(resumoGeral.retorno)} retornos acumulados representam o pipeline mais quente. A cada dia sem follow-up, a taxa de conversão cai ~15%.`,
      acao: "Criar fila prioritária de retornos com designação para os agentes que mais agendaram retornos.",
      impacto: "Conversão estimada 25–35% em novos Interesses/Oportunidades a partir de retornos existentes"
    },
    {
      urgencia: "🟢 MÉDIO PRAZO", cor: GREEN,
      titulo: "Estratégia de Encerramento de Campanha e Transferência para Vendas",
      problema: `Com ${fmt(resumoGeral.oportunidade)} oportunidades e ${fmt(resumoGeral.totalPositivos)} positivos acumulados, a operação está em ponto de maturidade. Falta estrutura de handoff para equipe comercial.`,
      acao: `Criar processo de CRM para as ${fmt(resumoGeral.oportunidade)} oportunidades: designar responsável comercial, SLA de contato 48h, script de fechamento diferenciado.`,
      impacto: "Conversão estimada 30–50% das oportunidades em vendas"
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <MetricCard label="Ações Imediatas" value="2" sub="Impacto em reporting e operação" color={RED} />
        <MetricCard label="Ações Curto Prazo" value="3" sub="Semana 2 de operação" color={YELLOW} />
        <MetricCard label="Ações Médio Prazo" value="1" sub="Reestruturação de fila" color={GREEN} />
      </div>

      {acoes.map((a, i) => (
        <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${a.cor}`, borderRadius: 4, padding: 18 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <span style={{ color: a.cor, fontSize: 12, fontWeight: 700 }}>{a.urgencia}</span>
            <span style={{ color: LIGHT, fontSize: 14, fontWeight: 700 }}>{a.titulo}</span>
          </div>
          <div style={{ color: "#a0a0a0", fontSize: 12, marginBottom: 10 }}><strong style={{ color: "#9a9a9a" }}>Problema:</strong> {a.problema}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#111", borderRadius: 3, padding: "10px 12px" }}>
              <div style={{ color: "#4a4a4a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>AÇÃO</div>
              <div style={{ color: LIGHT, fontSize: 12 }}>{a.acao}</div>
            </div>
            <div style={{ background: "#111", borderRadius: 3, padding: "10px 12px" }}>
              <div style={{ color: "#4a4a4a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>IMPACTO ESPERADO</div>
              <div style={{ color: a.cor, fontSize: 12, fontWeight: 600 }}>{a.impacto}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Situação atual + próximos passos */}
      <div style={{ background: CARD, border: `1px solid ${GREEN}44`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Situação Atual da Operação" badge={{ text: (ultDia.dia || "").slice(0, 5) + "/2026", color: GREEN }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard label="Positivos Acumulados" value={fmt(resumoGeral.totalPositivos)} sub={`${resumoGeral.diasTrabalhados} dias de operação`} color={GREEN} />
          <MetricCard label="Oportunidades Ativas" value={fmt(resumoGeral.oportunidade)} sub="Pipeline quente — handoff comercial" color={RED} />
          <MetricCard label="Retornos em Aberto" value={fmt(resumoGeral.retorno)} sub="Pipeline agendado a converter" color={YELLOW} />
          <MetricCard label="Pico Diário Atingido" value={peakPos.positivos} sub={`${(peakPos.dia || "").slice(0, 5)} — melhor dia`} color={BLUE} />
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = ["Funil & Visão Geral", "Performance Diária", "Agentes", "KPIs com Benchmark", "Ações & Projeção"];

export default function DiagnosticoDiscagem() {
  const [active, setActive] = useState(0);
  const tabComponents = [<TabFunil />, <TabPerformance />, <TabAgentes />, <TabKPIs />, <TabAcoes />];

  return (
    <div style={{ color: LIGHT }}>
      {/* Hero */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: "18px 24px", marginBottom: 20, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: BLUE }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ background: BLUE + "22", color: BLUE, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: `1px solid ${BLUE}44` }}>FIERGS + DISCAGEM</span>
            <span style={{ background: GREEN + "22", color: GREEN, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: `1px solid ${GREEN}44` }}>BR + PRODUTIVO</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Análise Operacional — Visão Apartada</span>
          </div>
          <div style={{ fontSize: 12, color: "#9a9a9a" }}>Fila: 1063 - FiergsAtivo · {resumoGeral.periodo} · {resumoGeral.diasTrabalhados} dias úteis · {nAgentesAtivos} agentes ativos</div>
        </div>
        <div style={{ display: "flex", gap: 24, textAlign: "right", paddingRight: 4 }}>
          {[
            { v: fmt(resumoGeral.totalPositivos), l: "leads positivos",   c: GREEN  },
            { v: fmt(resumoGeral.totalTentativas), l: "tentativas",         c: YELLOW },
            { v: fmt(resumoGeral.oportunidade),   l: "oportunidades quentes", c: RED },
          ].map(item => (
            <div key={item.l}>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.c, lineHeight: 1 }}>{item.v}</div>
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
            borderBottom: `2px solid ${i === active ? BLUE : "transparent"}`,
            color: i === active ? BLUE : "#9a9a9a",
            cursor: "pointer", fontSize: 12, fontWeight: i === active ? 700 : 400,
            transition: "all 0.15s", fontFamily: "Inter, sans-serif", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tabComponents[active]}

      <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a3a3a" }}>
        <span>Dados: Discagem_Fila.csv ({fmt(resumoGeral.totalTentativas)} reg.) · Fila 1063 - FiergsAtivo</span>
        <span>Operação: {resumoGeral.periodo} · {resumoGeral.diasTrabalhados} dias úteis</span>
      </div>
    </div>
  );
}
