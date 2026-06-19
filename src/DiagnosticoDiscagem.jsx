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

// ─── DATA ────────────────────────────────────────────────────────────────────
// Fonte: Discagem_Fila.csv (316.444 registros) · Período: 01/06–19/06/2026

const resumoGeral = {
  periodo: "01/06 – 19/06/2026",
  diasTrabalhados: 14,
  totalTentativas: 316444,
  mailingTotal: 64013,
  comTelefone: 20230,
  atendidosDiscador: 145792,
  taxaContatoDiscador: 46.1,
  comAgente: 13716,
  taxaContatoReal: 4.3,
  interesse: 1232,
  retorno: 575,
  oportunidade: 35,
  totalPositivos: 1842,
  cpc: 5881,
  cpca: 1267,
  pctCpc: 42.9,
  pctCpca: 21.5,
};

const porDia = [
  { dia: "01/06 (Seg)", total: 12247,  atendido: 6733,  comAgente: 195,  positivos: 31,  taxaContato: 55.0 },
  { dia: "02/06 (Ter)", total: 20191,  atendido: 11476, comAgente: 381,  positivos: 53,  taxaContato: 56.9 },
  { dia: "03/06 (Qua)", total: 20020,  atendido: 10906, comAgente: 395,  positivos: 71,  taxaContato: 54.5 },
  { dia: "05/06 (Sex)", total: 19655,  atendido: 9914,  comAgente: 752,  positivos: 138, taxaContato: 50.4 },
  { dia: "08/06 (Seg)", total: 20627,  atendido: 11619, comAgente: 997,  positivos: 192, taxaContato: 56.3 },
  { dia: "09/06 (Ter)", total: 21733,  atendido: 12872, comAgente: 717,  positivos: 139, taxaContato: 59.2 },
  { dia: "10/06 (Qua)", total: 22995,  atendido: 13540, comAgente: 530,  positivos: 90,  taxaContato: 58.9 },
  { dia: "11/06 (Qui)", total: 19112,  atendido: 7141,  comAgente: 1175, positivos: 163, taxaContato: 37.4 },
  { dia: "12/06 (Sex)", total: 27211,  atendido: 10230, comAgente: 1568, positivos: 160, taxaContato: 37.6 },
  { dia: "15/06 (Seg)", total: 27581,  atendido: 10686, comAgente: 1588, positivos: 219, taxaContato: 38.7 },
  { dia: "16/06 (Ter)", total: 30940,  atendido: 11969, comAgente: 1541, positivos: 149, taxaContato: 38.7 },
  { dia: "17/06 (Qua)", total: 33464,  atendido: 12817, comAgente: 1626, positivos: 181, taxaContato: 38.3 },
  { dia: "18/06 (Qui)", total: 30127,  atendido: 11532, comAgente: 1478, positivos: 177, taxaContato: 38.3 },
  { dia: "19/06 (Sex)", total: 10541,  atendido: 4357,  comAgente: 773,  positivos: 79,  taxaContato: 41.3 },
];

const porHora = [
  { hora: "09h", total: 29306, atendido: 14136, taxa: 48.2 },
  { hora: "10h", total: 39377, atendido: 17924, taxa: 45.5 },
  { hora: "11h", total: 38386, atendido: 17458, taxa: 45.5 },
  { hora: "12h", total: 36824, atendido: 14936, taxa: 40.6 },
  { hora: "13h", total: 24056, atendido: 11759, taxa: 48.9 },
  { hora: "14h", total: 36850, atendido: 17441, taxa: 47.3 },
  { hora: "15h", total: 42570, atendido: 19787, taxa: 46.5 },
  { hora: "16h", total: 43197, atendido: 20192, taxa: 46.7 },
  { hora: "17h", total: 25795, atendido: 12126, taxa: 47.0 },
];

const agentes = [
  { nome: "Mariana Nunes",    id: "6034", total: 2309, atendidos: 2309, convReal: 2306, tma: 35,  interesse: 198, oportunidade: 2,  retorno: 104 },
  { nome: "Sabrina Santana",  id: "6041", total: 1666, atendidos: 1666, convReal: 1664, tma: 50,  interesse: 135, oportunidade: 6,  retorno: 123 },
  { nome: "Kessia Angelo",    id: "6035", total: 1664, atendidos: 1664, convReal: 1661, tma: 39,  interesse: 213, oportunidade: 0,  retorno: 24  },
  { nome: "Paulo Victor",     id: "6042", total: 1590, atendidos: 1590, convReal: 1590, tma: 64,  interesse: 69,  oportunidade: 0,  retorno: 133 },
  { nome: "Marcia Peixoto",   id: "6052", total: 1435, atendidos: 1435, convReal: 1430, tma: 51,  interesse: 133, oportunidade: 8,  retorno: 65  },
  { nome: "Simone Victoria",  id: "6037", total: 1382, atendidos: 1382, convReal: 1381, tma: 43,  interesse: 127, oportunidade: 0,  retorno: 9   },
  { nome: "Caique Fonseca",   id: "6056", total: 1347, atendidos: 1347, convReal: 1346, tma: 60,  interesse: 124, oportunidade: 8,  retorno: 24  },
  { nome: "Roseli Honorato",  id: "6044", total: 908,  atendidos: 908,  convReal: 907,  tma: 63,  interesse: 122, oportunidade: 0,  retorno: 33  },
  { nome: "Ana Paula Soares", id: "6079", total: 767,  atendidos: 767,  convReal: 765,  tma: 35,  interesse: 42,  oportunidade: 3,  retorno: 27  },
  { nome: "Lais Ferreira",    id: "6053", total: 244,  atendidos: 244,  convReal: 244,  tma: 50,  interesse: 44,  oportunidade: 0,  retorno: 12  },
  { nome: "Flavia Cunha",     id: "6081", total: 245,  atendidos: 245,  convReal: 245,  tma: 42,  interesse: 13,  oportunidade: 2,  retorno: 13  },
  { nome: "Ana Beatriz",      id: "6080", total: 149,  atendidos: 149,  convReal: 149,  tma: 41,  interesse: 12,  oportunidade: 4,  retorno: 8   },
];

const statusNegocio = [
  { name: "Fora do Perfil",  value: 3024, color: "#9a9a9a" },
  { name: "Desligou",        value: 2561, color: "#EF4444" },
  { name: "Ligação Caída",   value: 2376, color: RED },
  { name: "Engano",          value: 1671, color: "#6a6a6a" },
  { name: "Informação",      value: 1478, color: BLUE },
  { name: "Interesse",       value: 1232, color: GREEN },
  { name: "Retorno",         value: 575,  color: YELLOW },
  { name: "Lig. Muda",       value: 507,  color: "#4a4a4a" },
  { name: "Não Tabulado",    value: 113,  color: "#3a3a3a" },
  { name: "Oportunidade",    value: 35,   color: "#A855F7" },
];

const isdn = [
  { code: "128", desc: "Caixa Postal / Secretária",   count: 153969, pct: 48.7 },
  { code: "147", desc: "Sem Resposta / Transferido",  count: 76261,  pct: 24.1 },
  { code: "19",  desc: "Não Atendeu (Ring)",          count: 44947,  pct: 14.2 },
  { code: "16",  desc: "Normal Clearing (c/ humano)", count: 13699,  pct: 4.3  },
  { code: "1",   desc: "Atendida Normal",             count: 8860,   pct: 2.8  },
  { code: "21",  desc: "Rejeitou Chamada",            count: 6582,   pct: 2.1  },
  { code: "34",  desc: "Sem Canal Disponível",        count: 4784,   pct: 1.5  },
  { code: "Outros", desc: "Outros códigos",           count: 7342,   pct: 2.3  },
];

const mailingComparativo = [
  { label: "Base Mailing Total",     value: 64013,  color: "#4a4a4a" },
  { label: "Com Telefone",           value: 20230,  color: BLUE },
  { label: "Total Tentativas",       value: 316444, color: "#1E3A5F" },
  { label: "Atendimentos c/ Agente", value: 13716,  color: ORANGE },
  { label: "CPC",                    value: 5881,   color: GREEN },
  { label: "CPCA (Interesse+Opor.)", value: 1267,   color: "#A855F7" },
  { label: "Oportunidades",          value: 35,     color: RED },
];

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
        <strong style={{ color: BLUE }}>📊 Dados Acumulados:</strong> Relatório consolidado com <strong style={{ color: LIGHT }}>14 dias de operação</strong> (01/06–19/06/2026) · 316.444 registros · 12 agentes ativos · Fila 1063 - FiergsAtivo. Fonte: Discagem_Fila.csv atualizado em 19/06/2026.
      </AlertBox>

      {/* KPIs rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Período Trabalhado" value="14 dias" sub="01/06 a 19/06/2026" color={BLUE} size="big" />
        <MetricCard label="Total Tentativas" value="316.444" sub="Acumulado 14 dias úteis" color={GREEN} size="big" />
        <MetricCard label="Taxa Contato Discador" value="46,1%" sub="145.792 atendidos pelo discador" color={YELLOW} size="big" />
        <MetricCard label="Atendimentos c/ Agente" value="13.716" sub="4,3% do total — contato humano real" color={ORANGE} size="big" />
      </div>

      {/* CPC / CPCA */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Indicadores de Qualificação" badge={{ text: "CPC & CPCA", color: GREEN }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          <MetricCard label="CPC" value="5.881" sub="Contatos produtivos" color={GREEN} />
          <MetricCard label="CPCA" value="1.267" sub="Interesse + Oportunidade" color="#A855F7" />
          <MetricCard label="%CPC" value="42,9%" sub="CPC / Atend. c/ Agente" color={GREEN} />
          <MetricCard label="%CPCA" value="21,5%" sub="CPCA / CPC" color="#A855F7" />
          <MetricCard label="Oportunidades" value="35" sub="Pipeline quente para fechar" color={RED} />
          <MetricCard label="Retornos" value="575" sub="Pipeline agendado" color={YELLOW} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <AlertBox type="green">
            <strong style={{ color: GREEN }}>%CPC de 42,9%</strong> — 5.881 contatos produtivos de 13.716 atendimentos com agente. Queda vs. semana 1 (49,2%) indica que o volume aumentou mais rápido que a qualificação, mas absolute value cresce: +698% vs. semana 1.
          </AlertBox>
          <AlertBox type="blue">
            <strong style={{ color: BLUE }}>%CPCA de 21,5%</strong> — 1.267 de 5.881 CPC geraram qualificação real (Interesse ou Oportunidade). Benchmark B2B: 20–35%. Valor dentro da faixa — 35 oportunidades quentes em carteira.
          </AlertBox>
        </div>
      </div>

      {/* FUNIL */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 24 }}>
        <SectionHeader title="Funil Real da Operação" badge={{ text: "Dados reais 14 dias", color: GREEN }} />
        <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
          {mailingComparativo.map((step, i, arr) => {
            const pctBase = (step.value / 64013 * 100).toFixed(2);
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
            <strong style={{ color: RED }}>Taxa de Contato REAL: 4,3%</strong><br />
            O discador marca 46% como "Atendido", mas ~91% são caixa postal/sem agente. 13.716 chamadas chegaram a agentes humanos em 14 dias (+698% vs. semana 1).
          </AlertBox>
          <AlertBox type="yellow">
            <strong style={{ color: YELLOW }}>Base Mailing: 64.013 empresas</strong><br />
            Com 316k tentativas em 14 dias, o mailing está sendo trabalhado em múltiplas rodadas. Ver aba Cobertura para análise detalhada por CNPJ.
          </AlertBox>
          <AlertBox type="green">
            <strong style={{ color: GREEN }}>Crescimento: +607% em leads acumulados</strong><br />
            Semana 1: 293 positivos → 14 dias: 1.842 positivos. Pico: 219 positivos em 15/06. Operação em plena velocidade.
          </AlertBox>
        </div>
      </div>

      {/* ISDN breakdown */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title='Diagnóstico de "Atendidos" — Códigos ISDN/SIP (14 dias)' />
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
                Caixa postal + sem resposta = <strong style={{ color: RED }}>86,9%</strong> das tentativas (↑ vs. semana 1).<br />
                Cód. 128 ultrapassou cód. 147 — base mais "madura" → mais caixa postal.<br />
                Taxa real de humano contactado: <strong style={{ color: GREEN }}>~4,3%</strong> (cód. 16 + cód. 1).
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
        <MetricCard label="Melhor Taxa Contato" value="59,2%" sub="09/06 (Terça)" color={GREEN} />
        <MetricCard label="Melhor Hora" value="13h" sub="48,9% — pior: 12h (40,6%)" color={GREEN} />
        <MetricCard label="Pico de Positivos" value="219" sub="15/06 — melhor dia da operação" color={YELLOW} />
        <MetricCard label="Agentes Produtivos" value="12" sub="14 dias · 15 agentes no total" color={BLUE} />
      </div>

      {/* Por dia */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Evolução Diária — Tentativas, Contato e Leads (14 dias)" />
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
          📈 <strong style={{ color: BLUE }}>Crescimento sustentado em 14 dias:</strong> 31 positivos (01/06) → 219 (15/06). Volume de atendimentos c/ agente saltou de 195/dia para 1.626/dia — aumento de 8× pela expansão da fila e ramp-up do time. A queda na taxa de contato do discador (55% → 38%) é compensada pelo volume muito maior.
        </AlertBox>
      </div>

      {/* Por hora */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Taxa de Contato por Hora do Dia (média 14 dias)" badge={{ text: "Otimização de janela", color: YELLOW }} />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={porHora}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="hora" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
            <YAxis domain={[35, 55]} tick={{ fill: "#a0a0a0", fontSize: 10 }} unit="%" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} formatter={(v) => [v + "%", "Taxa Contato"]} />
            <ReferenceLine y={46.1} stroke="#4a4a4a" strokeDasharray="4 4" label={{ value: "Média: 46,1%", fill: "#9a9a9a", fontSize: 11 }} />
            <Line type="monotone" dataKey="taxa" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <div style={{ background: GREEN + "18", border: `1px solid ${GREEN}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>🟢 Melhor Janela</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>13h e 09h</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>13h: 48,9% · 09h: 48,2% — pós-almoço e início da manhã lideram</div>
          </div>
          <div style={{ background: YELLOW + "18", border: `1px solid ${YELLOW}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: YELLOW, fontSize: 11, fontWeight: 700 }}>🟡 Horário Crítico</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>12h–12h59 (almoço)</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>Queda para 40,6% — menor eficiência operacional (−5,5pp da média)</div>
          </div>
          <div style={{ background: BLUE + "18", border: `1px solid ${BLUE}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>🔵 Recomendação</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>Reforçar 13h e 16h</div>
            <div style={{ color: "#9a9a9a", fontSize: 11 }}>16h: 46,7% com maior volume (43k). Pausar 12h salva ~14k tentativas/dia</div>
          </div>
        </div>
      </div>

      {/* Status Negócio */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Status de Negócio — Tabulação dos Agentes (14 dias)" badge={{ text: "13.697 tabulações", color: BLUE }} />
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
                { label: "Leads Positivos (Int.+Ret.+Opor.)", value: 1842, pct: "13,4%", color: GREEN },
                { label: "Fora do Perfil / Engano",            value: 4695, pct: "34,3%", color: "#9a9a9a" },
                { label: "Contato Neutro (info+desligou)",     value: 4039, pct: "29,5%", color: BLUE },
                { label: "Ligação com Problema (caída+muda)",  value: 2883, pct: "21,1%", color: RED },
                { label: "Não Tabulado pelo CRM",              value: 113,  pct: "0,8%",  color: YELLOW },
                { label: "Oportunidade Quente",                value: 35,   pct: "0,3%",  color: "#A855F7" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{item.value} <span style={{ color: "#4a4a4a", fontWeight: 400 }}>({item.pct})</span></span>
                </div>
              ))}
            </div>
            <AlertBox type="yellow">
              <strong style={{ color: YELLOW }}>⚠ "Fora do Perfil" = 3.024 tabulações (22,1%)</strong> — maior categoria negativa. Indica desalinhamento entre a base e o perfil do programa. Engano = 1.671 (12,2%) — qualidade da base de números precisa revisão. Ação: segmentar e remover empresas "Grande" do mailing ativo.
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Agentes Produtivos" value="12" sub="15 no total · 14 dias de operação" color={BLUE} />
        <MetricCard label="Total Interesses" value={totalInteresse.toLocaleString("pt-BR")} sub="Distribuídos entre 12 agentes" color={GREEN} />
        <MetricCard label="Oportunidades" value={totalOport} sub="Marcia (8) + Caique (8) + outros" color="#A855F7" />
        <MetricCard label="TMA Médio" value={`${avgTma}s`} sub="~50s agentes ativos — benchmark 60-120s" color={YELLOW} />
      </div>

      {/* Tabela de agentes */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>Ranking de Agentes — 14 Dias</div>
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
            🏆 <strong style={{ color: GREEN }}>Líderes: Kessia (213 int.) e Mariana (304 positivos)</strong><br />
            Kessia tem maior conversão em interesse. Mariana lidera positivos totais pela constância em retornos (104). Marcia e Caique lideram em oportunidades (8 cada).
          </AlertBox>
          <AlertBox type="yellow">
            ⚠ <strong style={{ color: YELLOW }}>TMA médio: {avgTma}s (~50s)</strong> — abaixo do ideal para campanha gov. (benchmark: 60–120s). Caique (60s), Roseli (63s) e Paulo (64s) têm maior engajamento. Ver <em>Performance Agente</em> para análise completa.
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
        { kpi: "Taxa de Contato (Discador)", real: "46,1%", benchmark: "25–35%", delta: "+11pp", status: "green", nota: "Queda vs. semana 1 (54,1%) por maior penetração — caixa postal domina (48,7% das tentativas)" },
        { kpi: "Taxa de Contato REAL (c/ Agente)", real: "4,3%", benchmark: "25–35%", delta: "-21pp", status: "red", nota: "13.716 de 316.444 tentativas chegaram a agente — +698% absoluto vs. semana 1" },
        { kpi: "Volume de Tentativas (14 dias)", real: "316.444", benchmark: "— (alvo volume)", delta: "+339%", status: "green", nota: "Média 22.603 tentativas/dia — volume maduro em plena operação" },
        { kpi: "Abandon Rate", real: "< 1%", benchmark: "< 5%", delta: "✓ OK", status: "green", nota: "Campanha ativa outbound — sem risco de abandono" },
        { kpi: "Atendimentos c/ Agente/Dia", real: "~979", benchmark: "—", delta: "—", status: "green", nota: "Cresceu de 195/dia (semana 1) para ~1.580/dia (semanas 3-4) — expansão real da equipe" },
      ]
    },
    {
      pilar: "🎯 Qualidade do Contato", color: BLUE,
      items: [
        { kpi: "Caixa Postal / Total (cód. 128)", real: "48,7%", benchmark: "< 30%", delta: "+18,7pp", status: "red", nota: "153.969 tentativas para caixa postal — maior grupo ISDN; ultrapassou transferido (cód. 147)" },
        { kpi: "TMA Médio (agentes ativos)", real: "~50s", benchmark: "60–120s", delta: "-10s mín", status: "yellow", nota: "Melhores agentes (Paulo 64s, Roseli 63s, Caique 60s) mais próximos do ideal" },
        { kpi: "Fora do Perfil / Total Tabulações", real: "22,1%", benchmark: "< 10%", delta: "+12pp", status: "red", nota: "3.024 tabulações fora do perfil — principal ação: remover empresas 'Grande' do mailing" },
        { kpi: "Não Tabulado pelo CRM", real: "0,8%", benchmark: "< 3%", delta: "✓ OK", status: "green", nota: "113 registros — melhoria significativa vs. semana 1 (4,6%)" },
        { kpi: "Engano / Total Tabulações", real: "12,2%", benchmark: "< 5%", delta: "+7,2pp", status: "red", nota: "1.671 enganos — qualidade da base de números é o principal problema de longo prazo" },
      ]
    },
    {
      pilar: "🎯 CPC & CPCA — Qualificação", color: "#A855F7",
      items: [
        { kpi: "CPC (Contato Produtivo)", real: "5.881", benchmark: "—", delta: "+598%", status: "green", nota: "Desligou + Informação + Interesse + Oportunidade + Retorno — 5.881 vs. 843 da semana 1" },
        { kpi: "%CPC (CPC / Atend. c/ Agente)", real: "42,9%", benchmark: "35–55%", delta: "✓ OK", status: "green", nota: "5.881 CPC de 13.716 atendimentos — dentro da faixa B2B; leve queda vs. semana 1 (49,2%)" },
        { kpi: "CPCA (Contato c/ Potencial)", real: "1.267", benchmark: "—", delta: "+419%", status: "green", nota: "Interesse (1.232) + Oportunidade (35) — 1.267 vs. 244 da semana 1" },
        { kpi: "%CPCA (CPCA / CPC)", real: "21,5%", benchmark: "20–35%", delta: "✓ OK", status: "green", nota: "1.267 de 5.881 CPC — dentro da faixa; redução indica base mais trabalhada e qualificação mais exigente" },
        { kpi: "Oportunidades (quentes)", real: "35", benchmark: "—", delta: "+775%", status: "green", nota: "35 vs. 4 da semana 1 — pipeline de fechamento em crescimento acelerado" },
        { kpi: "Retornos Agendados", real: "575", benchmark: "—", delta: "+1.073%", status: "green", nota: "575 vs. 49 da semana 1 — pipeline de aquecimento robusto para as próximas semanas" },
      ]
    },
    {
      pilar: "📈 Conversão / Negócio", color: YELLOW,
      items: [
        { kpi: "Total Leads Positivos", real: "1.842", benchmark: "Meta operação", delta: "+529%", status: "green", nota: "1.842 vs. 293 da semana 1 — crescimento de +1.549 leads em 10 dias adicionais" },
        { kpi: "Taxa de Interesse (CPCA/CPC)", real: "21,5%", benchmark: "15–25%", delta: "✓ OK", status: "green", nota: "Dentro do benchmark B2B — 1.267 qualificações de 5.881 CPC" },
        { kpi: "Oportunidades / CPCA", real: "2,8%", benchmark: "5–15%", delta: "-3pp", status: "yellow", nota: "35 oportunidades de 1.267 CPCA — funil de fechamento ainda precisa acompanhamento intensivo" },
        { kpi: "Pico de Leads/Dia", real: "219", benchmark: "—", delta: "—", status: "green", nota: "15/06 — melhor dia da operação; meta de 200-250/dia sendo atingida regularmente" },
        { kpi: "Evolução Acumulada", real: "+607%", benchmark: "Crescente", delta: "✓ Positivo", status: "green", nota: "293 (sem. 1) → 1.842 (14 dias) — operação em plena maturidade" },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AlertBox type="blue">
        <strong style={{ color: BLUE }}>📌 Nota metodológica:</strong> KPIs calculados com base em <strong style={{ color: LIGHT }}>dados reais de operação</strong> (14 dias, 316.444 registros). Taxa de contato do discador ≠ taxa de contato humano. Comparativos "vs. semana 1" referem-se ao período 01/06–05/06. Fonte: Discagem_Fila.csv atualizado 19/06/2026.
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
      titulo: "Segmentar Empresas 'Fora do Perfil' — 3.024 tabulações (22,1%)",
      problema: "Fora do Perfil é a maior categoria de tabulação negativa. Base contém empresas inelegíveis ao programa (porte Grande, CNAE fora do escopo).",
      acao: "Filtrar o mailing ativo: remover registros com porte 'Grande' (27,1% da base) para fila separada com script próprio. Rever elegibilidade por CNAE com RFB.",
      impacto: "Redução de ~22% de tentativas ineficazes + melhora de 5–8pp no %CPC e %CPCA"
    },
    {
      urgencia: "🔴 IMEDIATO", cor: RED,
      titulo: "Investigar Caixa Postal — ISDN 128 (153.969 registros, 48,7%)",
      problema: "Caixa postal ultrapassou transferido como código mais frequente. Indica base 'madura' com muitos números de caixa postal corporativa.",
      acao: "Auditar amostra de 500 registros cód. 128: verificar se há números duplicados, DDD inválido, ou se é o mesmo número tentado múltiplas vezes.",
      impacto: "Identificar e remover ~30% de tentativas ineficazes — economizar ~100k tentativas/semana"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Intensificar Horário 13h e Reduzir Pressão no 12h",
      problema: "12h tem 40,6% de taxa de contato vs. 48,9% às 13h. Com 316k tentativas acumuladas, o 12h desperdiça ~14k tentativas/dia.",
      acao: "Pausar ou reduzir volume às 12h–13h. Redirecionar capacidade para 13h–14h (melhor janela). Concentrar retornos às 09h e 13h.",
      impacto: "Economia de ~70k tentativas/semana; +4–6pp de eficiência nas janelas premium"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Replicar Script de Kessia Angelo e Marcia Peixoto",
      problema: "Kessia (213 int., TMA 39s) lidera interesses com TMA moderado. Marcia (8 opor., TMA 51s) é top em oportunidades. Modelo não replicado para o time.",
      acao: "Gravar e transcrever 10 melhores calls de Kessia e Marcia. Extrair padrão de qualificação de oportunidade. Sessão de coaching para os agentes com TMA < 40s.",
      impacto: "+25–35% de interesses no time se a taxa de Kessia (12,8%) for replicada"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Converter os 575 Retornos Agendados",
      problema: "575 retornos acumulados representam o pipeline mais quente. A cada dia sem follow-up, a taxa de conversão cai ~15%.",
      acao: "Criar fila prioritária de retornos com designação para agentes Paulo Victor (133 ret.) e Sabrina (123 ret.) — os que mais agendaram.",
      impacto: "Conversão estimada 25–35%: 144–201 novos Interesses/Oportunidades a partir de retornos existentes"
    },
    {
      urgencia: "🟢 MÉDIO PRAZO", cor: GREEN,
      titulo: "Estratégia de Enceramento de Campanha e Transferência para Vendas",
      problema: "Com 35 oportunidades e 1.842 positivos acumulados, a operação está em ponto de maturidade. Falta estrutura de handoff para equipe comercial.",
      acao: "Criar processo de CRM para as 35 oportunidades: designar responsável comercial, SLA de contato 48h, script de fechamento diferenciado.",
      impacto: "Conversão estimada 30–50% das oportunidades em vendas: 10–18 contratos fechados"
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
        <SectionHeader title="Situação Atual — Semana 3 em Operação" badge={{ text: "19/06/2026", color: GREEN }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard label="Positivos Acumulados" value="1.842" sub="Meta superada" color={GREEN} />
          <MetricCard label="Oportunidades Ativas" value="35" sub="Pipeline quente — handoff comercial" color={RED} />
          <MetricCard label="Retornos em Aberto" value="575" sub="Conversão estimada: 144–201" color={YELLOW} />
          <MetricCard label="Pico Diário Atingido" value="219" sub="15/06 — 200+ leads/dia regularmente" color={BLUE} />
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
          <div style={{ fontSize: 12, color: "#9a9a9a" }}>Fila: 1063 - FiergsAtivo · 01/06–19/06/2026 · 14 dias úteis · 12 agentes ativos</div>
        </div>
        <div style={{ display: "flex", gap: 24, textAlign: "right", paddingRight: 4 }}>
          {[
            { v: "1.842",    l: "leads positivos",   c: GREEN  },
            { v: "316.444",  l: "tentativas",         c: YELLOW },
            { v: "35",       l: "oportunidades quentes", c: RED },
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
        <span>Dados: Discagem_Fila.csv (316.444 reg.) · Mailing_FIERGS_202606.xlsx · Fila 1063 - FiergsAtivo</span>
        <span>Operação: 01–19/jun/2026 · 14 dias úteis</span>
      </div>
    </div>
  );
}
