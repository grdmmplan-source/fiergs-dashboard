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
$CFG = @{
  "Fiergs0106" = @{ label = "Fiergs0106 - Ativo"; carteira = "530";  discador = 20184 }
  "MGE_1063"   = @{ label = "MGE 1063 - Ativo";   carteira = "1063"; discador = 64013 }
}

# ── MAPEAMENTO ISDN ───────────────────────────────────────────────
$isdnMap = @{
  "16"="Atendido"; "128"="Falha_Telefonia"; "147"="Falha_Telefonia"; "131"="Falha_Telefonia"
  "17"="Ocupado";  "19"="Sem_Resposta";     "18"="Sem_Resposta"
  "1"="Numero_Inexistente"; "28"="Numero_Inexistente"
  "21"="Chamada_Rejeitada"; "27"="Fora_Servico"; "38"="Fora_Servico"
  "34"="Canal_Indisponivel"; "58"="Canal_Indisponivel"
}

$cpcCats  = @("Desligou","Informacao","Interesse","Oportunidade","Retorno")
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
