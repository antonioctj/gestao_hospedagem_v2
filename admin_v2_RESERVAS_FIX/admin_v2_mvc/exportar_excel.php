<?php
/**
 * ============================================
 * EXPORTAÃ‡ÃƒO PARA EXCEL (CSV)
 * ============================================
 * 
 * Exporta todos os dados financeiros do perÃ­odo em formato CSV
 */

require_once __DIR__.'/auth.php'; 
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
$pdo = Database::getInstance()->getConnection();

// ParÃ¢metros
$filtro_apartamento = $_GET['apartamento'] ?? '';
$filtro_periodo = $_GET['periodo'] ?? 'mes_atual';

// Calcular datas baseado no perÃ­odo
$hoje = new DateTime();
$ano_atual = $hoje->format('Y');
$mes_atual = $hoje->format('m');

switch ($filtro_periodo) {
    case 'mes_atual':
        $data_inicio = $hoje->format('Y-m-01');
        $data_fim = $hoje->format('Y-m-t');
        $label_periodo = str_replace('/', '-', $hoje->format('m-Y'));
        break;
        
    case 'trimestre':
        $trimestre_atual = ceil($mes_atual / 3);
        $mes_inicio_trimestre = ($trimestre_atual - 1) * 3 + 1;
        $data_inicio = sprintf('%s-%02d-01', $ano_atual, $mes_inicio_trimestre);
        $dt_fim = new DateTime($data_inicio);
        $dt_fim->modify('+2 months');
        $data_fim = $dt_fim->format('Y-m-t');
        $label_periodo = "Trimestre-{$trimestre_atual}-{$ano_atual}";
        break;
        
    case 'semestre':
        $semestre_atual = ($mes_atual <= 6) ? 1 : 2;
        $mes_inicio_semestre = ($semestre_atual == 1) ? 1 : 7;
        $data_inicio = sprintf('%s-%02d-01', $ano_atual, $mes_inicio_semestre);
        $dt_fim = new DateTime($data_inicio);
        $dt_fim->modify('+5 months');
        $data_fim = $dt_fim->format('Y-m-t');
        $label_periodo = "Semestre-{$semestre_atual}-{$ano_atual}";
        break;
        
    case 'ano':
        $data_inicio = "{$ano_atual}-01-01";
        $data_fim = "{$ano_atual}-12-31";
        $label_periodo = "Ano-{$ano_atual}";
        break;
}

// Buscar dados
$where = "WHERE 1=1";
$params = [];

if ($filtro_apartamento) {
    $where .= " AND quartos = ?";
    $params[] = $filtro_apartamento;
}

$where .= " AND (
    (data_vencimento BETWEEN ? AND ?) OR
    (data_pagamento BETWEEN ? AND ?) OR
    (mes_ano BETWEEN ? AND ?)
)";
$params[] = $data_inicio;
$params[] = $data_fim;
$params[] = $data_inicio;
$params[] = $data_fim;
$params[] = substr($data_inicio, 0, 7);
$params[] = substr($data_fim, 0, 7);

$stmt = $pdo->prepare("SELECT * FROM financeiro $where ORDER BY categoria, tipo, data_vencimento");
$stmt->execute($params);
$registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Nome do arquivo
$nome_arquivo = "Financeiro_{$label_periodo}";
if ($filtro_apartamento) {
    $nome_arquivo .= "_" . str_replace(' ', '_', $filtro_apartamento);
}
$nome_arquivo .= ".csv";

// Headers para download
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $nome_arquivo . '"');
header('Pragma: no-cache');
header('Expires: 0');

// Abrir output
$output = fopen('php://output', 'w');

// BOM para UTF-8 (para Excel reconhecer acentuaÃ§Ã£o)
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// CabeÃ§alho
$cabecalho = [
    'ID',
    'Apartamento',
    'MÃªs/Ano',
    'Categoria',
    'Tipo',
    'DescriÃ§Ã£o',
    'Valor (R$)',
    'Status',
    'Data Vencimento',
    'Data Pagamento',
    'ObservaÃ§Ãµes'
];
fputcsv($output, $cabecalho, ';');

// Traduzir categoria
function traduzirCategoria($cat) {
    switch($cat) {
        case 'receita': return 'Receita';
        case 'despesa_direta': return 'Despesa Direta';
        case 'despesa_indireta': return 'Despesa Indireta';
        default: return $cat;
    }
}

// Traduzir status
function traduzirStatus($st) {
    switch($st) {
        case 'pago': return 'Pago';
        case 'pendente': return 'Pendente';
        case 'atrasado': return 'Atrasado';
        default: return $st;
    }
}

// Dados
foreach ($registros as $r) {
    $linha = [
        $r['id'],
        $r['quartos'],
        $r['mes_ano'],
        traduzirCategoria($r['categoria']),
        $r['tipo'],
        $r['descricao'],
        number_format($r['valor'], 2, ',', '.'), // Formato brasileiro
        traduzirStatus($r['status']),
        $r['data_vencimento'] ? date('d/m/Y', strtotime($r['data_vencimento'])) : '',
        $r['data_pagamento'] ? date('d/m/Y', strtotime($r['data_pagamento'])) : '',
        str_replace('[AUTO] ', '', $r['observacoes']) // Remover [AUTO]
    ];
    fputcsv($output, $linha, ';');
}

// Linha em branco
fputcsv($output, [], ';');

// TOTAIS
$total_receitas = 0;
$total_despesas_diretas = 0;
$total_despesas_indiretas = 0;

foreach($registros as $r) {
    if($r['categoria'] === 'receita') {
        $total_receitas += $r['valor'];
    } elseif($r['categoria'] === 'despesa_direta') {
        $total_despesas_diretas += $r['valor'];
    } elseif($r['categoria'] === 'despesa_indireta') {
        $total_despesas_indiretas += $r['valor'];
    }
}

$lucro_bruto = $total_receitas - $total_despesas_diretas;
$lucro_liquido = $total_receitas - $total_despesas_diretas - $total_despesas_indiretas;

fputcsv($output, ['RESUMO FINANCEIRO'], ';');
fputcsv($output, [], ';');
fputcsv($output, ['Total Receitas', '', '', '', '', '', number_format($total_receitas, 2, ',', '.')], ';');
fputcsv($output, ['Total Despesas Diretas', '', '', '', '', '', number_format($total_despesas_diretas, 2, ',', '.')], ';');
fputcsv($output, ['Lucro Bruto', '', '', '', '', '', number_format($lucro_bruto, 2, ',', '.')], ';');
fputcsv($output, ['Total Despesas Indiretas', '', '', '', '', '', number_format($total_despesas_indiretas, 2, ',', '.')], ';');
fputcsv($output, ['LUCRO LÃQUIDO', '', '', '', '', '', number_format($lucro_liquido, 2, ',', '.')], ';');

fclose($output);
exit;
?>