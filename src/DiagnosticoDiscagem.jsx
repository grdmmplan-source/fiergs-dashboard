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

const resumoGeral = {
  periodo: "01/06 – 05/06/2026",
  diasTrabalhados: 4,
  totalTentativas: 72113,
  cnpjsUnicos: 23331,
  mailingTotal: 64013,
  comTelefone: 20230,
  coberturaMailing: 36.4,
  atendidosDiscador: 39029,
  taxaContatoDiscador: 54.1,
  comAgente: 1723,
  taxaContatoReal: 2.4,
  convReal: 990,
  interesse: 240,
  retorno: 49,
  oportunidade: 4,
  totalPositivos: 293,
  mediaTentativasCNPJ: 3.09,
};

const porDia = [
  { dia: "01/06 (Seg)", total: 12243, atendido: 6733, comAgente: 290, positivos: 31, taxaContato: 55.0, cnpjUniq: 11784 },
  { dia: "02/06 (Ter)", total: 20185, atendido: 11476, comAgente: 479, positivos: 53, taxaContato: 56.9, cnpjUniq: 12843 },
  { dia: "03/06 (Qua)", total: 20018, atendido: 10906, comAgente: 507, positivos: 71, taxaContato: 54.5, cnpjUniq: 10448 },
  { dia: "05/06 (Sex)", total: 19654, atendido: 9914, comAgente: 450, positivos: 138, taxaContato: 50.4, cnpjUniq: 12930 },
];

const porHora = [
  { hora: "09h", total: 6385, atendido: 3732, taxa: 58.4 },
  { hora: "10h", total: 7412, atendido: 4079, taxa: 55.0 },
  { hora: "11h", total: 7110, atendido: 3664, taxa: 51.5 },
  { hora: "12h", total: 7626, atendido: 3499, taxa: 45.9 },
  { hora: "13h", total: 8582, atendido: 4733, taxa: 55.2 },
  { hora: "14h", total: 9073, atendido: 5187, taxa: 57.2 },
  { hora: "15h", total: 8234, atendido: 4681, taxa: 56.8 },
  { hora: "16h", total: 9662, atendido: 5247, taxa: 54.3 },
  { hora: "17h", total: 7986, atendido: 4190, taxa: 52.5 },
];

const agentes = [
  { nome: "Caique Fonseca", id: "6056", total: 273, atendidos: 272, convReal: 145, tma: 115, interesse: 40, oportunidade: 0 },
  { nome: "Roseli Honorato", id: "6044", total: 209, atendidos: 208, convReal: 130, tma: 111, interesse: 42, oportunidade: 0 },
  { nome: "Paulo Victor Santos", id: "6042", total: 225, atendidos: 225, convReal: 131, tma: 122, interesse: 22, oportunidade: 0 },
  { nome: "Sabrina Santana", id: "6041", total: 217, atendidos: 215, convReal: 123, tma: 96, interesse: 38, oportunidade: 0 },
  { nome: "Mariana Nunes", id: "6034", total: 260, atendidos: 257, convReal: 114, tma: 105, interesse: 33, oportunidade: 1 },
  { nome: "Simone Victoria", id: "6037", total: 197, atendidos: 196, convReal: 109, tma: 85, interesse: 18, oportunidade: 0 },
  { nome: "Kessia Angelo", id: "6035", total: 190, atendidos: 187, convReal: 86, tma: 75, interesse: 32, oportunidade: 0 },
  { nome: "Ana Beatriz", id: "6080", total: 104, atendidos: 104, convReal: 48, tma: 75, interesse: 9, oportunidade: 3 },
  { nome: "Lais Ferreira", id: "6053", total: 26, atendidos: 26, convReal: 12, tma: 81, interesse: 3, oportunidade: 0 },
  { nome: "Marcia Peixoto", id: "6052", total: 19, atendidos: 19, convReal: 10, tma: 118, interesse: 3, oportunidade: 0 },
];

const statusNegocio = [
  { name: "Ligação Caída", value: 313, color: RED },
  { name: "Desligou", value: 295, color: "#EF4444" },
  { name: "Informação", value: 255, color: BLUE },
  { name: "Interesse", value: 240, color: GREEN },
  { name: "Engano", value: 183, color: "#a0a0a0" },
  { name: "Fora do Perfil", value: 173, color: "#5a5a5a" },
  { name: "Lig. Muda", value: 102, color: "#4a4a4a" },
  { name: "Não Tabulado", value: 78, color: "#3a3a3a" },
  { name: "Retorno", value: 49, color: YELLOW },
  { name: "Oportunidade", value: 4, color: "#A855F7" },
];

const isdn = [
  { code: "147", desc: "Sem Resposta / Transferido", count: 30790, pct: 42.7 },
  { code: "128", desc: "Caixa Postal / Secretária", count: 17242, pct: 23.9 },
  { code: "19", desc: "Não Atendeu (Ring)", count: 13141, pct: 18.2 },
  { code: "1", desc: "Atendida Normal", count: 4683, pct: 6.5 },
  { code: "21", desc: "Rejeitou Chamada", count: 1766, pct: 2.4 },
  { code: "16", desc: "Normal Clearing", count: 1713, pct: 2.4 },
  { code: "Outros", desc: "Outros códigos", count: 2778, pct: 3.9 },
];

const mailingComparativo = [
  { label: "Base Mailing Total", value: 64013, color: "#4a4a4a" },
  { label: "Com Telefone", value: 20230, color: BLUE },
  { label: "CNPJs Discados", value: 23331, color: YELLOW },
  { label: "Com Agente Real", value: 1723, color: ORANGE },
  { label: "Conversa >30s", value: 990, color: GREEN },
  { label: "Leads Positivos", value: 293, color: "#A855F7" },
  { label: "Oportunidades", value: 4, color: RED },
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
      {sub && <div style={{ fontSize: 11, color: "#5a5a5a" }}>{sub}</div>}
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
    <div style={{ padding: "10px 14px", background: c + "11", border: `1px solid ${c}33`, borderLeft: `3px solid ${c}`, borderRadius: 4, fontSize: 12, color: "#a0a0a0", lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function TabFunil() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Alerta principal */}
      <AlertBox type="yellow">
        <strong style={{ color: YELLOW }}>⚠ Confirmação:</strong> O arquivo <em>Mailing_FIERGS_202606.xlsx</em> é <strong style={{ color: LIGHT }}>idêntico</strong> à base completa de prospecção (64.013 registros, mesma distribuição de porte, CNAE e região). A pesquisa RS cobre <strong style={{ color: GREEN }}>~100% do mailing enviado</strong> para operação.
      </AlertBox>

      {/* KPIs rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Período Trabalhado" value="4 dias" sub="01/06 a 05/06/2026" color={BLUE} size="big" />
        <MetricCard label="Total Tentativas" value="72.113" sub="Média 3,09 tent./CNPJ" color={GREEN} size="big" />
        <MetricCard label="Cobertura do Mailing" value="36,4%" sub="23.331 CNPJs únicos discados" color={YELLOW} size="big" />
        <MetricCard label="Leads Positivos" value="293" sub="Interesse + Retorno + Oportunidade" color="#A855F7" size="big" />
      </div>

      {/* FUNIL */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 24 }}>
        <SectionHeader title="Funil Real da Operação" badge={{ text: "Dados reais 4 dias", color: GREEN }} />
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
                  <div style={{ fontSize: 10, color: "#5a5a5a", marginBottom: 6, lineHeight: 1.3 }}>{step.label}</div>
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
            <strong style={{ color: RED }}>Taxa de Contato REAL: 2,4%</strong><br />
            O discador marca 54% como "Atendido", mas 94% são caixa postal / sem agente. Apenas 1.723 chamadas chegaram a agentes humanos.
          </AlertBox>
          <AlertBox type="yellow">
            <strong style={{ color: YELLOW }}>63,6% do mailing não foi tocado</strong><br />
            Restam ~40.682 CNPJs do mailing nunca discados. Incluindo o gap de contatos sem telefone (67,5%), o volume a trabalhar é crítico.
          </AlertBox>
          <AlertBox type="green">
            <strong style={{ color: GREEN }}>Tendência positiva: +345% em leads/dia</strong><br />
            Dia 1: 31 positivos → Dia 4: 138 positivos. Curva de aprendizado dos agentes ainda em ascensão.
          </AlertBox>
        </div>
      </div>

      {/* ISDN breakdown */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title='Diagnóstico de "Atendidos" — Códigos ISDN/SIP' />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            {isdn.map((item, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>
                    <span style={{ color: "#4a4a4a", fontFamily: "monospace", marginRight: 6 }}>[{item.code}]</span>
                    {item.desc}
                  </span>
                  <span style={{ color: item.code === "1" ? GREEN : item.code === "147" || item.code === "128" ? YELLOW : "#5a5a5a", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>
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
                Caixa postal + sem resposta = <strong style={{ color: RED }}>84,8%</strong> das tentativas.<br />
                Taxa real de humano contactado: <strong style={{ color: GREEN }}>~6,5%</strong> (cód. 1 + contatos c/ agente).
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
        <MetricCard label="Melhor Taxa Contato" value="56,9%" sub="02/06 (Terça)" color={GREEN} />
        <MetricCard label="Melhor Hora" value="09h" sub="58,4% — pior: 12h (45,9%)" color={GREEN} />
        <MetricCard label="Positivos Dia 1" value="31" sub="→ Dia 4: 138 (+345%)" color={YELLOW} />
        <MetricCard label="Agentes Produtivos" value="10" sub="11 no total — 1 supervisão" color={BLUE} />
      </div>

      {/* Por dia */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Evolução Diária — Tentativas, Contato e Leads" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={porDia} barCategoryGap="25%">
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
          📈 <strong style={{ color: BLUE }}>Tendência clara de crescimento</strong> em leads positivos: +21 (D1→D2), +18 (D2→D3), +67 (D3→D4). A curva de aprendizado dos agentes + limpeza de base ao longo dos dias explica a aceleração. Projeção para semana 2: 200–250 leads/dia.
        </AlertBox>
      </div>

      {/* Por hora */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Taxa de Contato por Hora do Dia" badge={{ text: "Otimização de janela", color: YELLOW }} />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={porHora}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="hora" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
            <YAxis domain={[40, 65]} tick={{ fill: "#a0a0a0", fontSize: 10 }} unit="%" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} formatter={(v) => [v + "%", "Taxa Contato"]} />
            <ReferenceLine y={54.1} stroke="#4a4a4a" strokeDasharray="4 4" label={{ value: "Média: 54,1%", fill: "#5a5a5a", fontSize: 11 }} />
            <Line type="monotone" dataKey="taxa" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <div style={{ background: GREEN + "18", border: `1px solid ${GREEN}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>🟢 Janela Premium</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>09h–10h e 14h–15h</div>
            <div style={{ color: "#5a5a5a", fontSize: 11 }}>Acima de 56% de contato — priorizar volume nesses horários</div>
          </div>
          <div style={{ background: YELLOW + "18", border: `1px solid ${YELLOW}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: YELLOW, fontSize: 11, fontWeight: 700 }}>🟡 Horário de Atenção</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>12h–12h59 (almoço)</div>
            <div style={{ color: "#5a5a5a", fontSize: 11 }}>Taxa cai para 45,9% — menor eficiência operacional</div>
          </div>
          <div style={{ background: BLUE + "18", border: `1px solid ${BLUE}44`, borderRadius: 4, padding: "10px 14px" }}>
            <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>🔵 Recomendação</div>
            <div style={{ color: LIGHT, fontSize: 13, fontWeight: 700 }}>Pausar 12h–13h</div>
            <div style={{ color: "#5a5a5a", fontSize: 11 }}>Redirecionar volume para 14h–16h e economizar tentativas</div>
          </div>
        </div>
      </div>

      {/* Status Negócio */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Status de Negócio — Tabulação dos Agentes" badge={{ text: "1.712 tabulações", color: BLUE }} />
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
              <div style={{ color: "#5a5a5a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>BREAKDOWN DE NEGÓCIO</div>
              {[
                { label: "Leads Positivos (Int.+Ret.+Oport.)", value: 293, pct: "17,1%", color: GREEN },
                { label: "Ligação com Problema (caída+muda)", value: 415, pct: "24,2%", color: RED },
                { label: "Contato Neutro (info+desligou)", value: 550, pct: "32,1%", color: BLUE },
                { label: "Fora do Perfil / Engano", value: 356, pct: "20,8%", color: "#5a5a5a" },
                { label: "Não Tabulado pelo CRM", value: 78, pct: "4,6%", color: YELLOW },
                { label: "Oportunidade Quente", value: 4, pct: "0,2%", color: "#A855F7" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{item.value} <span style={{ color: "#4a4a4a", fontWeight: 400 }}>({item.pct})</span></span>
                </div>
              ))}
            </div>
            <AlertBox type="yellow">
              <strong style={{ color: YELLOW }}>⚠ "Fora do Perfil" = 173 tabulações</strong> — indicativo de que parte da base contém empresas não-MPE ou fora do escopo do programa. Cruzar com campo "porte = Grande" (27,1% da base).
            </AlertBox>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabAgentes() {
  const [sort, setSort] = useState("interesse");
  const sorted = [...agentes].sort((a, b) => b[sort] - a[sort]);
  const totalInteresse = agentes.reduce((s, a) => s + a.interesse, 0);
  const totalOport = agentes.reduce((s, a) => s + a.oportunidade, 0);
  const avgTma = Math.round(agentes.reduce((s, a) => s + a.tma, 0) / agentes.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Agentes Produtivos" value="10" sub="1 supervisão (Esther)" color={BLUE} />
        <MetricCard label="Total Interesses" value={totalInteresse} sub="Distribuídos entre 10 agentes" color={GREEN} />
        <MetricCard label="Oportunidades" value={totalOport} sub="Ana Beatriz (3) + Mariana (1)" color="#A855F7" />
        <MetricCard label="TMA Médio" value={`${avgTma}s`} sub="~1min 35s — benchmark 3–5min" color={YELLOW} />
      </div>

      {/* Tabela de agentes */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>Ranking de Agentes</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["interesse", "Interesse"], ["convReal", "Conv. Real"], ["tma", "TMA"]].map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)} style={{
                padding: "5px 12px", borderRadius: 3, border: `1px solid ${sort === k ? GREEN : BORDER}`,
                background: sort === k ? GREEN + "22" : "transparent", color: sort === k ? GREEN : "#5a5a5a",
                cursor: "pointer", fontSize: 11
              }}>{l}</button>
            ))}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#111" }}>
              {["#", "Agente", "Atendidos", "Conv. Real", "Conv. Real %", "TMA (s)", "Interesses", "Oportunid.", "Conv. Rate"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ag, i) => {
              const convPct = (ag.convReal / ag.atendidos * 100).toFixed(1);
              const convRate = ((ag.interesse + ag.oportunidade) / ag.convReal * 100).toFixed(1);
              const isTop = i < 3;
              return (
                <tr key={ag.id} style={{ borderBottom: `1px solid ${BORDER}`, background: isTop ? GREEN + "08" : "transparent" }}>
                  <td style={{ padding: "8px 10px", color: isTop ? GREEN : "#4a4a4a", fontWeight: isTop ? 700 : 400, fontFamily: "monospace" }}>
                    {isTop ? ["🥇", "🥈", "🥉"][i] : i + 1}
                  </td>
                  <td style={{ padding: "8px 10px", color: LIGHT, fontWeight: 600 }}>{ag.nome}</td>
                  <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace" }}>{ag.atendidos}</td>
                  <td style={{ padding: "8px 10px", color: BLUE, fontFamily: "monospace", fontWeight: 700 }}>{ag.convReal}</td>
                  <td style={{ padding: "8px 10px", color: "#5a5a5a", fontFamily: "monospace" }}>{convPct}%</td>
                  <td style={{ padding: "8px 10px", color: ag.tma > 100 ? GREEN : ag.tma > 80 ? YELLOW : RED, fontFamily: "monospace", fontWeight: 700 }}>{ag.tma}s</td>
                  <td style={{ padding: "8px 10px", color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>{ag.interesse}</td>
                  <td style={{ padding: "8px 10px", color: ag.oportunidade > 0 ? "#A855F7" : "#4a4a4a", fontWeight: 700, fontFamily: "monospace" }}>{ag.oportunidade}</td>
                  <td style={{ padding: "8px 10px", color: parseFloat(convRate) > 30 ? GREEN : YELLOW, fontFamily: "monospace" }}>{convRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <AlertBox type="green">
            🏆 <strong style={{ color: GREEN }}>Top performers: Roseli (42 int.) e Caique (40 int.)</strong><br />
            TMA acima de 110s indica engajamento real com o decisor. Modelo de script desses agentes deve ser replicado para o time.
          </AlertBox>
          <AlertBox type="yellow">
            ⚠ <strong style={{ color: YELLOW }}>TMA médio: 97s (~1min37s)</strong> — <strong style={{ color: LIGHT }}>abaixo do ideal</strong> para campanha gov. (benchmark: 3–5min). Indica que muitos contatos são brevemente desligados antes de completar o pitch.
          </AlertBox>
        </div>
      </div>

      {/* Gráfico interesse por agente */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Interesses por Agente vs. Conversas Reais" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={agentes.sort((a, b) => b.interesse - a.interesse)} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="nome" tick={{ fill: "#a0a0a0", fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            <Bar dataKey="convReal" name="Conversas Reais (>30s)" fill={BLUE} radius={[2, 2, 0, 0]} />
            <Bar dataKey="interesse" name="Interesses" fill={GREEN} radius={[2, 2, 0, 0]} />
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
        { kpi: "Taxa de Contato (Discador)", real: "54,1%", benchmark: "25–35%", delta: "+19pp", status: "green", nota: "Alta por caixa postal — contato humano real é 2,4%" },
        { kpi: "Taxa de Contato REAL (c/ Agente)", real: "2,4%", benchmark: "25–35%", delta: "-22pp", status: "red", nota: "Apenas 1.723 de 72.113 tentativas chegaram a agente" },
        { kpi: "Média Tentativas/CNPJ", real: "3,09", benchmark: "3–5", delta: "✓ OK", status: "green", nota: "Dentro da faixa ideal de tentativas" },
        { kpi: "Cobertura do Mailing (4 dias)", real: "36,4%", benchmark: "60–80% (5 dias)", delta: "-24pp", status: "yellow", nota: "Ritmo atual cobre 9,1%/dia — 11 dias para 100%" },
        { kpi: "Abandon Rate", real: "< 1%", benchmark: "< 5%", delta: "✓ OK", status: "green", nota: "Campanha ativa outbound — sem risco de abandono" },
      ]
    },
    {
      pilar: "🎯 Qualidade do Contato", color: BLUE,
      items: [
        { kpi: "Conversa Real (>30s) / Atendidos", real: "2,5%", benchmark: "40–60%", delta: "-37pp", status: "red", nota: "Indica alto índice de caixa postal computada como atendido" },
        { kpi: "TMA (tempo médio conversa real)", real: "97s", benchmark: "3–5 min (180–300s)", delta: "-83s", status: "red", nota: "Conversa muito curta — pitch não está sendo completado" },
        { kpi: "Fora do Perfil / Total Tabulações", real: "10,1%", benchmark: "< 10%", delta: "~OK", status: "yellow", nota: "173 tabulações fora do perfil — revisar elegibilidade das 'Grandes'" },
        { kpi: "Não Tabulado pelo CRM", real: "4,6%", benchmark: "< 3%", delta: "+1,6pp", status: "yellow", nota: "78 registros sem tabulação — treinamento de aderência ao CRM" },
        { kpi: "Engano / Total Tabulações", real: "10,7%", benchmark: "< 5%", delta: "+5,7pp", status: "red", nota: "183 enganos — qualidade dos números de telefone da base" },
      ]
    },
    {
      pilar: "📈 Conversão / Negócio", color: YELLOW,
      items: [
        { kpi: "Taxa de Interesse (convs reais)", real: "24,2%", benchmark: "15–25%", delta: "✓ OK", status: "green", nota: "240 interesses de 990 conversas — acima do benchmark" },
        { kpi: "Oportunidades / Leads Positivos", real: "1,4%", benchmark: "5–15%", delta: "-4pp", status: "yellow", nota: "Apenas 4 oportunidades — funil precisa de acompanhamento" },
        { kpi: "Leads Positivos / Total Tentativas", real: "0,41%", benchmark: "1–3%", delta: "-0,6pp", status: "red", nota: "Diluição pelo volume de caixa postal — KPI real: 17,1% das tabulações" },
        { kpi: "Retornos Agendados", real: "49", benchmark: "KPI gestão", delta: "—", status: "yellow", nota: "49 retornos = pipeline aquecido para semana 2" },
        { kpi: "Evolução Diária de Leads", real: "+345%", benchmark: "Crescente", delta: "✓ Positivo", status: "green", nota: "31 → 53 → 71 → 138 leads/dia — curva ascendente saudável" },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AlertBox type="blue">
        <strong style={{ color: BLUE }}>📌 Nota metodológica:</strong> KPIs calculados com base em <strong style={{ color: LIGHT }}>dados reais de operação</strong> (4 dias, 72.113 registros). Taxa de contato do discador ≠ taxa de contato humano — distinguir os dois é fundamental para reporting correto ao cliente.
      </AlertBox>

      {kpis.map((pilar, pi) => (
        <div key={pi} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20 }}>
          <SectionHeader title={pilar.pilar} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["KPI", "Valor Real", "Benchmark", "∆ vs. Benchmark", "Status", "Observação"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
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
                    <td style={{ padding: "8px 10px", color: "#5a5a5a", fontSize: 11 }}>{row.nota}</td>
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
      titulo: "Reconfigurar Taxa de Contato no Report",
      problema: "Report atual mostra 54% de contato — enganoso. Caixa postal está sendo contada como 'Atendido'.",
      acao: "Criar KPI separado: (a) Contato Discador e (b) Contato Humano Real. Apresentar 2,4% como taxa real ao cliente.",
      impacto: "Alinhamento de expectativas — evita crise no fechamento de resultados"
    },
    {
      urgencia: "🔴 IMEDIATO", cor: RED,
      titulo: "Investigar ISDN 147 (30.790 registros)",
      problema: "42,7% das ligações caem no código 147 (transferido/secretária). Pode ser problema de DDD, prefixo ou PABX das empresas.",
      acao: "Auditar amostra de 200 registros cód. 147: verificar se são PABX bloqueados, números VoIP ou caixa postal corporativa.",
      impacto: "Redução de tentativas desperdiçadas — +15pp na taxa de contato real"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Estender Horário 09h–10h e 14h–15h",
      problema: "Janela das 9h entrega 58,4% de contato vs. 45,9% no almoço. Operação inicia nesse pico mas pode reforçar.",
      acao: "Alocar mais agentes no início da manhã (9h–11h) e pós-almoço (13h30–16h). Pausar discagem 12h–13h.",
      impacto: "+8–12pp na taxa de contato real; economia de ~8k tentativas/dia"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Replicar Script dos Top 3 Agentes",
      problema: "Roseli (42 int., TMA 111s), Caique (40 int., TMA 115s) e Sabrina (38 int., TMA 96s) superam a média. Padrão não replicado.",
      acao: "Gravar e transcrever 10 melhores calls de cada top agent. Extrair padrão de abertura, objeção e fechamento de interesse.",
      impacto: "+20–30% de interesses no time inteiro se média subir para 35 int./agente"
    },
    {
      urgencia: "🟡 CURTO PRAZO", cor: YELLOW,
      titulo: "Trabalhar os 49 Retornos da Semana 1",
      problema: "49 retornos agendados são o pipeline mais quente disponível. Risco de esfriar se não trabalhados na semana 2.",
      acao: "Criar fila prioritária para os 49 retornos na segunda semana. Designar agentes top (Roseli/Caique).",
      impacto: "Conversão estimada: 30–40% dos retornos em Interesse → 15–20 novos leads"
    },
    {
      urgencia: "🟢 MÉDIO PRAZO", cor: GREEN,
      titulo: "Segmentar Empresas 'Grande' para Fila Separada",
      problema: "17.356 empresas classificadas como 'Grande' (27,1%) têm elegibilidade questionável no programa MPE. 173 tabulações de 'Fora do Perfil' confirmam isso.",
      acao: "Criar fila específica para 'Grande' com script adaptado ou retirar da discagem principal. Focar esforço em Micro + Pequena.",
      impacto: "Redução de 27% de tentativas inelegíveis + melhora no índice de qualificação MPE"
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
          <div style={{ color: "#a0a0a0", fontSize: 12, marginBottom: 10 }}><strong style={{ color: "#5a5a5a" }}>Problema:</strong> {a.problema}</div>
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

      {/* Projeção semana 2 */}
      <div style={{ background: CARD, border: `1px solid ${GREEN}44`, borderRadius: 4, padding: 20 }}>
        <SectionHeader title="Projeção Semana 2 — Com as Ações Aplicadas" badge={{ text: "Estimativa conservadora", color: GREEN }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard label="Mailing Restante" value="~40.682" sub="CNPJs ainda não trabalhados" color={BLUE} />
          <MetricCard label="Leads/Dia Projetados" value="200–250" sub="Com curva + otimização de janela" color={GREEN} />
          <MetricCard label="Retornos a Converter" value="~15–20" sub="49 retornos × 30–40% conv." color={YELLOW} />
          <MetricCard label="Acumulado ao Final S2" value="~1.400–1.700" sub="Total leads positivos acumulados" color="#A855F7" />
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
          <div style={{ fontSize: 12, color: "#5a5a5a" }}>Fila: 1063 - Ativo · 01/06–05/06/2026 · 4 dias úteis · 10 agentes</div>
        </div>
        <div style={{ display: "flex", gap: 24, textAlign: "right", paddingRight: 4 }}>
          {[
            { v: "293",    l: "leads positivos", c: GREEN  },
            { v: "72.113", l: "tentativas",       c: YELLOW },
            { v: "36,4%",  l: "mailing coberto",  c: BLUE   },
          ].map(item => (
            <div key={item.l}>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.c, lineHeight: 1 }}>{item.v}</div>
              <div style={{ fontSize: 11, color: "#5a5a5a", marginTop: 2 }}>{item.l}</div>
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
            color: i === active ? BLUE : "#5a5a5a",
            cursor: "pointer", fontSize: 12, fontWeight: i === active ? 700 : 400,
            transition: "all 0.15s", fontFamily: "Inter, sans-serif", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tabComponents[active]}

      <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a3a3a" }}>
        <span>Dados: Discagem_Fila.csv · Mailing_FIERGS_202606.xlsx · Fila 1063 - Ativo</span>
        <span>Operação: 01–05/jun/2026</span>
      </div>
    </div>
  );
}
