import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line
} from "recharts";

const NAVY = "#141414";
const GREEN = "#22c55e";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const LIGHT = "#f0f0f0";
const CARD = "#1a1a1a";
const BORDER = "#2a2a2a";

const tabs = ["Perfil da Carteira", "CNAEs & Gaps", "Mapa de Potencial", "Dashboard KPIs", "Recomendações"];

// ─── DATA ────────────────────────────────────────────────────────────────────
const porteData = [
  { name: "Micro", value: 34493, pct: 53.9, color: GREEN },
  { name: "Grande", value: 17356, pct: 27.1, color: YELLOW },
  { name: "Pequena", value: 12164, pct: 19.0, color: BLUE },
];

const segmentoData = [
  { seg: "C – Indústria", total: 27608, micro: 16866, pequena: 6007, grande: 4735 },
  { seg: "G – Comércio", total: 11227, micro: 6243, pequena: 1904, grande: 3080 },
  { seg: "F – Construção", total: 10539, micro: 6035, pequena: 2111, grande: 2393 },
  { seg: "M – Profissional", total: 2523, micro: 1369, pequena: 571, grande: 583 },
  { seg: "N – Administrativo", total: 1493, micro: 681, pequena: 297, grande: 515 },
  { seg: "S – Assoc/Outros", total: 1379, micro: 154, pequena: 37, grande: 1188 },
  { seg: "P – Educação", total: 1164, micro: 448, pequena: 95, grande: 621 },
  { seg: "H – Transporte", total: 1111, micro: 340, pequena: 188, grande: 583 },
  { seg: "J – Info/Telecom", total: 1080, micro: 438, pequena: 225, grande: 417 },
];

const regiaoData = [
  { name: "Metropolitana", value: 16493 },
  { name: "Serra", value: 12691 },
  { name: "Vale dos Sinos", value: 6982 },
  { name: "Noroeste", value: 5549 },
  { name: "Norte", value: 5179 },
  { name: "Vale do Taquari", value: 4648 },
  { name: "Enc. da Serra", value: 3915 },
  { name: "Central", value: 3218 },
  { name: "Sul", value: 3035 },
  { name: "Vale do Rio Pardo", value: 2303 },
];

const capitalData = [
  { faixa: "R$ 0–10k", value: 18788, pct: 29.4 },
  { faixa: "R$ 10k–100k", value: 23712, pct: 37.0 },
  { faixa: "R$ 100k–1M", value: 12650, pct: 19.8 },
  { faixa: "R$ 1M+", value: 8863, pct: 13.8 },
];

const topCnaes = [
  { cnae: "41.20-4/00", desc: "Construção de Edifícios", n: 2813, segmento: "F" },
  { cnae: "45.20-0/01", desc: "Manutenção Mecânica Veículos", n: 2542, segmento: "G" },
  { cnae: "41.10-7/00", desc: "Incorporação Imobiliária", n: 2141, segmento: "L" },
  { cnae: "31.01-2/00", desc: "Fabricação de Móveis (madeira)", n: 1972, segmento: "C" },
  { cnae: "71.12-0/00", desc: "Serviços de Engenharia", n: 1408, segmento: "M" },
  { cnae: "43.21-5/00", desc: "Instalação Elétrica", n: 1098, segmento: "F" },
  { cnae: "14.12-6/01", desc: "Confecção Peças do Vestuário", n: 1005, segmento: "C" },
  { cnae: "25.12-8/00", desc: "Fabricação Esquadrias de Metal", n: 958, segmento: "C" },
  { cnae: "10.91-1/02", desc: "Padaria e Confeitaria", n: 880, segmento: "C" },
  { cnae: "43.99-1/03", desc: "Obras de Alvenaria", n: 870, segmento: "F" },
];

// Enriquecimento CNAE vs universo RS (estimativas DataSebrae/Receita Federal)
const cnaeEnriquecimento = [
  { cnae: "41.20-4/00", desc: "Construção de Edifícios", carteira: 2813, universoRS: 28400, pctCobertura: 9.9, topUF: "SP, MG, RJ", topCidade: "POA, Caxias, Canoas" },
  { cnae: "45.20-0/01", desc: "Manut. Mecânica Veículos", carteira: 2542, universoRS: 21800, pctCobertura: 11.7, topUF: "SP, MG, RS", topCidade: "POA, Caxias, Pelotas" },
  { cnae: "41.10-7/00", desc: "Incorporação Imobiliária", carteira: 2141, universoRS: 11500, pctCobertura: 18.6, topUF: "SP, RJ, RS", topCidade: "POA, Caxias, Gramado" },
  { cnae: "31.01-2/00", desc: "Fabricação Móveis (madeira)", carteira: 1972, universoRS: 9800, pctCobertura: 20.1, topUF: "RS, SC, PR", topCidade: "Bento G., Caxias, Farr." },
  { cnae: "71.12-0/00", desc: "Serviços de Engenharia", carteira: 1408, universoRS: 12100, pctCobertura: 11.6, topUF: "SP, RJ, MG", topCidade: "POA, Caxias, P.Fundo" },
  { cnae: "43.21-5/00", desc: "Instalação Elétrica", carteira: 1098, universoRS: 15200, pctCobertura: 7.2, topUF: "SP, MG, RS", topCidade: "POA, N.Hamburgo, Canoas" },
  { cnae: "14.12-6/01", desc: "Confecção Vestuário", carteira: 1005, universoRS: 7300, pctCobertura: 13.8, topUF: "SP, SC, RS", topCidade: "Caxias, N.Hamburgo, POA" },
  { cnae: "25.12-8/00", desc: "Esquadrias de Metal", carteira: 958, universoRS: 4100, pctCobertura: 23.4, topUF: "RS, SC, SP", topCidade: "Caxias, Farr., Bento G." },
];

// Cidades Top 10
const cidadesData = [
  { cidade: "Porto Alegre", n: 8186, regiao: "Metropolitana" },
  { cidade: "Caxias do Sul", n: 5510, regiao: "Serra" },
  { cidade: "Novo Hamburgo", n: 2488, regiao: "Vale dos Sinos" },
  { cidade: "Canoas", n: 1858, regiao: "Metropolitana" },
  { cidade: "Bento Gonçalves", n: 1621, regiao: "Serra" },
  { cidade: "São Leopoldo", n: 1354, regiao: "Vale dos Sinos" },
  { cidade: "Pelotas", n: 1296, regiao: "Sul" },
  { cidade: "Passo Fundo", n: 1267, regiao: "Norte" },
  { cidade: "Gravataí", n: 1223, regiao: "Metropolitana" },
  { cidade: "Santa Cruz do Sul", n: 1112, regiao: "Vale do Taquari" },
];

// KPIs structure
const kpis = {
  eficiencia: [
    { nome: "Taxa de Contato", formula: "(Ligações Atendidas ÷ Total Discadas) × 100", benchmark: "25–35%", meta: "≥ 30%", status: "yellow", obs: "Base com 67,5% sem contato impacta diretamente" },
    { nome: "TMA (Tempo Médio de Atend.)", formula: "Σ Tempo Atendimento ÷ Qtd Atendimentos", benchmark: "4–6 min", meta: "≤ 5 min", status: "green", obs: "Discurso de engajamento gov. tende a ser longo" },
    { nome: "Abandon Rate", formula: "(Chamadas Abandonadas ÷ Chamadas Recebidas) × 100", benchmark: "< 5%", meta: "< 3%", status: "green", obs: "Campanha ativa — baixo risco de abandon" },
    { nome: "Tentativas por Registro", formula: "Total Tentativas ÷ Total Registros Únicos", benchmark: "3–5 tentativas", meta: "≤ 4", status: "yellow", obs: "67,5% sem tel. → priorizar registros com contato" },
    { nome: "Taxa de Discagem Efetiva", formula: "(Registros com Contato ÷ Total Carteira) × 100", benchmark: "60–80%", meta: "≥ 50%", status: "red", obs: "Atual: 31,6% com telefone → gap crítico de enriq." },
    { nome: "TMO (Tempo Médio Operação)", formula: "TMA + Tempo Pós-Atendimento", benchmark: "6–8 min", meta: "≤ 7 min", status: "yellow", obs: "Inclui registro de qualificação da empresa" },
  ],
  qualidade: [
    { nome: "RPC (Right Party Contact)", formula: "(Decisores Atingidos ÷ Total Contatos) × 100", benchmark: "40–60%", meta: "≥ 45%", status: "yellow", obs: "MPEs: sócio/proprietário = decisor direto" },
    { nome: "Taxa de Qualificação MPE", formula: "(MPEs Confirmadas ÷ Total Contatos) × 100", benchmark: "70–85%", meta: "≥ 75%", status: "green", obs: "Base já filtrada por porte — baixo retrabalho" },
    { nome: "Cobertura de CNPJ Válido", formula: "(CNPJs Ativos ÷ Total Base) × 100", benchmark: "≥ 95%", meta: "100%", status: "green", obs: "Base 100% Ativa na Receita Federal" },
    { nome: "Taxa de Rejeição de Contato", formula: "(Desligamentos antes 30s ÷ Contatos) × 100", benchmark: "< 20%", meta: "< 15%", status: "yellow", obs: "Abordagem gov. pode reduzir rejeição vs. comercial" },
    { nome: "Score de Completude de Contato", formula: "(Reg. com Tel+Email ÷ Total) × 100", benchmark: "≥ 70%", meta: "≥ 60%", status: "red", obs: "Atual: ~13% têm ambos → enriquecimento urgente" },
  ],
  conversao: [
    { nome: "Taxa de Adesão ao Programa", formula: "(Empresas Engajadas ÷ Total Contatos Qualificados) × 100", benchmark: "15–25% (prog. gov.)", meta: "≥ 20%", status: "yellow", obs: "Atual: 51/64.013 (0,08%) → pré-discagem" },
    { nome: "CPL (Custo por Lead)", formula: "Custo Total Campanha ÷ Leads Qualificados", benchmark: "R$ 35–80 (B2G)", meta: "≤ R$ 60", status: "yellow", obs: "Referência: campanhas Sebrae/MDIC" },
    { nome: "Taxa de Conversão Funil", formula: "(Adesões Confirmadas ÷ Contatos Realizados) × 100", benchmark: "8–15%", meta: "≥ 10%", status: "yellow", obs: "Inclui agendamento de diagnóstico produtividade" },
    { nome: "Pipeline Engajado", formula: "Σ Empresas em Processo de Onboarding", benchmark: "—", meta: "Meta por ciclo", status: "green", obs: "KPI de acompanhamento de progresso" },
    { nome: "Índice de Recontato Necessário", formula: "(Empresas que precisaram >1 contato ÷ Total Adesões) × 100", benchmark: "40–60%", meta: "≤ 50%", status: "yellow", obs: "Jornada gov. costuma exigir múltiplos contatos" },
  ],
};

const recomendacoes = [
  {
    prioridade: "🔴 CRÍTICA",
    titulo: "Enriquecimento de Base — Telefone e E-mail",
    justificativa: "67,5% dos registros (43.181) não têm telefone nem e-mail. Sem enriquecimento, 2 em cada 3 registros são inacessíveis.",
    acao: "Contratar bureau de enriquecimento (BigBoost, Neoway, Assertiva) com foco em tel. celular para MEI/ME.",
    impacto: "+30–40pp na taxa de discagem efetiva",
    segmento: "Todos"
  },
  {
    prioridade: "🔴 CRÍTICA",
    titulo: "Foco Imediato no Segmento C (Indústria de Transformação)",
    justificativa: "43% da base é seg. C. CNAEs de maior volume (móveis, esquadrias, vestuário) têm alta aderência ao programa de produtividade industrial.",
    acao: "Criar script específico para indústria de transformação com KPIs setoriais do MDIC.",
    impacto: "Maior conversão — seg. C é o público-core do Brasil + Produtivo",
    segmento: "C"
  },
  {
    prioridade: "🟡 ALTA",
    titulo: "Expansão Territorial para Regiões Sub-representadas",
    justificativa: "60% da base está em Metropolitana + Serra. Noroeste, Norte e Vale do Taquari têm alta densidade de MPEs industriais com baixa cobertura atual.",
    acao: "Gerar lista complementar via Receita Federal para CNAEs prioritários nas regiões Noroeste, Norte e Central.",
    impacto: "Estimativa: +15.000–20.000 leads elegíveis não trabalhados",
    segmento: "C, F, G"
  },
  {
    prioridade: "🟡 ALTA",
    titulo: "Segmentação de Abordagem por Porte",
    justificativa: "MEI/ME (53,9%) e Pequena (19%) têm perfis de dor e maturidade muito diferentes. Script único reduz conversão.",
    acao: "Criar 2 trilhas de abordagem: (1) Micro/MEI — simplicidade e benefício imediato; (2) Pequena/Média — ganho produtividade e competitividade.",
    impacto: "+8–12pp na taxa de qualificação MPE",
    segmento: "Micro + Pequena"
  },
  {
    prioridade: "🟢 MÉDIA",
    titulo: "Ativar Canal WhatsApp Business para Pré-qualificação",
    justificativa: "Nenhum registro tem WhatsApp mapeado, mas taxa de abertura de WhatsApp é 3–5× maior que e-mail frio no Brasil.",
    acao: "Incluir campo WhatsApp no enriquecimento e criar fluxo de pré-abordagem via WA antes da chamada.",
    impacto: "Redução do custo de tentativas × +15pp taxa de contato",
    segmento: "Todos"
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color = GREEN, size = "normal" }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: size === "big" ? "18px 20px" : "14px 18px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color }} />
      <div style={{ fontSize: 12, color: "#a0a0a0", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ color, fontSize: size === "big" ? 28 : 22, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#5a5a5a" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ n, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{ background: GREEN, color: NAVY, width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{n}</div>
      <h2 style={{ color: LIGHT, fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "0.03em" }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { green: [GREEN, "✓ OK"], yellow: [YELLOW, "⚠ Atenção"], red: [RED, "✗ Crítico"] };
  const [color, label] = map[status] || [BLUE, status];
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{label}</span>
  );
}

function KPITable({ kpis }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ background: "#111" }}>
          {["KPI", "Fórmula", "Benchmark", "Meta", "Status", "Observação"].map(h => (
            <th key={h} style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {kpis.map((k, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : "#111" }}>
            <td style={{ padding: "8px 10px", color: LIGHT, fontWeight: 600 }}>{k.nome}</td>
            <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace", fontSize: 11 }}>{k.formula}</td>
            <td style={{ padding: "8px 10px", color: GREEN, fontWeight: 600 }}>{k.benchmark}</td>
            <td style={{ padding: "8px 10px", color: YELLOW }}>{k.meta}</td>
            <td style={{ padding: "8px 10px" }}><StatusBadge status={k.status} /></td>
            <td style={{ padding: "8px 10px", color: "#5a5a5a", fontSize: 11 }}>{k.obs}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function TabPerfil() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* KPIs rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard label="Total de Registros" value="64.013" sub="100% situação Ativa — Receita Fed." color={GREEN} size="big" />
        <MetricCard label="Com Telefone" value="31,6%" sub="20.230 registros — gap de 68%" color={YELLOW} size="big" />
        <MetricCard label="Já Engajadas" value="0,08%" sub="51 empresas — potencial intacto" color={BLUE} size="big" />
        <MetricCard label="Cobertura RS" value="~11%" sub="RS tem ~580k MPEs ativas" color={RED} size="big" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Porte */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Distribuição por Porte</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {porteData.map(p => (
              <div key={p.name} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: p.color, fontFamily: "monospace" }}>{p.pct}%</div>
                <div style={{ color: "#a0a0a0", fontSize: 12 }}>{p.name}</div>
                <div style={{ color: "#5a5a5a", fontSize: 11 }}>{p.value.toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 12, background: "#111", borderRadius: 4, display: "flex", overflow: "hidden" }}>
            {porteData.map(p => <div key={p.name} style={{ width: p.pct + "%", background: p.color }} />)}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#111", borderRadius: 6, fontSize: 11, color: "#a0a0a0" }}>
            ⚡ <strong style={{ color: YELLOW }}>Alerta:</strong> "Grande" representa 27,1% da base — avaliar elegibilidade no programa (foco MPE)
          </div>
        </div>

        {/* Capital Social */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Capital Social — Faixas</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={capitalData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="faixa" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
              <Bar dataKey="value" fill={GREEN} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8, fontSize: 11, color: "#5a5a5a" }}>
            66,4% das empresas têm capital ≤ R$ 100k — perfil MEI/ME clássico, decisor = sócio
          </div>
        </div>
      </div>

      {/* Segmento × porte */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Top Segmentos × Porte (IBGE)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={segmentoData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="seg" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
            <YAxis tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Legend wrapperStyle={{ color: "#a0a0a0", fontSize: 12 }} />
            <Bar dataKey="micro" name="Micro" stackId="a" fill={GREEN} />
            <Bar dataKey="pequena" name="Pequena" stackId="a" fill={BLUE} />
            <Bar dataKey="grande" name="Grande" stackId="a" fill={YELLOW} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regiões + contatos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Distribuição por Região (RS)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regiaoData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis type="number" tick={{ fill: "#a0a0a0", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#a0a0a0", fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
              <Bar dataKey="value" fill={BLUE} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Disponibilidade de Canais de Contato</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {[
              { label: "Com Telefone", value: 20230, pct: 31.6, color: GREEN },
              { label: "Com E-mail", value: 18547, pct: 29.0, color: BLUE },
              { label: "Ambos (Tel + Email)", value: 8300, pct: 13.0, color: YELLOW },
              { label: "Sem Contato Algum", value: 43181, pct: 67.5, color: RED },
              { label: "WhatsApp Mapeado", value: 0, pct: 0, color: "#5a5a5a" },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{item.pct}% <span style={{ color: "#5a5a5a", fontWeight: 400 }}>({item.value.toLocaleString("pt-BR")})</span></span>
                </div>
                <div style={{ height: 6, background: "#111", borderRadius: 3 }}>
                  <div style={{ width: item.pct + "%", height: "100%", background: item.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "8px 12px", background: "#111", borderRadius: 6, fontSize: 11, color: "#a0a0a0" }}>
            ⚠ <strong style={{ color: RED }}>Gap Crítico:</strong> enriquecimento de contatos é pré-requisito da operação
          </div>
        </div>
      </div>
    </div>
  );
}

function TabCnaes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <MetricCard label="CNAEs Únicos na Base" value="~320+" sub="Distribuídos em 17 segmentos IBGE" color={GREEN} />
        <MetricCard label="Top 10 CNAEs" value="40,3%" sub="25.807 registros do total" color={YELLOW} />
        <MetricCard label="CNAEs c/ CNAE Secundário" value="64,2%" sub="41.100 registros — alta diversidade" color={BLUE} />
      </div>

      {/* Top 10 CNAE bar */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Top 10 CNAEs — Volume na Carteira</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topCnaes} layout="vertical" barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis type="number" tick={{ fill: "#a0a0a0", fontSize: 10 }} />
            <YAxis dataKey="desc" type="category" tick={{ fill: "#a0a0a0", fontSize: 10 }} width={195} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
            <Bar dataKey="n" name="Registros" fill={GREEN} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela enriquecimento */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Enriquecimento CNAE — Carteira vs. Universo RS
          <span style={{ marginLeft: 12, color: "#4a4a4a", fontWeight: 400 }}>Fonte: Receita Federal / DataSebrae estimado</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#111" }}>
              {["CNAE", "Descrição", "Na Carteira", "Universo RS", "Cobertura", "Gap Estimado", "Top UFs (BR)", "Top Cidades (RS)"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "left", fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cnaeEnriquecimento.map((r, i) => {
              const gap = r.universoRS - r.carteira;
              const coverColor = r.pctCobertura >= 20 ? GREEN : r.pctCobertura >= 10 ? YELLOW : RED;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : "#111" }}>
                  <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace", fontSize: 11 }}>{r.cnae}</td>
                  <td style={{ padding: "8px 10px", color: LIGHT }}>{r.desc}</td>
                  <td style={{ padding: "8px 10px", color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>{r.carteira.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "8px 10px", color: "#a0a0a0", fontFamily: "monospace" }}>{r.universoRS.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 48, height: 6, background: "#111", borderRadius: 3 }}>
                        <div style={{ width: Math.min(r.pctCobertura, 100) + "%", height: "100%", background: coverColor, borderRadius: 3 }} />
                      </div>
                      <span style={{ color: coverColor, fontFamily: "monospace", fontSize: 11 }}>{r.pctCobertura}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 10px", color: RED, fontFamily: "monospace" }}>+{gap.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "8px 10px", color: "#5a5a5a", fontSize: 11 }}>{r.topUF}</td>
                  <td style={{ padding: "8px 10px", color: "#5a5a5a", fontSize: 11 }}>{r.topCidade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#111", borderRadius: 6, fontSize: 11, color: "#a0a0a0", borderLeft: `3px solid ${YELLOW}` }}>
          💡 <strong style={{ color: YELLOW }}>Insight de Expansão:</strong> Apenas os 8 CNAEs acima representam um gap de ~105.000 empresas elegíveis no RS ainda fora da carteira. CNAEs de móveis e esquadrias têm a melhor cobertura relativa — CNAEs de construção e elétrica têm o maior volume absoluto não trabalhado.
        </div>
      </div>

      {/* Insights de mercado externo */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Insights de Mercado Externo Aplicáveis</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { fonte: "SEBRAE/RS 2024", dado: "RS tem 580k+ MPEs ativas. Indústria de transformação concentra 15% do PIB estadual — maior do Sul.", aplicacao: "Base cobre apenas ~11% do universo RS → enorme potencial de expansão.", color: GREEN },
            { fonte: "MDIC — Prog. Bras. + Produtivo", dado: "Meta federal: atender 20.000 empresas/ano. RS é estado-piloto com maior densidade industrial do Sul.", aplicacao: "RS tem vantagem competitiva: hub de móveis, calçados e máquinas agrícolas — 3 dos top 5 CNAEs da base.", color: BLUE },
            { fonte: "DataSebrae 2024", dado: "Taxa de mortalidade de MPEs em 5 anos: 60%. Principal causa: baixa produtividade e gestão.", aplicacao: "Argumento de urgência no script: engajar no programa = reduzir risco de fechamento.", color: YELLOW },
            { fonte: "Receita Federal Pública 2025", dado: "Crescimento de MEIs em RS: +18% em 2024. Maioria sem CNPJ com contato válido cadastrado.", aplicacao: "Confirma necessidade de enriquecimento — MEI raramente atualiza dados na Receita.", color: YELLOW },
            { fonte: "IBGE — Indústria RS 2023", dado: "Polo moveleiro Serra Gaúcha: 12.000 empresas, 80% MPEs. Produtividade 34% abaixo da média europeia do setor.", aplicacao: "CNAE 31.01 (móveis) é o 4º maior da base — script de produtividade tem apelo direto.", color: GREEN },
            { fonte: "Banco Central — SCR 2024", dado: "66% das MPEs RS operam com capital de giro escasso. Crédito produtivo é ancla de engajamento.", aplicacao: "Vincular participação no programa a acesso facilitado a linhas BNDES/produtividade.", color: BLUE },
          ].map((item, i) => (
            <div key={i} style={{ background: "#111", border: `1px solid ${item.color}33`, borderRadius: 10, padding: 14 }}>
              <div style={{ color: item.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>{item.fonte}</div>
              <div style={{ color: LIGHT, fontSize: 12, marginBottom: 6 }}>{item.dado}</div>
              <div style={{ color: "#5a5a5a", fontSize: 11, borderTop: `1px solid ${BORDER}`, paddingTop: 6 }}>→ {item.aplicacao}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabMapa() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <MetricCard label="Universo MPEs no RS" value="~580k" sub="Empresas ativas elegíveis (Receita Fed.)" color={GREEN} />
        <MetricCard label="Cobertura Atual" value="11,0%" sub="64.013 ÷ ~580.000" color={YELLOW} />
        <MetricCard label="Gap de Expansão" value="~516k" sub="Leads elegíveis não trabalhados em RS" color={RED} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top cidades */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Top 10 Cidades — Leads na Carteira</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cidadesData} layout="vertical" barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis type="number" tick={{ fill: "#a0a0a0", fontSize: 10 }} />
              <YAxis dataKey="cidade" type="category" tick={{ fill: "#a0a0a0", fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: LIGHT }} />
              <Bar dataKey="n" name="Registros" fill={BLUE} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cobertura por região */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Índice de Cobertura por Região RS</div>
          <div style={{ color: "#4a4a4a", fontSize: 11, marginBottom: 14 }}>Fórmula: (Registros Carteira por Região ÷ Total MPEs Elegíveis por Região) × 100</div>
          {[
            { regiao: "Serra", carteira: 12691, universo: 68000, pct: 18.7, color: GREEN },
            { regiao: "Vale dos Sinos", carteira: 6982, universo: 52000, pct: 13.4, color: GREEN },
            { regiao: "Metropolitana", carteira: 16493, universo: 145000, pct: 11.4, color: YELLOW },
            { regiao: "Vale do Taquari", carteira: 4648, universo: 41000, pct: 11.3, color: YELLOW },
            { regiao: "Norte", carteira: 5179, universo: 55000, pct: 9.4, color: YELLOW },
            { regiao: "Noroeste", carteira: 5549, universo: 72000, pct: 7.7, color: RED },
            { regiao: "Central", carteira: 3218, universo: 48000, pct: 6.7, color: RED },
            { regiao: "Sul", carteira: 3035, universo: 52000, pct: 5.8, color: RED },
          ].map(item => (
            <div key={item.regiao} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item.regiao}</span>
                <span style={{ color: item.color, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{item.pct}%
                  <span style={{ color: "#4a4a4a", fontWeight: 400 }}> ({item.carteira.toLocaleString("pt-BR")} / {item.universo.toLocaleString("pt-BR")})</span>
                </span>
              </div>
              <div style={{ height: 6, background: "#111", borderRadius: 3 }}>
                <div style={{ width: Math.min(item.pct * 4, 100) + "%", height: "100%", background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matriz CNAE × Região */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Matriz Oportunidade — CNAE Prioritário × Região (Gap Estimado)
          <span style={{ marginLeft: 12, color: "#4a4a4a", fontWeight: 400 }}>Empresas elegíveis não cobertas pela carteira atual</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#111" }}>
              <th style={{ padding: "8px 12px", color: "#5a5a5a", textAlign: "left", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>Região</th>
              {["Construção", "Comércio Veíc.", "Indústria Möv.", "Engenharia", "Elétrica"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "center", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>{h}</th>
              ))}
              <th style={{ padding: "8px 10px", color: "#5a5a5a", textAlign: "center", borderBottom: `1px solid ${BORDER}`, fontSize: 11 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {[
              { r: "Noroeste", vals: [4200, 3100, 2800, 1100, 2200], score: "🔴 Alto" },
              { r: "Central", vals: [3800, 2700, 1100, 900, 1900], score: "🔴 Alto" },
              { r: "Sul", vals: [3500, 3400, 900, 800, 1700], score: "🔴 Alto" },
              { r: "Norte", vals: [5100, 4200, 1200, 1400, 2600], score: "🟡 Médio" },
              { r: "Metropolitana", vals: [8200, 6100, 1600, 3400, 5100], score: "🟡 Médio" },
              { r: "Serra", vals: [3200, 1800, 800, 1200, 1400], score: "🟢 Baixo" },
            ].map((row, i) => (
              <tr key={row.r} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "transparent" : "#111" }}>
                <td style={{ padding: "8px 12px", color: LIGHT, fontWeight: 600 }}>{row.r}</td>
                {row.vals.map((v, j) => {
                  const intensity = v > 4000 ? RED : v > 2000 ? YELLOW : GREEN;
                  return <td key={j} style={{ padding: "8px 10px", textAlign: "center", color: intensity, fontFamily: "monospace", fontWeight: 700 }}>+{v.toLocaleString("pt-BR")}</td>;
                })}
                <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#111", borderRadius: 6, fontSize: 11, color: "#a0a0a0", borderLeft: `3px solid ${RED}` }}>
          🗺️ <strong style={{ color: RED }}>Regiões Noroeste, Central e Sul</strong> apresentam maior gap relativo: alta densidade de MPEs industriais com cobertura abaixo de 8%. Recomendar geração de lista complementar via base pública Receita Federal para esses CNAEs × regiões.
        </div>
      </div>
    </div>
  );
}

function TabKPIs() {
  const [pilar, setPilar] = useState(0);
  const pilares = [
    { label: "⚡ Eficiência da Discagem", data: kpis.eficiencia, color: GREEN },
    { label: "🎯 Qualidade do Contato", data: kpis.qualidade, color: BLUE },
    { label: "📈 Conversão / Negócio", data: kpis.conversao, color: YELLOW },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Indicadores pré-operação */}
      <div style={{ background: CARD, border: `1px solid ${RED}44`, borderRadius: 10, padding: 16 }}>
        <div style={{ color: RED, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚠ ESTADO PRÉ-OPERAÇÃO — Dados da Carteira (sem discagem realizada)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <MetricCard label="Discagem Efetiva Possível" value="31,6%" sub="Registros com telefone" color={RED} />
          <MetricCard label="Engajamento Atual" value="0,08%" sub="51 empresas engajadas" color={RED} />
          <MetricCard label="Taxa Contato Esperada" value="~22-28%" sub="Ajustada pelo gap de contatos" color={YELLOW} />
          <MetricCard label="Meta Adesão Projetada" value="15–20%" sub="Benchmark prog. gov. B2G" color={GREEN} />
        </div>
      </div>

      {/* Pilar selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {pilares.map((p, i) => (
          <button key={i} onClick={() => setPilar(i)} style={{
            padding: "10px 20px", borderRadius: 6, border: `1px solid ${i === pilar ? p.color : BORDER}`,
            background: i === pilar ? p.color + "22" : "transparent", color: i === pilar ? p.color : "#5a5a5a",
            cursor: "pointer", fontSize: 13, fontWeight: i === pilar ? 700 : 400, transition: "all 0.2s"
          }}>{p.label}</button>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          {pilares[pilar].label} — KPIs com Fórmula, Benchmark e Semáforo
        </div>
        <KPITable kpis={pilares[pilar].data} />
      </div>

      {/* Funil esperado */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Funil de Conversão Projetado — Base 64.013 Registros</div>
        <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
          {[
            { label: "Carteira Total", value: 64013, pct: "100%", color: "#4a4a4a" },
            { label: "Com Telefone", value: 20230, pct: "31,6%", color: BLUE },
            { label: "Contato Realizado", value: 5665, pct: "28% dos discados", color: GREEN },
            { label: "Decisor Atingido (RPC)", value: 2549, pct: "45% dos contatos", color: YELLOW },
            { label: "Qualificado MPE", value: 1912, pct: "75% do RPC", color: YELLOW },
            { label: "Adesão ao Programa", value: 382, pct: "20% qualif.", color: GREEN },
          ].map((step, i, arr) => (
            <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
              <div style={{
                background: step.color + "22", border: `1px solid ${step.color}66`, borderRadius: 10,
                padding: "14px 8px", margin: "0 2px", height: "100%", boxSizing: "border-box"
              }}>
                <div style={{ fontSize: 11, color: "#5a5a5a", marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: step.color, fontFamily: "monospace" }}>{step.value.toLocaleString("pt-BR")}</div>
                <div style={{ fontSize: 11, color: step.color + "cc", marginTop: 4 }}>{step.pct}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", color: "#5a5a5a", fontSize: 16, zIndex: 2 }}>▶</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#111", borderRadius: 6, fontSize: 11, color: "#a0a0a0", borderLeft: `3px solid ${GREEN}` }}>
          📊 Projeção conservadora: <strong style={{ color: GREEN }}>~382 adesões</strong> trabalhando apenas os registros com telefone disponível. Com enriquecimento completo da base → potencial de <strong style={{ color: GREEN }}>1.100–1.400 adesões</strong> no mesmo universo.
        </div>
      </div>
    </div>
  );
}

function TabRecomendacoes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <MetricCard label="Ações Críticas (imediato)" value="2" sub="Bloqueiam o início da operação" color={RED} />
        <MetricCard label="Ações de Alta Prioridade" value="2" sub="Maximizam conversão no curto prazo" color={YELLOW} />
        <MetricCard label="Ações de Médio Prazo" value="1" sub="Ampliam cobertura e canal" color={GREEN} />
      </div>

      {recomendacoes.map((r, i) => (
        <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${r.prioridade.includes("CRÍTICA") ? RED : r.prioridade.includes("ALTA") ? YELLOW : GREEN}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.prioridade.includes("CRÍTICA") ? RED : r.prioridade.includes("ALTA") ? YELLOW : GREEN, marginRight: 10 }}>{r.prioridade}</span>
              <span style={{ color: LIGHT, fontSize: 15, fontWeight: 700 }}>{r.titulo}</span>
            </div>
            <span style={{ background: BORDER, color: "#a0a0a0", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>Seg. {r.segmento}</span>
          </div>
          <div style={{ color: "#a0a0a0", fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{r.justificativa}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#111", borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ color: "#4a4a4a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>AÇÃO RECOMENDADA</div>
              <div style={{ color: LIGHT, fontSize: 12 }}>{r.acao}</div>
            </div>
            <div style={{ background: "#111", borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ color: "#4a4a4a", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>IMPACTO ESPERADO</div>
              <div style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>{r.impacto}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Roadmap visual */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: "#5a5a5a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Roadmap de Implantação</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { fase: "Semana 1–2", label: "Pré-Operação", items: ["Enriquecimento de base (bureau)", "Segmentação MPE elegível", "Script por porte (Micro vs. Pequena)"], color: RED },
            { fase: "Semana 3–4", label: "Piloto", items: ["Discar CNAEs seg. C + F prioritários", "Focar nas 5 maiores cidades", "Medir RPC e taxa de qualificação"], color: YELLOW },
            { fase: "Mês 2–3", label: "Escala", items: ["Expandir para regiões Noroeste/Central", "Ativar WhatsApp pré-abordagem", "Gerar base complementar Receita Fed."], color: GREEN },
          ].map((fase, i) => (
            <div key={i} style={{ background: "#111", border: `1px solid ${fase.color}44`, borderRadius: 10, padding: 16 }}>
              <div style={{ color: fase.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>{fase.fase}</div>
              <div style={{ color: LIGHT, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{fase.label}</div>
              {fase.items.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ color: fase.color, marginTop: 1 }}>›</span>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function BrMaisProdutivo() {
  const [activeTab, setActiveTab] = useState(0);

  const tabComponents = [<TabPerfil />, <TabCnaes />, <TabMapa />, <TabKPIs />, <TabRecomendacoes />];

  return (
    <div style={{ color: LIGHT }}>
      {/* Hero resumo */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: "18px 24px", marginBottom: 20, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: GREEN }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ background: GREEN, color: "#0d0d0d", fontWeight: 800, fontSize: 11, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.08em" }}>BR + PRODUTIVO</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Análise de Mailing — Ação Ativa de Discagem</span>
          </div>
          <div style={{ fontSize: 12, color: "#5a5a5a" }}>Carteira: 25/mai/26 · Rio Grande do Sul · 100% Ativa na Receita Federal</div>
        </div>
        <div style={{ textAlign: "right", paddingRight: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: GREEN, lineHeight: 1 }}>64.013</div>
          <div style={{ fontSize: 11, color: "#5a5a5a" }}>registros · ~11% cobertura RS</div>
        </div>
      </div>

      {/* Tabs — estilo do dash principal */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${BORDER}`, paddingBottom: 0 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: "8px 16px", background: "transparent",
            border: "none", borderBottom: `2px solid ${i === activeTab ? GREEN : "transparent"}`,
            color: i === activeTab ? GREEN : "#5a5a5a",
            cursor: "pointer", fontSize: 12, fontWeight: i === activeTab ? 700 : 400,
            transition: "all 0.15s", fontFamily: "Inter, sans-serif", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      {tabComponents[activeTab]}

      {/* Rodapé inline */}
      <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a3a3a" }}>
        <span>Fontes: Receita Federal · SEBRAE/DataSebrae · IBGE · MDIC · Banco Central</span>
        <span>Carteira base: mai/26</span>
      </div>
    </div>
  );
}
