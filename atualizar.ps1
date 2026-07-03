# =================================================================
# atualizar.ps1 - Atualizacao diaria do Dashboard FIERGS
# Uso: .\atualizar.ps1
#      .\atualizar.ps1 -SemDeploy   (so processa, nao publica)
# =================================================================
param(
  [string]$CsvPath = ".\Arquivos\Discagem_Fila.csv",
  [switch]$SemDeploy
)

Set-Location $PSScriptRoot

# ── CONFIGURACOES FIXAS (atualizar se o mailing mudar) ────────────
$MAILING_CARGA = 64013
$COM_TELEFONE  = 20230   # registros do mailing com telefone (perfil da carteira)
$CFG = @{
  "Fiergs0106" = @{ label = "Fiergs0106 - Ativo"; carteira = "530";  discador = 20184 }
  "MGE_1063"   = @{ label = "MGE 1063 - Ativo";   carteira = "1063"; discador = 64013 }
}

# NOTA: rotulos de STATUS_NEGOCIO sao emitidos CRUS (ASCII) no dados.js;
# a normalizacao para rotulos com acento + cores e feita no componente JSX
# (DiagnosticoDiscagem.jsx). Isso evita mojibake por o PS 5.1 ler .ps1 sem BOM
# como Windows-1252.

# ── MAPEAMENTO ISDN ───────────────────────────────────────────────
$isdnMap = @{
  "16"="Atendido"; "128"="Falha_Telefonia"; "147"="Falha_Telefonia"; "131"="Falha_Telefonia"
  "17"="Ocupado";  "19"="Sem_Resposta";     "18"="Sem_Resposta"
  "1"="Numero_Inexistente"; "28"="Numero_Inexistente"
  "21"="Chamada_Rejeitada"; "27"="Fora_Servico"; "38"="Fora_Servico"
  "34"="Canal_Indisponivel"; "58"="Canal_Indisponivel"
}

$cpcCats  = @("Informacao","Interesse","Oportunidade")
$cpcaCats = @("Interesse","Oportunidade")
$naCats   = @("Sem_Resposta","Numero_Inexistente","Chamada_Rejeitada","Fora_Servico","Canal_Indisponivel")
$dowPt    = @{ Monday="Seg"; Tuesday="Ter"; Wednesday="Qua"; Thursday="Qui"; Friday="Sex"; Saturday="Sab"; Sunday="Dom" }

# ── HELPERS ───────────────────────────────────────────────────────
function cnt($col) { [int](($col | Measure-Object).Count) }
function rnd($n, $d=2) { [Math]::Round([double]$n, $d) }
function pct($a,$b,$d=2) { if ([int]$b -gt 0) { rnd(([double][int]$a / [double][int]$b)*100) $d } else { 0 } }

# Converte campo DATA para dia "DD/MM" e hora "HHh" independente do formato
function Get-DiaHora($data) {
  $dia = "?"; $hora = "?"; $ddd = "?"
  if ($data.Length -lt 5) { return $dia, $hora, $ddd }

  if ($data -match '^\d{4}-') {
    # Formato ISO: "2026-06-01 14:30:00"
    if ($data.Length -ge 10) { $dia  = $data.Substring(8,2) + "/" + $data.Substring(5,2) }
    if ($data.Length -ge 13) { $hora = $data.Substring(11,2) + "h" }
    $dateStr = $data.Substring(0,10)
  } else {
    # Formato BR: "01/06/2026 14:30:00" ou "1/6/2026 ..."
    $parts = $data -split "[/ ]"
    if ($parts.Count -ge 3) {
      $dd = $parts[0].PadLeft(2,"0"); $mm = $parts[1].PadLeft(2,"0"); $yyyy = $parts[2]
      $dia = "$dd/$mm"
      $dateStr = "$yyyy-$mm-$dd"
    }
    if ($data.Length -ge 13) { $hora = $data.Substring($data.IndexOf(" ")+1,2) + "h" }
  }
  try {
    $dt  = [DateTime]::ParseExact($dateStr, "yyyy-MM-dd", [System.Globalization.CultureInfo]::InvariantCulture)
    $ddd = $dowPt[$dt.DayOfWeek.ToString()]
  } catch {}
  return $dia, $hora, $ddd
}

# ═════════════════════════════════════════════════════════════════
# 1. CARREGAR CSV E COMPUTAR Ajuste_Status (sem salvar o CSV)
# ═════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "  Carregando CSV..." -ForegroundColor Cyan
if (-not (Test-Path $CsvPath)) { Write-Host "  ERRO: $CsvPath nao encontrado" -ForegroundColor Red; exit 1 }

$raw  = Import-Csv -Path $CsvPath -Delimiter ";" -Encoding Default
$all  = $raw   # _AJ calculado inline em Get-CampJS (evita Add-Member em 300k rows)

Write-Host "  $($all.Count) registros carregados." -ForegroundColor Green

# ═════════════════════════════════════════════════════════════════
# 2. CALCULAR KPIs POR CAMPANHA
# ═════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "  Calculando KPIs..." -ForegroundColor Cyan

function Get-CampJS($rows, $campName) {
  $cfg = $CFG[$campName]

  # Lookup O(1) (evita -contains sobre array a cada linha)
  $cpcSet  = @{}; foreach ($x in $cpcCats)  { $cpcSet[$x]  = 1 }
  $cpcaSet = @{}; foreach ($x in $cpcaCats) { $cpcaSet[$x] = 1 }
  $naSet   = @{}; foreach ($x in $naCats)   { $naSet[$x]   = 1 }

  # Contadores
  $tent=0; $atend=0; $falha=0; $na=0; $ocup=0; $cpc=0; $cpca=0; $inter=0
  $docsSet = [System.Collections.Generic.HashSet[string]]::new()
  $horaMap = @{}; $diaMap = @{}; $diahMap = @{}; $tabMap = @{}

  # ── LOOP UNICO (substitui 8+ passes anteriores) ──────────────────
  foreach ($row in $rows) {
    $tent++

    # _AJ inline (sem Add-Member)
    $code = $row.ISDN_CODE.Trim()
    $aj   = if ($isdnMap.ContainsKey($code)) { $isdnMap[$code] } else { $row.STATUS }

    if     ($aj -eq "Atendido")          { $atend++ }
    elseif ($aj -eq "Falha_Telefonia")   { $falha++ }
    elseif ($naSet.ContainsKey($aj))     { $na++    }
    elseif ($aj -eq "Ocupado")           { $ocup++  }

    $neg = $row.STATUS_NEGOCIO
    if ($cpcSet.ContainsKey($neg))       { $cpc++   }
    if ($cpcaSet.ContainsKey($neg))      { $cpca++  }
    if ($neg -eq "Interesse")            { $inter++ }

    $id = $row.IDCRM; if ($id -eq "") { $id = $row.DESTINO }
    if ($id -ne "") { [void]$docsSet.Add($id) }

    if ($neg -ne "") {
      if ($tabMap.ContainsKey($neg)) { $tabMap[$neg]++ } else { $tabMap[$neg] = 1 }
    }

    # Parse data inline (sem regex, sem chamada de funcao)
    $data = $row.DATA
    if ($data.Length -lt 11) { continue }
    $dia = "?"; $hora = "?"; $ddd = "?"
    try {
      if ($data[4] -eq '-') {
        # ISO: "2026-06-01 14:30:00"
        $dia     = $data.Substring(8,2) + "/" + $data.Substring(5,2)
        $hora    = $data.Substring(11,2) + "h"
        $dateStr = $data.Substring(0,10)
      } else {
        # BR: "01/06/2026 14:30:00"
        $dia     = $data.Substring(0,2) + "/" + $data.Substring(3,2)
        $hora    = $data.Substring(11,2) + "h"
        $dateStr = $data.Substring(6,4)+"-"+$data.Substring(3,2)+"-"+$data.Substring(0,2)
      }
      $dt  = [DateTime]::ParseExact($dateStr,"yyyy-MM-dd",[cultureinfo]::InvariantCulture)
      $ddd = $dowPt[$dt.DayOfWeek.ToString()]
    } catch { continue }

    # por_hora
    if (-not $horaMap.ContainsKey($hora)) { $horaMap[$hora] = @(0,0,0) }
    $horaMap[$hora][0]++
    if ($aj -eq "Atendido")          { $horaMap[$hora][1]++ }
    if ($cpcaSet.ContainsKey($neg))  { $horaMap[$hora][2]++ }

    # por_dia
    if (-not $diaMap.ContainsKey($dia)) {
      $diaMap[$dia] = @{ t=0;a=0;ft=0;na=0;oc=0;int=0;ddd=$ddd;docs=[System.Collections.Generic.HashSet[string]]::new() }
    }
    $d = $diaMap[$dia]; $d.t++
    if ($aj -eq "Atendido")          { $d.a++   }
    if ($aj -eq "Falha_Telefonia")   { $d.ft++  }
    if ($naSet.ContainsKey($aj))     { $d.na++  }
    if ($aj -eq "Ocupado")           { $d.oc++  }
    if ($cpcaSet.ContainsKey($neg))  { $d.int++ }
    if ($id -ne "") { [void]$d.docs.Add($id) }

    # por_dia_hora
    if (-not $diahMap.ContainsKey($dia))        { $diahMap[$dia] = @{} }
    if (-not $diahMap[$dia].ContainsKey($hora)) { $diahMap[$dia][$hora] = @(0,0,0) }
    $diahMap[$dia][$hora][0]++
    if ($aj -eq "Atendido")          { $diahMap[$dia][$hora][1]++ }
    if ($cpcaSet.ContainsKey($neg))  { $diahMap[$dia][$hora][2]++ }
  }

  # Valores derivados
  $docs    = $docsSet.Count
  $hr      = pct $atend $tent
  $pCpc    = pct $cpc  $atend
  $pCpca   = pct $cpca $cpc
  $naoDis  = $cfg.discador - $docs
  $cobPct  = pct $docs $cfg.discador
  $penPct  = pct $docs $MAILING_CARGA
  $mediaTE = if ($docs -gt 0) { rnd ([double]$tent / [double]$docs) 1 } else { 0 }
  $semSuc  = [Math]::Max(0, $docs - $atend)

  # Periodo a partir das chaves do diaMap
  $datas   = @($diaMap.Keys | Sort-Object { ($_ -split "/")[1] + ($_ -split "/")[0] })
  $dtMin   = if ($datas.Count -gt 0) { $datas[0] } else { "?/?" }
  $dtMax   = if ($datas.Count -gt 0) { $datas[-1] } else { "?/?" }
  $periodo = "$dtMin/2026 a $dtMax/2026"

  # Gerar linhas JS
  $porHoraLines = $horaMap.Keys | Sort-Object | ForEach-Object {
    $h = $horaMap[$_]
    "    { hora: `"$_`", tentativas: $($h[0]), atendidas: $($h[1]), interesse: $($h[2]) }"
  }

  $porDiaLines = $diaMap.Keys | Sort-Object | ForEach-Object {
    $d = $diaMap[$_]; $hr2 = pct $d.a $d.t; $dc = $d.docs.Count
    "    { dia: `"$_`", ddd: `"$($d.ddd)`", tent: $($d.t), atend: $($d.a), naoAtend: $($d.na), falha: $($d.ft), ocup: $($d.oc), int: $($d.int), docs: $dc, hr: $hr2 }"
  }

  $porDiaHoraLines = $diahMap.Keys | Sort-Object | ForEach-Object {
    $dia = $_
    $hLines = $diahMap[$dia].Keys | Sort-Object | ForEach-Object {
      $h = $diahMap[$dia][$_]
      "      { hora: `"$_`", tentativas: $($h[0]), atendidas: $($h[1]), interesse: $($h[2]) }"
    }
    "    `"$dia`": [`n" + ($hLines -join ",`n") + "`n    ]"
  }

  $sDist = @(
    "    { name: `"Atendido`",        value: $atend, cor: `"#22c55e`" }",
    "    { name: `"Falha Telefonia`", value: $falha, cor: `"#ef4444`" }",
    "    { name: `"Nao Atendeu`",     value: $na,    cor: `"#6b7280`" }",
    "    { name: `"Ocupado`",         value: $ocup,  cor: `"#f59e0b`" }"
  )

  $tabLines = $tabMap.Keys | Sort-Object { -$tabMap[$_] } | Select-Object -First 15 |
    ForEach-Object { "    { name: `"$_`", qtd: $($tabMap[$_]) }" }

  $varName = if ($campName -eq "Fiergs0106") { "_F" } else { "_M" }

  $jsOut  = "export const $varName = {`n"
  $jsOut += "  label: `"$($cfg.label)`", carteira: `"$($cfg.carteira)`",`n"
  $jsOut += "  periodo: `"$periodo`",`n"
  $jsOut += "  mailing_carga: $MAILING_CARGA, mailing_discador: $($cfg.discador),`n"
  $jsOut += "  discados_unicos: $docs, nao_discados: $naoDis,`n"
  $jsOut += "  cobertura_pct: $cobPct, penetracao_pct: $penPct,`n"
  $jsOut += "  total_tentativas: $tent, atendidos: $atend,`n"
  $jsOut += "  nao_atendeu: $na, falha_telefonia: $falha, ocupado: $ocup,`n"
  $jsOut += "  hit_rate_pct: $hr,`n"
  $jsOut += "  cpc: $cpc, cpca: $cpca, pct_cpc: $pCpc, pct_cpca: $pCpca,`n"
  $jsOut += "  interessados: $inter, contatos_decisor: $cpc,`n"
  $jsOut += "  media_tent_empresa: $mediaTE, sem_sucesso: $semSuc,`n"
  $jsOut += "  acordos: 0, conversao_pct: 0,`n"
  $jsOut += "  por_hora: [`n" + ($porHoraLines -join ",`n") + "`n  ],`n"
  $jsOut += "  por_dia: [`n" + ($porDiaLines -join ",`n") + "`n  ],`n"
  $jsOut += "  por_dia_hora: {`n" + ($porDiaHoraLines -join ",`n") + "`n  },`n"
  $jsOut += "  status_dist: [`n" + ($sDist -join ",`n") + "`n  ],`n"
  $jsOut += "  tabulacoes: [`n" + ($tabLines -join ",`n") + "`n  ],`n"
  $jsOut += "};"
  return $jsOut
}

# ═════════════════════════════════════════════════════════════════
# 2b. DIAGNOSTICO CONSOLIDADO (_D) - sobre TODAS as linhas
#     Alimenta as abas Diagnostico e Agente (antes hard-coded).
# ═════════════════════════════════════════════════════════════════
function Get-DiagJS($rows) {
  $cpcSet  = @{}; foreach ($x in $cpcCats)  { $cpcSet[$x]  = 1 }
  $cpcaSet = @{}; foreach ($x in $cpcaCats) { $cpcaSet[$x] = 1 }

  $tent=0; $atendD=0; $comAg=0; $cpc=0; $cpca=0; $inter=0; $retor=0; $oport=0
  $negMap=@{}; $isdnCnt=@{}; $horaMap=@{}; $diaMap=@{}; $agMap=@{}

  foreach ($row in $rows) {
    $tent++
    $atend = ($row.STATUS -eq "Atendido")
    if ($atend) { $atendD++ }

    $ag = $row.AGENTE
    $temAgente = ($ag -ne "---" -and $ag -ne "")
    if ($temAgente) { $comAg++ }

    $neg = $row.STATUS_NEGOCIO
    $isPos = $false
    if ($neg -ne "") {
      if ($cpcSet.ContainsKey($neg))  { $cpc++  }
      if ($cpcaSet.ContainsKey($neg)) { $cpca++ }
      if ($neg -eq "Interesse")    { $inter++; $isPos=$true }
      if ($neg -eq "Retorno")      { $retor++; $isPos=$true }
      if ($neg -eq "Oportunidade") { $oport++; $isPos=$true }
      if ($negMap.ContainsKey($neg)) { $negMap[$neg]++ } else { $negMap[$neg]=1 }
    }

    $code = $row.ISDN_CODE.Trim()
    if ($code -ne "") {
      if ($isdnCnt.ContainsKey($code)) { $isdnCnt[$code]++ } else { $isdnCnt[$code]=1 }
    }

    # Parse data (mesma logica do Get-CampJS)
    $data = $row.DATA
    if ($data.Length -ge 11) {
      $dia="?"; $hora="?"; $ddd="?"
      try {
        if ($data[4] -eq '-') {
          $dia=$data.Substring(8,2)+"/"+$data.Substring(5,2); $hora=$data.Substring(11,2)+"h"
          $dateStr=$data.Substring(0,10)
        } else {
          $dia=$data.Substring(0,2)+"/"+$data.Substring(3,2); $hora=$data.Substring(11,2)+"h"
          $dateStr=$data.Substring(6,4)+"-"+$data.Substring(3,2)+"-"+$data.Substring(0,2)
        }
        $dt=[DateTime]::ParseExact($dateStr,"yyyy-MM-dd",[cultureinfo]::InvariantCulture)
        $ddd=$dowPt[$dt.DayOfWeek.ToString()]
      } catch { $dia="?" }

      if ($dia -ne "?") {
        if (-not $diaMap.ContainsKey($dia)) { $diaMap[$dia]=@{t=0;a=0;ag=0;pos=0;ddd=$ddd} }
        $d=$diaMap[$dia]; $d.t++
        if ($atend)     { $d.a++ }
        if ($temAgente) { $d.ag++ }
        if ($isPos)     { $d.pos++ }
      }
      if ($hora -ne "?") {
        if (-not $horaMap.ContainsKey($hora)) { $horaMap[$hora]=@(0,0) }
        $horaMap[$hora][0]++
        if ($atend) { $horaMap[$hora][1]++ }
      }
    }

    # Stats por agente
    if ($temAgente) {
      if (-not $agMap.ContainsKey($ag)) { $agMap[$ag]=@{t=0;conv=0;secs=0;int=0;op=0;ret=0;dias=@{}} }
      $a=$agMap[$ag]; $a.t++
      $sec=0; $tc=$row.TEMPO_DE_CONVERSACAO
      if ($tc -and $tc.Length -ge 8 -and $tc[2] -eq ':') {
        try { $sec=[int]$tc.Substring(0,2)*3600+[int]$tc.Substring(3,2)*60+[int]$tc.Substring(6,2) } catch { $sec=0 }
      }
      if ($sec -gt 0) { $a.conv++; $a.secs+=$sec }
      if ($neg -eq "Interesse")    { $a.int++ }
      if ($neg -eq "Oportunidade") { $a.op++  }
      if ($neg -eq "Retorno")      { $a.ret++ }
      # Por agente x dia (volume e positivos) — alimenta a aba Agente
      if ($dia -ne "?") {
        if (-not $a.dias.ContainsKey($dia)) { $a.dias[$dia]=@{vol=0;pos=0} }
        $a.dias[$dia].vol++
        if ($isPos) { $a.dias[$dia].pos++ }
      }
    }
  }

  $positivos = $inter + $retor + $oport
  $taxaD   = pct $atendD $tent
  $taxaR   = pct $comAg  $tent
  $pctCpc  = pct $cpc    $comAg
  $pctCpca = pct $cpca   $cpc

  $datas   = @($diaMap.Keys | Sort-Object { ($_ -split "/")[1] + ($_ -split "/")[0] })
  $dtMin   = if ($datas.Count -gt 0) { $datas[0] }  else { "?/?" }
  $dtMax   = if ($datas.Count -gt 0) { $datas[-1] } else { "?/?" }
  $periodo = "$dtMin/2026 a $dtMax/2026"
  $diasTrab = $datas.Count

  $porDiaLines = $datas | ForEach-Object {
    $d=$diaMap[$_]; $tx=pct $d.a $d.t
    "    { dia: `"$_ ($($d.ddd))`", total: $($d.t), atendido: $($d.a), comAgente: $($d.ag), positivos: $($d.pos), taxaContato: $tx }"
  }
  $porHoraLines = $horaMap.Keys | Sort-Object | ForEach-Object {
    $h=$horaMap[$_]; $tx=pct $h[1] $h[0]
    "    { hora: `"$_`", total: $($h[0]), atendido: $($h[1]), taxa: $tx }"
  }
  $agLines = $agMap.Keys | Sort-Object { -$agMap[$_].t } | ForEach-Object {
    $a=$agMap[$_]; $idx=$_.IndexOf("-")
    $id   = if ($idx -gt 0) { $_.Substring(0,$idx) } else { "" }
    $nome = if ($idx -gt 0) { $_.Substring($idx+1) } else { $_ }
    $tma  = if ($a.conv -gt 0) { [int]($a.secs / $a.conv) } else { 0 }
    "    { nome: `"$nome`", id: `"$id`", total: $($a.t), atendidos: $($a.t), convReal: $($a.conv), tma: $tma, interesse: $($a.int), oportunidade: $($a.op), retorno: $($a.ret) }"
  }
  $negLines = $negMap.Keys | Sort-Object { -$negMap[$_] } | ForEach-Object {
    "    { name: `"$_`", value: $($negMap[$_]) }"
  }
  $isdnSorted = @($isdnCnt.Keys | Sort-Object { -$isdnCnt[$_] })
  $top = @($isdnSorted | Select-Object -First 7)
  $isdnLines = @(); $topSum = 0
  foreach ($c in $top) {
    $cnt=$isdnCnt[$c]; $topSum+=$cnt; $p=pct $cnt $tent
    $isdnLines += "    { code: `"$c`", count: $cnt, pct: $p }"
  }
  $outros = $tent - $topSum
  if ($outros -gt 0) { $p=pct $outros $tent; $isdnLines += "    { code: `"Outros`", count: $outros, pct: $p }" }

  # Top 8 agentes por volume -> evolucao/presenca por dia (aba Agente)
  $topAg = @($agMap.Keys | Sort-Object { -$agMap[$_].t } | Select-Object -First 8)
  $agDiaLines = $topAg | ForEach-Object {
    $a=$agMap[$_]; $idx=$_.IndexOf("-")
    $id   = if ($idx -gt 0) { $_.Substring(0,$idx) } else { "" }
    $nome = if ($idx -gt 0) { $_.Substring($idx+1) } else { $_ }
    $primeiro = ($nome -split " ")[0]
    $dLines = $datas | ForEach-Object {
      $dd=$_; if ($a.dias.ContainsKey($dd)) { $v=$a.dias[$dd] } else { $v=@{vol=0;pos=0} }
      "        { dia: `"$dd`", vol: $($v.vol), pos: $($v.pos) }"
    }
    "    { nome: `"$nome`", primeiro: `"$primeiro`", id: `"$id`", dias: [`n" + ($dLines -join ",`n") + "`n    ] }"
  }
  $diasAxis = ($datas | ForEach-Object { "`"$_`"" }) -join ", "

  $jsOut  = "export const _D = {`n"
  $jsOut += "  resumo: {`n"
  $jsOut += "    periodo: `"$periodo`", diasTrabalhados: $diasTrab,`n"
  $jsOut += "    totalTentativas: $tent, mailingTotal: $MAILING_CARGA, comTelefone: $COM_TELEFONE,`n"
  $jsOut += "    atendidosDiscador: $atendD, taxaContatoDiscador: $taxaD,`n"
  $jsOut += "    comAgente: $comAg, taxaContatoReal: $taxaR,`n"
  $jsOut += "    interesse: $inter, retorno: $retor, oportunidade: $oport, totalPositivos: $positivos,`n"
  $jsOut += "    cpc: $cpc, cpca: $cpca, pctCpc: $pctCpc, pctCpca: $pctCpca`n"
  $jsOut += "  },`n"
  $jsOut += "  por_dia: [`n" + ($porDiaLines -join ",`n") + "`n  ],`n"
  $jsOut += "  por_hora: [`n" + ($porHoraLines -join ",`n") + "`n  ],`n"
  $jsOut += "  agentes: [`n" + ($agLines -join ",`n") + "`n  ],`n"
  $jsOut += "  status_negocio: [`n" + ($negLines -join ",`n") + "`n  ],`n"
  $jsOut += "  isdn: [`n" + ($isdnLines -join ",`n") + "`n  ],`n"
  $jsOut += "  dias: [$diasAxis],`n"
  $jsOut += "  agente_dia: [`n" + ($agDiaLines -join ",`n") + "`n  ],`n"
  $jsOut += "};"
  return $jsOut
}

$blocks = @()
foreach ($name in @("Fiergs0106","MGE_1063")) {
  if ($name -eq "MGE_1063") {
    $rows = @($all | Where-Object { $_.MAILING -match "1063" })
  } else {
    $rows = @($all | Where-Object { $_.MAILING -eq $name })
  }
  Write-Host "  $name`: $($rows.Count) registros" -ForegroundColor Gray
  if ($rows.Count -gt 0) { $blocks += Get-CampJS $rows $name }
  else { Write-Host "  AVISO: sem dados para $name" -ForegroundColor Yellow }
}

Write-Host "  Diagnostico consolidado (_D): $($all.Count) registros" -ForegroundColor Gray
$blocks += Get-DiagJS $all

# ═════════════════════════════════════════════════════════════════
# 3. GERAR src/dados.js
# ═════════════════════════════════════════════════════════════════
$now = Get-Date -Format "dd/MM/yyyy HH:mm"
$js  = "// AUTO-GERADO por atualizar.ps1 - nao editar manualmente`n"
$js += "// Ultima atualizacao: $now`n`n"
$js += $blocks -join "`n`n"

[System.IO.File]::WriteAllText(
  "$PSScriptRoot\src\dados.js",
  $js,
  [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "  src/dados.js gerado." -ForegroundColor Green

# ═════════════════════════════════════════════════════════════════
# 4. BUILD + DEPLOY
# ═════════════════════════════════════════════════════════════════
if (-not $SemDeploy) {
  Write-Host ""
  Write-Host "  Publicando..." -ForegroundColor Cyan
  npm run deploy
  Write-Host ""
  Write-Host "  Publicado: https://grdmmplan-source.github.io/fiergs-dashboard" -ForegroundColor Yellow
} else {
  Write-Host "  -SemDeploy: execute 'npm run deploy' para publicar." -ForegroundColor Gray
}

Write-Host ""
