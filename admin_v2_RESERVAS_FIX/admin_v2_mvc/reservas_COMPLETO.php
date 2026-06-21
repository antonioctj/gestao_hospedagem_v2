<?php 
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';
Auth::init();
Auth::middleware();
$user = Auth::user();
$tema = $_SESSION['theme'] ?? 'dark';
$pdo = Database::getInstance()->getConnection(); 
// DB já carregado
// Header inline abaixo 
?>
<!-- FONTAWESOME -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<?php

// Processar formulÃ¡rio
if($_SERVER['REQUEST_METHOD']==='POST'){ 
    $id=$_POST['id']??''; 
    $numero_reserva=$_POST['numero_reserva']; 
    $reservado_por=$_POST['reservado_por'];
    $nomes_hospedes=$_POST['nomes_hospedes']; 
    $nome_hospede=$nomes_hospedes;
    $telefone=$_POST['telefone']; 
    $endereco=$_POST['endereco'] ?? '';
    $booker_country=$_POST['booker_country'] ?? '';
    $check_in=$_POST['check_in']; 
    $data_entrada=$check_in;
    $check_out=$_POST['check_out']; 
    $data_saida=$check_out;
    
    $mes_ano = date('Y-m', strtotime($check_in));
    
    $dt1 = new DateTime($check_in);
    $dt2 = new DateTime($check_out);
    $duracao_diarias = $dt2->diff($dt1)->days;
    
    $quartos=$_POST['quartos']; 
    $tipo_unidade=$_POST['tipo_unidade'] ?? '';
    $pessoas=intval($_POST['pessoas'] ?? 0);
    $qtd_adultos=intval($_POST['qtd_adultos']); 
    $adultos=$qtd_adultos;
    $qtd_criancas=intval($_POST['qtd_criancas']); 
    $criancas=$qtd_criancas;
    $idade_criancas=$_POST['idade_criancas'] ?? '';
    $plataforma=$_POST['plataforma'];
    $status=$_POST['status'];
    $status_pagamento=$_POST['status_pagamento'] ?? '';
    $data_cancelamento=$_POST['data_cancelamento'] ?? NULL;
    
    
    // âœ… SE STATUS FOR CANCELADA, ZERAR TODOS OS VALORES
    if (strtolower($status) === 'cancelada') {
        $duracao_diarias = 0;
        $r_reserva = 0;
        $preco = 0;
        $r_comissao = 0;
        $comissao_percentual = 0;
        $perc_comissao = 0;
        $valor_comissao = 0;
        $r_tx_limpeza = 0;
        $valor_limpeza = 0;
        $r_tx_pet = 0;
        $valor_tx_pet = 0;
        $r_outros_desc = 0;
        $outros_desconto = 0;
    } else {
        // Calcular normalmente se NÃƒO for cancelada
            $r_reserva=floatval(str_replace(',','.',$_POST['r_reserva'])); 
            $preco=$r_reserva;
            $r_comissao=floatval(str_replace(',','.',$_POST['r_comissao'])); 
            $comissao_percentual=floatval(str_replace(',','.',$_POST['comissao_percentual'] ?? 0));
            
            $perc_comissao = 0;
            if ($r_reserva > 0) {
                if ($comissao_percentual > 0) {
                    $perc_comissao = $comissao_percentual;
                } else {
                    $perc_comissao = ($r_comissao / $r_reserva) * 100;
                }
            }
            
            $valor_comissao=floatval(str_replace(',','.',$_POST['valor_comissao'] ?? 0));
            $r_tx_limpeza=floatval(str_replace(',','.',$_POST['r_tx_limpeza'] ?? 0)); 
            $valor_limpeza=$r_tx_limpeza;
            $r_tx_pet=floatval(str_replace(',','.',$_POST['r_tx_pet'] ?? 0)); 
            $valor_tx_pet=$r_tx_pet;
            $r_outros_desc=floatval(str_replace(',','.',$_POST['r_outros_desc'] ?? 0)); 
            $outros_desconto=$r_outros_desc;
    }
    $forma_pagamento=$_POST['forma_pagamento'] ?? '';
    $provedor_pagamento=$_POST['provedor_pagamento'] ?? '';
    $politica_cancelamento=$_POST['politica_cancelamento'] ?? '';
    $motivo_viagem=$_POST['motivo_viagem'] ?? '';
    $dispositivo=$_POST['dispositivo'] ?? '';
    $grupo_usuarios=$_POST['grupo_usuarios'] ?? '';
    $observacoes=$_POST['observacoes'] ?? '';
    $reservado_em=$_POST['reservado_em'] ? $_POST['reservado_em'] : NULL;
    
    if($id){ 
        $pdo->prepare('UPDATE reservas SET 
            numero_reserva=?, reservado_por=?, nomes_hospedes=?, nome_hospede=?,
            telefone=?, endereco=?, booker_country=?,
            check_in=?, data_entrada=?, check_out=?, data_saida=?,
            mes_ano=?, duracao_diarias=?,
            quartos=?, tipo_unidade=?, pessoas=?,
            qtd_adultos=?, adultos=?, qtd_criancas=?, criancas=?, idade_criancas=?,
            plataforma=?, status=?, status_pagamento=?, data_cancelamento=?,
            r_reserva=?, preco=?, r_comissao=?, valor_comissao=?,
            comissao_percentual=?, perc_comissao=?, 
            r_tx_limpeza=?, valor_limpeza=?,
            r_tx_pet=?, valor_tx_pet=?,
            r_outros_desc=?, outros_desconto=?,
            forma_pagamento=?, provedor_pagamento=?, politica_cancelamento=?, 
            motivo_viagem=?, dispositivo=?, grupo_usuarios=?,
            observacoes=?, reservado_em=?, atualizado_em=NOW() 
        WHERE id=?')->execute([
            $numero_reserva, $reservado_por, $nomes_hospedes, $nome_hospede, $telefone, $endereco, $booker_country,
            $check_in, $data_entrada, $check_out, $data_saida, $mes_ano, $duracao_diarias, $quartos, $tipo_unidade,
            $pessoas, $qtd_adultos, $adultos, $qtd_criancas, $criancas, $idade_criancas, $plataforma, $status,
            $status_pagamento, $data_cancelamento, $r_reserva, $preco, $r_comissao, $valor_comissao, $comissao_percentual,
            $perc_comissao, $r_tx_limpeza, $valor_limpeza, $r_tx_pet, $valor_tx_pet, $r_outros_desc, $outros_desconto,
            $forma_pagamento, $provedor_pagamento, $politica_cancelamento, $motivo_viagem, $dispositivo, $grupo_usuarios,
            $observacoes, $reservado_em, $id
        ]); 
    } else { 
        $pdo->prepare('INSERT INTO reservas (
            numero_reserva, reservado_por, nomes_hospedes, nome_hospede, telefone, endereco, booker_country,
            check_in, data_entrada, check_out, data_saida, mes_ano, duracao_diarias, quartos, tipo_unidade, pessoas,
            qtd_adultos, adultos, qtd_criancas, criancas, idade_criancas, plataforma, status, status_pagamento,
            data_cancelamento, r_reserva, preco, r_comissao, valor_comissao, comissao_percentual, perc_comissao,
            r_tx_limpeza, valor_limpeza, r_tx_pet, valor_tx_pet, r_outros_desc, outros_desconto, forma_pagamento,
            provedor_pagamento, politica_cancelamento, motivo_viagem, dispositivo, grupo_usuarios, observacoes,
            reservado_em, data_registro, atualizado_em
        ) VALUES (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW()
        )')->execute([
            $numero_reserva, $reservado_por, $nomes_hospedes, $nome_hospede, $telefone, $endereco, $booker_country,
            $check_in, $data_entrada, $check_out, $data_saida, $mes_ano, $duracao_diarias, $quartos, $tipo_unidade,
            $pessoas, $qtd_adultos, $adultos, $qtd_criancas, $criancas, $idade_criancas, $plataforma, $status,
            $status_pagamento, $data_cancelamento, $r_reserva, $preco, $r_comissao, $valor_comissao, $comissao_percentual,
            $perc_comissao, $r_tx_limpeza, $valor_limpeza, $r_tx_pet, $valor_tx_pet, $r_outros_desc, $outros_desconto,
            $forma_pagamento, $provedor_pagamento, $politica_cancelamento, $motivo_viagem, $dispositivo, $grupo_usuarios,
            $observacoes, $reservado_em
        ]); 
    } 
    header('Location: reservas.php'); 
    exit;
} 

if(isset($_GET['del'])){ 
    $pdo->prepare('DELETE FROM reservas WHERE id=?')->execute([intval($_GET['del'])]); 
    header('Location: reservas.php'); 
    exit;
} 

$edit=null; 
if(isset($_GET['edit'])) {
    $edit=$pdo->query('SELECT * FROM reservas WHERE id='.intval($_GET['edit']))->fetch(); 
}

$apartamentos = $pdo->query("SELECT DISTINCT bloco, apartamento, condominio FROM apartamentos ORDER BY bloco, apartamento")->fetchAll(PDO::FETCH_ASSOC);
$res=$pdo->query('SELECT * FROM reservas ORDER BY check_in DESC')->fetchAll(); 
$quartos_lista = $pdo->query("SELECT DISTINCT quartos FROM reservas ORDER BY quartos")->fetchAll(PDO::FETCH_COLUMN);
$status_lista = $pdo->query("SELECT DISTINCT status FROM reservas ORDER BY status")->fetchAll(PDO::FETCH_COLUMN);
$plataforma_lista = $pdo->query("SELECT DISTINCT plataforma FROM reservas ORDER BY plataforma")->fetchAll(PDO::FETCH_COLUMN);

$meses_checkin = $pdo->query("
    SELECT DISTINCT DATE_FORMAT(check_in, '%Y-%m') as mes
    FROM reservas 
    WHERE check_in IS NOT NULL
    ORDER BY mes DESC
")->fetchAll(PDO::FETCH_COLUMN);

$meses_checkout = $pdo->query("
    SELECT DISTINCT DATE_FORMAT(check_out, '%Y-%m') as mes
    FROM reservas 
    WHERE check_out IS NOT NULL
    ORDER BY mes DESC
")->fetchAll(PDO::FETCH_COLUMN);

$reservas_por_mes = $pdo->query("
  SELECT DATE_FORMAT(check_in, '%Y-%m') as mes, DATE_FORMAT(check_in, '%b/%Y') as mes_label, COUNT(*) as total 
  FROM reservas 
  WHERE check_in IS NOT NULL 
  GROUP BY DATE_FORMAT(check_in, '%Y-%m') 
  ORDER BY DATE_FORMAT(check_in, '%Y-%m') DESC 
  LIMIT 6
")->fetchAll();

$filtro_quartos = $_GET['filtro_quartos'] ?? '';
$filtro_status = $_GET['filtro_status'] ?? '';
$filtro_plataforma = $_GET['filtro_plataforma'] ?? '';
$filtro_hospede = $_GET['filtro_hospede'] ?? '';
$filtro_numero = $_GET['filtro_numero'] ?? '';
$filtro_mes_checkin = $_GET['filtro_mes_checkin'] ?? '';
$filtro_mes_checkout = $_GET['filtro_mes_checkout'] ?? '';

if (!empty($filtro_quartos) || !empty($filtro_status) || !empty($filtro_plataforma) || !empty($filtro_hospede) || !empty($filtro_numero) || !empty($filtro_mes_checkin) || !empty($filtro_mes_checkout)) {
    $res = array_filter($res, function($r) use ($filtro_quartos, $filtro_status, $filtro_plataforma, $filtro_hospede, $filtro_numero, $filtro_mes_checkin, $filtro_mes_checkout) {
        $match = true;
        
        if (!empty($filtro_quartos) && $r['quartos'] !== $filtro_quartos) {
            $match = false;
        }
        
        if (!empty($filtro_status) && $r['status'] !== $filtro_status) {
            $match = false;
        }
        
        if (!empty($filtro_plataforma) && $r['plataforma'] !== $filtro_plataforma) {
            $match = false;
        }
        
        if (!empty($filtro_hospede) && stripos($r['nomes_hospedes'] ?? $r['nome_hospede'], $filtro_hospede) === false) {
            $match = false;
        }
        
        if (!empty($filtro_numero) && stripos($r['numero_reserva'], $filtro_numero) === false) {
            $match = false;
        }
        
        if (!empty($filtro_mes_checkin)) {
            $mes_checkin_reserva = date('Y-m', strtotime($r['check_in']));
            if ($mes_checkin_reserva !== $filtro_mes_checkin) {
                $match = false;
            }
        }
        
        if (!empty($filtro_mes_checkout)) {
            $mes_checkout_reserva = date('Y-m', strtotime($r['check_out']));
            if ($mes_checkout_reserva !== $filtro_mes_checkout) {
                $match = false;
            }
        }
        
        return $match;
    });
}

// âœ… CÃLCULO CORRETO: Reservas - ComissÃ£o - Outros/Desconto = LÃ­quido
$total_reservas = 0;
$total_comissao = 0;
$total_outros_desc = 0;


// âœ… CÃLCULO CORRETO: Reservas - ComissÃ£o - Outros/Desconto = LÃ­quido
// âš ï¸ EXCLUIR CANCELADAS DOS TOTAIS
$total_reservas = 0;
$total_comissao = 0;
$total_outros_desc = 0;

foreach($res as $r) {
    // NÃƒO contar canceladas nos totais
    if (strtolower($r['status']) !== 'cancelada') {
        $total_reservas += $r['r_reserva'];
        $total_comissao += $r['r_comissao'];
        $total_outros_desc += $r['r_outros_desc'];
    }
}

// FÃ“RMULA CORRETA
$total_liquido = $total_reservas - $total_comissao - $total_outros_desc;
?>

<div class="container">
  <h2 class="text-orange mb-4">Reservas</h2>
  
  <div class="months-stats">
    <div class="stat-label">ðŸ“… Reservas por MÃªs:</div>
    <div class="stat-boxes">
      <?php foreach($reservas_por_mes as $mes): ?>
        <div class="stat-box">
          <div class="stat-month"><?= htmlspecialchars($mes['mes_label']) ?></div>
          <div class="stat-count"><?= $mes['total'] ?></div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
  
  <div class="top-actions">
    <a href="reservas.php?new=1" class="btn btn-orange">
      <i class="fas fa-plus"></i> Nova Reserva
    </a>
    <a href="importar_reservas.html" class="btn btn-secondary">
      <i class="fas fa-file-import"></i> Importar CSV
    </a>
    <button class="btn btn-export" onclick="exportarExcelComTotais('tabelaReservas', 'reservas', [12, 14, 15])">
      <i class="fas fa-file-excel"></i> Exportar Excel
    </button>
  </div>
  
  <div class="filters-section">
    <form method="GET" class="filters-form">
      <div class="filter-group">
        <label>Quartos</label>
        <select name="filtro_quartos" class="filter-select">
          <option value="">Todos</option>
          <?php foreach($quartos_lista as $q): ?>
            <option value="<?= htmlspecialchars($q) ?>" <?= $filtro_quartos === $q ? 'selected' : '' ?>>
              <?= htmlspecialchars($q) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Status</label>
        <select name="filtro_status" class="filter-select">
          <option value="">Todos</option>
          <?php foreach($status_lista as $s): ?>
            <option value="<?= htmlspecialchars($s) ?>" <?= $filtro_status === $s ? 'selected' : '' ?>>
              <?= htmlspecialchars($s) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Plataforma</label>
        <select name="filtro_plataforma" class="filter-select">
          <option value="">Todas</option>
          <?php foreach($plataforma_lista as $p): ?>
            <option value="<?= htmlspecialchars($p) ?>" <?= $filtro_plataforma === $p ? 'selected' : '' ?>>
              <?= htmlspecialchars($p) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="filter-group">
        <label><i class="fas fa-sign-in-alt"></i> MÃªs/Ano Check-in</label>
        <select name="filtro_mes_checkin" class="filter-select">
          <option value="">Todos</option>
          <?php foreach($meses_checkin as $mes): 
            $mes_formatado = DateTime::createFromFormat('Y-m', $mes)->format('m/Y');
          ?>
            <option value="<?= $mes ?>" <?= $filtro_mes_checkin === $mes ? 'selected' : '' ?>>
              <?= $mes_formatado ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="filter-group">
        <label><i class="fas fa-sign-out-alt"></i> MÃªs/Ano Check-out</label>
        <select name="filtro_mes_checkout" class="filter-select">
          <option value="">Todos</option>
          <?php foreach($meses_checkout as $mes): 
            $mes_formatado = DateTime::createFromFormat('Y-m', $mes)->format('m/Y');
          ?>
            <option value="<?= $mes ?>" <?= $filtro_mes_checkout === $mes ? 'selected' : '' ?>>
              <?= $mes_formatado ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="filter-group">
        <label>HÃ³spede</label>
        <input type="text" name="filtro_hospede" placeholder="Nome do hÃ³spede" value="<?= htmlspecialchars($filtro_hospede) ?>" class="filter-input">
      </div>
      
      <div class="filter-group">
        <label>NÂº Reserva</label>
        <input type="text" name="filtro_numero" placeholder="NÃºmero" value="<?= htmlspecialchars($filtro_numero) ?>" class="filter-input">
      </div>
      
      <div class="filter-actions">
        <button type="submit" class="btn btn-filter">
          <i class="fas fa-filter"></i> Filtrar
        </button>
        <?php if (!empty($filtro_quartos) || !empty($filtro_status) || !empty($filtro_plataforma) || !empty($filtro_hospede) || !empty($filtro_numero) || !empty($filtro_mes_checkin) || !empty($filtro_mes_checkout)): ?>
          <a href="reservas.php" class="btn btn-clear">
            <i class="fas fa-times"></i> Limpar
          </a>
        <?php endif; ?>
      </div>
    </form>
  </div>
  
  <div class="table-wrapper">
    <table class="table table-dark table-hover" id="tabelaReservas">
    <thead>
      <tr>
        <th>NÂº Reserva</th>
        <th>HÃ³spede</th>
        <th>Telefone</th>
        <th>Check-in</th>
        <th>Check-out</th>
        <th>Dias</th>
        <th>Quartos</th>
        <th>Plataforma</th>
        <th>Adultos</th>
        <th>CrianÃ§as</th>
        <th>Status</th>
        <th>Pagamento</th>
        <th>R$ Reserva</th>
        <th>% Com</th>
        <th>R$ Com</th>
        <th>R$ Outros/Desc</th>
        <th>R$ Limpeza</th>
        <th>R$ Pet</th>
        <th>AÃ§Ãµes</th>
      </tr>
    </thead>
    <tbody>
    <tbody>
      <?php foreach($res as $r): 
        // âœ… ZERAR VALORES SE STATUS FOR CANCELADA
        $isCancelada = (strtolower($r['status']) === 'cancelada');
        $dias = $isCancelada ? 0 : ($r['duracao_diarias'] ?? 0);
        $r_reserva_display = $isCancelada ? 0 : ($r['r_reserva'] ?? 0);
        $perc_comissao_display = $isCancelada ? 0 : ($r['perc_comissao'] ?? 0);
        $r_comissao_display = $isCancelada ? 0 : ($r['r_comissao'] ?? 0);
        $r_outros_desc_display = $isCancelada ? 0 : ($r['r_outros_desc'] ?? 0);
        $r_tx_limpeza_display = $isCancelada ? 0 : ($r['r_tx_limpeza'] ?? 0);
        $r_tx_pet_display = $isCancelada ? 0 : ($r['r_tx_pet'] ?? 0);
      ?>
      <tr style="<?= $isCancelada ? 'opacity: 0.6;' : '' ?>">
        <td>
          <strong><?=htmlspecialchars($r['numero_reserva'])?></strong>
          <?= $isCancelada ? '<br><small style="color: #f44336; font-size: 10px;">(valores zerados)</small>' : '' ?>
        </td>
        <td><?=htmlspecialchars($r['nomes_hospedes'] ?? $r['nome_hospede'])?></td>
        <td><?=htmlspecialchars($r['telefone'])?></td>
        <td><?=date('d/m/Y', strtotime($r['check_in']))?></td>
        <td><?=date('d/m/Y', strtotime($r['check_out']))?></td>
        <td><?=$dias?></td>
        <td><?=htmlspecialchars($r['quartos'])?></td>
        <td><?=htmlspecialchars($r['plataforma'])?></td>
        <td><?=$r['qtd_adultos']?></td>
        <td><?=$r['qtd_criancas']?></td>
        <td>
          <span class="badge badge-<?=strtolower(str_replace('-', '', $r['status']))?>">
            <?=htmlspecialchars($r['status'])?>
          </span>
        </td>
        <td><?=htmlspecialchars($r['status_pagamento'] ?? '-')?></td>
        <td>R$ <?=number_format($r_reserva_display,2,',','.')?></td>
        <td><?=number_format($perc_comissao_display,2,',','.')?>%</td>
        <td>R$ <?=number_format($r_comissao_display,2,',','.')?></td>
        <td>R$ <?=number_format($r_outros_desc_display,2,',','.')?></td>
        <td>R$ <?=number_format($r_tx_limpeza_display,2,',','.')?></td>
        <td>R$ <?=number_format($r_tx_pet_display,2,',','.')?></td>
        <td>
          <div class="actions-list">
            <a href='reservas.php?edit=<?=$r['id']?>' class="btn-icon btn-edit" title="Editar">
              <i class="fas fa-edit"></i>
            </a>
            <a href='reservas.php?del=<?=$r['id']?>' class="btn-icon btn-delete" title="Excluir" onclick="return confirm('Excluir?')">
              <i class="fas fa-trash"></i>
            </a>
          </div>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
    
    <!-- âœ… TOTALIZADORES CORRETOS: Reservas - ComissÃ£o - Outros/Desconto = LÃ­quido -->
    <tfoot>
      <tr style="background: #1a1a1a; font-weight: bold; border-top: 3px solid #ff6600;">
        <td colspan="12" style="text-align: right; padding-right: 20px; color: #ff6600; font-size: 16px;">
          <i class="fas fa-calculator"></i> TOTAIS:
        </td>
        <td style="color: #4CAF50; font-size: 15px;">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 11px; color: #999; font-weight: normal;">Reservas</span>
            <span>R$ <?= number_format($total_reservas, 2, ',', '.') ?></span>
          </div>
        </td>
        <td style="text-align: center;">-</td>
        <td style="color: #F44336; font-size: 15px;">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 11px; color: #999; font-weight: normal;">ComissÃ£o</span>
            <span>R$ <?= number_format($total_comissao, 2, ',', '.') ?></span>
          </div>
        </td>
        <td style="color: #FF9800; font-size: 15px;">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 11px; color: #999; font-weight: normal;">Outros/Desc</span>
            <span>R$ <?= number_format($total_outros_desc, 2, ',', '.') ?></span>
          </div>
        </td>
        <td colspan="2" style="text-align: center;">-</td>
        <td style="text-align: center;">-</td>
      </tr>
      <tr style="background: linear-gradient(135deg, #ff6600 0%, #ff8800 100%); font-weight: bold;">
        <td colspan="12" style="text-align: right; padding-right: 20px; color: #000; font-size: 18px;">
          <i class="fas fa-coins"></i> LÃQUIDO:
        </td>
        <td colspan="6" style="color: #000; font-size: 22px; text-align: center; letter-spacing: 1px;">
          R$ <?= number_format($total_liquido, 2, ',', '.') ?>
        </td>
        <td style="text-align: center;">-</td>
      </tr>
      <tr style="background: #0a0a0a; border-top: 1px solid #333;">
        <td colspan="19" style="text-align: center; padding: 10px; color: #999; font-size: 12px; font-weight: normal;">
          <i class="fas fa-info-circle"></i> 
          CÃ¡lculo: <span style="color: #4CAF50;">R$ Reservas</span> 
          <span style="color: #fff;"> âˆ’ </span> 
          <span style="color: #F44336;">R$ ComissÃ£o</span> 
          <span style="color: #fff;"> âˆ’ </span> 
          <span style="color: #FF9800;">R$ Outros/Desconto</span>
          <span style="color: #fff;"> = </span> 
          <span style="color: #ff6600;">LÃ­quido</span>
        </td>
      </tr>
    </tfoot>
  </table>
  </div>
</div>

<?php if(isset($_GET['new']) || isset($_GET['edit'])): ?>
<div class="content">
  <h2><?= $edit ? 'Editar' : 'Nova' ?> Reserva</h2>
  
  <form method="post">
    <input type="hidden" name="id" value="<?= $edit['id'] ?? '' ?>">
    
    <h3 class="section-title">Dados da Reserva</h3>
    <div class="form-row">
      <div class="form-group">
        <label>NÃºmero da Reserva *</label>
        <input name="numero_reserva" value="<?= htmlspecialchars($edit['numero_reserva'] ?? '') ?>" placeholder="Ex: RES-2025-001" required>
      </div>
      
      <div class="form-group">
        <label>Reservado por</label>
        <input name="reservado_por" value="<?= htmlspecialchars($edit['reservado_por'] ?? '') ?>" placeholder="Ex: JoÃ£o Silva">
      </div>
      
      <div class="form-group">
        <label>Status</label>
        <select name="status" required>
          <option value="Pendente" <?= ($edit['status'] ?? '') === 'Pendente' ? 'selected' : '' ?>>Pendente</option>
          <option value="Confirmada" <?= ($edit['status'] ?? '') === 'Confirmada' ? 'selected' : '' ?>>Confirmada</option>
          <option value="Check-in" <?= ($edit['status'] ?? '') === 'Check-in' ? 'selected' : '' ?>>Check-in</option>
          <option value="Check-out" <?= ($edit['status'] ?? '') === 'Check-out' ? 'selected' : '' ?>>Check-out</option>
          <option value="Cancelada" <?= ($edit['status'] ?? '') === 'Cancelada' ? 'selected' : '' ?>>Cancelada</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Status do Pagamento</label>
        <select name="status_pagamento">
          <option value="">Selecione...</option>
          <option value="Pendente" <?= ($edit['status_pagamento'] ?? '') === 'Pendente' ? 'selected' : '' ?>>Pendente</option>
          <option value="Pago" <?= ($edit['status_pagamento'] ?? '') === 'Pago' ? 'selected' : '' ?>>Pago</option>
          <option value="Parcialmente Pago" <?= ($edit['status_pagamento'] ?? '') === 'Parcialmente Pago' ? 'selected' : '' ?>>Parcialmente Pago</option>
          <option value="Reembolsado" <?= ($edit['status_pagamento'] ?? '') === 'Reembolsado' ? 'selected' : '' ?>>Reembolsado</option>
        </select>
      </div>
    </div>
    
    <h3 class="section-title">Dados do HÃ³spede</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Nome(s) do(s) HÃ³spede(s) *</label>
        <input name="nomes_hospedes" value="<?= htmlspecialchars($edit['nomes_hospedes'] ?? $edit['nome_hospede'] ?? '') ?>" placeholder="Ex: JoÃ£o Silva" required>
      </div>
      
      <div class="form-group">
        <label>Telefone</label>
        <input name="telefone" value="<?= htmlspecialchars($edit['telefone'] ?? '') ?>" placeholder="(34) 99999-9999">
      </div>
      
      <div class="form-group">
        <label>PaÃ­s do Reservante</label>
        <input name="booker_country" value="<?= htmlspecialchars($edit['booker_country'] ?? '') ?>" placeholder="Ex: Brasil">
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group full-width">
        <label>EndereÃ§o</label>
        <input name="endereco" value="<?= htmlspecialchars($edit['endereco'] ?? '') ?>" placeholder="EndereÃ§o completo">
      </div>
    </div>
    
    <h3 class="section-title">Datas e AcomodaÃ§Ã£o</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Check-in *</label>
        <input name="check_in" type="date" value="<?= $edit['check_in'] ?? '' ?>" required>
      </div>
      
      <div class="form-group">
        <label>Check-out *</label>
        <input name="check_out" type="date" value="<?= $edit['check_out'] ?? '' ?>" required>
      </div>
      
      <div class="form-group">
        <label>Quartos *</label>
        <select name="quartos" required>
          <option value="">Selecione...</option>
          <?php foreach($apartamentos as $apt): ?>
            <?php 
              $aptValue = "Bloco {$apt['bloco']} Apto {$apt['apartamento']}";
              $selected = ($edit['quartos'] ?? '') === $aptValue ? 'selected' : '';
            ?>
            <option value="<?= htmlspecialchars($aptValue) ?>" <?= $selected ?>>
              <?= htmlspecialchars($aptValue) ?> - <?= htmlspecialchars($apt['condominio']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      
      <div class="form-group">
        <label>Tipo de Unidade</label>
        <input name="tipo_unidade" value="<?= htmlspecialchars($edit['tipo_unidade'] ?? '') ?>" placeholder="Ex: Quarto, Suite">
      </div>
    </div>
    
    <h3 class="section-title">HÃ³spedes</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Total de Pessoas</label>
        <input name="pessoas" type="number" value="<?= $edit['pessoas'] ?? '0' ?>" min="0">
      </div>
      
      <div class="form-group">
        <label>Qtd Adultos</label>
        <input name="qtd_adultos" type="number" value="<?= $edit['qtd_adultos'] ?? '0' ?>" min="0">
      </div>
      
      <div class="form-group">
        <label>Qtd CrianÃ§as</label>
        <input name="qtd_criancas" type="number" value="<?= $edit['qtd_criancas'] ?? '0' ?>" min="0">
      </div>
      
      <div class="form-group">
        <label>Idade das CrianÃ§as</label>
        <input name="idade_criancas" value="<?= htmlspecialchars($edit['idade_criancas'] ?? '') ?>" placeholder="Ex: 3, 7, 12 anos">
      </div>
    </div>
    
    <h3 class="section-title">InformaÃ§Ãµes de OperaÃ§Ã£o</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Plataforma</label>
        <select name="plataforma">
          <option value="">Selecione...</option>
          <option value="Airbnb" <?= ($edit['plataforma'] ?? '') === 'Airbnb' ? 'selected' : '' ?>>Airbnb</option>
          <option value="Booking.com" <?= ($edit['plataforma'] ?? '') === 'Booking.com' ? 'selected' : '' ?>>Booking.com</option>
          <option value="Direto" <?= ($edit['plataforma'] ?? '') === 'Direto' ? 'selected' : '' ?>>Direto</option>
          <option value="Outro" <?= ($edit['plataforma'] ?? '') === 'Outro' ? 'selected' : '' ?>>Outro</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Motivo da Viagem</label>
        <select name="motivo_viagem">
          <option value="">Selecione...</option>
          <option value="Lazer" <?= ($edit['motivo_viagem'] ?? '') === 'Lazer' ? 'selected' : '' ?>>Lazer</option>
          <option value="NegÃ³cios" <?= ($edit['motivo_viagem'] ?? '') === 'NegÃ³cios' ? 'selected' : '' ?>>NegÃ³cios</option>
          <option value="FamÃ­lia" <?= ($edit['motivo_viagem'] ?? '') === 'FamÃ­lia' ? 'selected' : '' ?>>FamÃ­lia</option>
          <option value="Lua de mel" <?= ($edit['motivo_viagem'] ?? '') === 'Lua de mel' ? 'selected' : '' ?>>Lua de mel</option>
          <option value="Trabalho remoto" <?= ($edit['motivo_viagem'] ?? '') === 'Trabalho remoto' ? 'selected' : '' ?>>Trabalho remoto</option>
          <option value="Outro" <?= ($edit['motivo_viagem'] ?? '') === 'Outro' ? 'selected' : '' ?>>Outro</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Dispositivo</label>
        <select name="dispositivo">
          <option value="">Selecione...</option>
          <option value="Desktop" <?= ($edit['dispositivo'] ?? '') === 'Desktop' ? 'selected' : '' ?>>Desktop</option>
          <option value="Mobile" <?= ($edit['dispositivo'] ?? '') === 'Mobile' ? 'selected' : '' ?>>Mobile</option>
          <option value="Tablet" <?= ($edit['dispositivo'] ?? '') === 'Tablet' ? 'selected' : '' ?>>Tablet</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Grupo de UsuÃ¡rios</label>
        <input name="grupo_usuarios" value="<?= htmlspecialchars($edit['grupo_usuarios'] ?? '') ?>" placeholder="Ex: VIP, Regular">
      </div>
    </div>
    
    <h3 class="section-title">Valores Financeiros</h3>
    <div class="form-row">
      <div class="form-group">
        <label>R$ Reserva *</label>
        <input name="r_reserva" id="r_reserva" type="text" value="<?= $edit['r_reserva'] ?? '' ?>" placeholder="0.00" required onchange="calcularComissao()">
      </div>
      
      <div class="form-group">
        <label>R$ ComissÃ£o *</label>
        <input name="r_comissao" id="r_comissao" type="text" value="<?= $edit['r_comissao'] ?? '' ?>" placeholder="0.00" onchange="calcularComissao()">
      </div>
      
      <div class="form-group">
        <label>% ComissÃ£o (calculado)</label>
        <input id="perc_comissao" type="text" value="<?= number_format($edit['perc_comissao'] ?? 0, 2, ',', '.') ?>%" readonly style="background: #222; cursor: not-allowed;">
      </div>
      
      <div class="form-group">
        <label>Valor da ComissÃ£o</label>
        <input name="valor_comissao" type="text" value="<?= $edit['valor_comissao'] ?? '' ?>" placeholder="0.00">
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>R$ Taxa de Limpeza</label>
        <input name="r_tx_limpeza" type="text" value="<?= $edit['r_tx_limpeza'] ?? '' ?>" placeholder="0.00">
      </div>
      
      <div class="form-group">
        <label>R$ Taxa Pet</label>
        <input name="r_tx_pet" type="text" value="<?= $edit['r_tx_pet'] ?? '' ?>" placeholder="0.00">
      </div>
      
      <div class="form-group">
        <label>R$ Outros/Desconto</label>
        <input name="r_outros_desc" type="text" value="<?= $edit['r_outros_desc'] ?? '' ?>" placeholder="0.00">
      </div>
      
      <div class="form-group">
        <label>ComissÃ£o %</label>
        <input name="comissao_percentual" type="text" value="<?= $edit['comissao_percentual'] ?? '' ?>" placeholder="0.00">
      </div>
    </div>
    
    <h3 class="section-title">Forma de Pagamento</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Forma de Pagamento</label>
        <select name="forma_pagamento">
          <option value="">Selecione...</option>
          <option value="CartÃ£o de crÃ©dito" <?= ($edit['forma_pagamento'] ?? '') === 'CartÃ£o de crÃ©dito' ? 'selected' : '' ?>>CartÃ£o de crÃ©dito</option>
          <option value="CartÃ£o de dÃ©bito" <?= ($edit['forma_pagamento'] ?? '') === 'CartÃ£o de dÃ©bito' ? 'selected' : '' ?>>CartÃ£o de dÃ©bito</option>
          <option value="TransferÃªncia bancÃ¡ria" <?= ($edit['forma_pagamento'] ?? '') === 'TransferÃªncia bancÃ¡ria' ? 'selected' : '' ?>>TransferÃªncia bancÃ¡ria</option>
          <option value="PayPal" <?= ($edit['forma_pagamento'] ?? '') === 'PayPal' ? 'selected' : '' ?>>PayPal</option>
          <option value="Stripe" <?= ($edit['forma_pagamento'] ?? '') === 'Stripe' ? 'selected' : '' ?>>Stripe</option>
          <option value="PIX" <?= ($edit['forma_pagamento'] ?? '') === 'PIX' ? 'selected' : '' ?>>PIX</option>
          <option value="Dinheiro" <?= ($edit['forma_pagamento'] ?? '') === 'Dinheiro' ? 'selected' : '' ?>>Dinheiro</option>
          <option value="Outro" <?= ($edit['forma_pagamento'] ?? '') === 'Outro' ? 'selected' : '' ?>>Outro</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Provedor de Pagamento</label>
        <input name="provedor_pagamento" value="<?= htmlspecialchars($edit['provedor_pagamento'] ?? '') ?>" placeholder="Ex: Stripe, PayPal, Square">
      </div>
      
      <div class="form-group">
        <label>PolÃ­tica de Cancelamento</label>
        <select name="politica_cancelamento">
          <option value="">Selecione...</option>
          <option value="FlexÃ­vel" <?= ($edit['politica_cancelamento'] ?? '') === 'FlexÃ­vel' ? 'selected' : '' ?>>FlexÃ­vel</option>
          <option value="ReembolsÃ¡vel" <?= ($edit['politica_cancelamento'] ?? '') === 'ReembolsÃ¡vel' ? 'selected' : '' ?>>ReembolsÃ¡vel</option>
          <option value="NÃ£o ReembolsÃ¡vel" <?= ($edit['politica_cancelamento'] ?? '') === 'NÃ£o ReembolsÃ¡vel' ? 'selected' : '' ?>>NÃ£o ReembolsÃ¡vel</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Data de Cancelamento</label>
        <input name="data_cancelamento" type="date" value="<?= $edit['data_cancelamento'] ?? '' ?>">
      </div>
    </div>
    
    <h3 class="section-title">ObservaÃ§Ãµes</h3>
    <div class="form-row">
      <div class="form-group full-width">
        <label>ObservaÃ§Ãµes Gerais</label>
        <textarea name="observacoes" rows="4" placeholder="Adicione observaÃ§Ãµes ou notas sobre a reserva"><?= htmlspecialchars($edit['observacoes'] ?? '') ?></textarea>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Reservado em</label>
        <input name="reservado_em" type="datetime-local" value="<?= $edit['reservado_em'] ?? '' ?>">
      </div>
    </div>
    
    <div class="form-actions">
      <button class="btn btn-orange" type="submit">Salvar</button>
      <a href="reservas.php" class="btn btn-secondary">Cancelar</a>
    </div>
  </form>
</div>

<script>
function calcularComissao() {
  const reserva = parseFloat(document.getElementById('r_reserva').value.replace(',', '.')) || 0;
  const comissao = parseFloat(document.getElementById('r_comissao').value.replace(',', '.')) || 0;
  
  if (reserva > 0) {
    const percentual = (comissao / reserva) * 100;
    document.getElementById('perc_comissao').value = percentual.toFixed(2).replace('.', ',') + '%';
  } else {
    document.getElementById('perc_comissao').value = '0,00%';
  }
}

window.addEventListener('DOMContentLoaded', function() {
  calcularComissao();
});
</script>
<?php endif; ?>

<script src="/admin/assets/exportar_excel.js"></script>

<style>
  body { background: #000; color: #fff; font-family: Arial, sans-serif; }
  .container { max-width: 100%; padding: 20px; overflow-x: auto; }
  
  .table-wrapper {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  .text-orange { color: #ff6600; }
  .mb-4 { margin-bottom: 20px; }
  .mt-4 { margin-top: 20px; }
  
  .months-stats {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .stat-label {
    color: #ff6600;
    font-weight: bold;
    font-size: 16px;
    white-space: nowrap;
  }
  
  .stat-boxes {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .stat-box {
    background: #000;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 12px 16px;
    text-align: center;
    transition: all 0.3s;
  }
  
  .stat-box:hover {
    border-color: #ff6600;
    box-shadow: 0 0 10px rgba(255, 102, 0, 0.3);
  }
  
  .stat-month {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }
  
  .stat-count {
    font-size: 24px;
    font-weight: bold;
    color: #ff6600;
  }
  
  .top-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
  }
  
  .filters-section {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 25px;
  }
  
  .filters-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    align-items: end;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-group label {
    color: #ff6600;
    font-weight: bold;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .filter-select,
  .filter-input {
    padding: 10px;
    background: #000;
    border: 1px solid #333;
    border-radius: 5px;
    color: #fff;
    font-size: 13px;
    font-family: Arial, sans-serif;
    transition: border-color 0.3s;
  }
  
  .filter-select:focus,
  .filter-input:focus {
    outline: none;
    border-color: #ff6600;
  }
  
  .filter-select option {
    background: #000;
    color: #fff;
  }
  
  .filter-actions {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  
  .btn-filter {
    background: #ff6600;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.3s;
    font-size: 13px;
  }
  
  .btn-filter:hover {
    background: #ff7b00;
  }
  
  .btn-clear {
    background: #666;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: background 0.3s;
    font-size: 13px;
  }
  
  .btn-clear:hover {
    background: #777;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s;
  }
  
  .btn-orange { background: #ff6600; color: #fff; }
  .btn-orange:hover { background: #ff7b00; }
  .btn-secondary { background: #333; color: #fff; }
  .btn-secondary:hover { background: #444; }
  
  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
  }
  
  .btn-export:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
  
  .table-dark { width: 100%; border-collapse: collapse; margin-top: 10px; overflow-x: auto; }
  .table-dark th, .table-dark td { padding: 10px; border-bottom: 1px solid #333; vertical-align: middle; white-space: nowrap; }
  .table-dark tr:hover { background-color: #111; }
  
  tfoot tr {
    font-weight: bold !important;
  }
  
  tfoot td {
    padding: 15px 10px !important;
  }
  
  .link { text-decoration: none; }
  .link:hover { text-decoration: underline; }
  .text-red { color: #ff4444; }
  
  .badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }
  .badge-confirmada { background: #4CAF50; color: #fff; }
  .badge-pendente { background: #FFC107; color: #000; }
  .badge-cancelada { background: #f44336; color: #fff; }
  .badge-checkin { background: #2196F3; color: #fff; }
  .badge-checkout { background: #9E9E9E; color: #fff; }
  
  .actions-list { display: flex; flex-direction: row; gap: 10px; align-items: center; justify-content: center; }
  .actions-list a { display: inline-flex; }
  
  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: auto;
    padding: 8px 12px;
    border-radius: 0;
    text-decoration: none;
    cursor: pointer;
    font-size: 18px;
    border: none;
    transition: all 0.3s ease;
    background: transparent;
    margin: 0 5px;
  }
  
  .btn-edit {
    color: #2196F3;
  }
  
  .btn-edit:hover {
    color: #1976D2;
    transform: scale(1.3);
  }
  
  .btn-delete {
    color: #f44336;
  }
  
  .btn-delete:hover {
    color: #d32f2f;
    transform: scale(1.3);
  }
  
  .content {
    max-width: 1400px;
    margin: 30px auto;
    padding: 30px;
    background: #111;
    border-radius: 8px;
  }
  
  .content h2 { color: #ff6600; margin-bottom: 30px; font-size: 28px; }
  
  .section-title {
    color: #ff6600;
    font-size: 20px;
    margin: 30px 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #333;
  }
  
  .content form { display: flex; flex-direction: column; gap: 20px; }
  
  .form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .form-row:has(.form-group:nth-child(3):last-child) { grid-template-columns: repeat(3, 1fr); }
  .form-row:has(.form-group:nth-child(6):last-child) { grid-template-columns: repeat(6, 1fr); }
  
  .form-group { display: flex; flex-direction: column; }
  .form-group.full-width { grid-column: 1 / -1; }
  
  .form-group label { color: #fff; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
  .form-group input, .form-group textarea, .form-group select {
    padding: 12px;
    border: 1px solid #333;
    background: #000;
    color: #fff;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.3s;
    font-family: Arial, sans-serif;
  }
  
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: #ff6600;
  }
  
  .form-group textarea { resize: vertical; }
  .form-group select { cursor: pointer; }
  .form-group select option { background: #000; color: #fff; }
  
  .form-actions { display: flex; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #333; }
  
  @media (max-width: 1200px) {
    .form-row { grid-template-columns: repeat(2, 1fr) !important; }
    .filters-form { grid-template-columns: repeat(2, 1fr) !important; }
    .months-stats { flex-direction: column; align-items: flex-start; }
  }
  
  @media (max-width: 768px) {
    .form-row { grid-template-columns: 1fr !important; }
    .content { padding: 20px; }
    .table-dark { font-size: 12px; }
    .filters-form { grid-template-columns: 1fr !important; }
    .filter-actions { flex-direction: column; width: 100%; }
    .btn-filter, .btn-clear { width: 100%; justify-content: center; }
    .top-actions { flex-direction: column; }
    .top-actions .btn { width: 100%; justify-content: center; }
    .stat-boxes { width: 100%; }
    .stat-box { flex: 1; min-width: 100px; }
    .months-stats { flex-direction: column; align-items: flex-start; }
  }
</style>

<?php include 'includes/footer.php'; ?>