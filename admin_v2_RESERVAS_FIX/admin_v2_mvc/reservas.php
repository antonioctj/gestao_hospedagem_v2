<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Model.php';
require_once __DIR__ . '/app/Models/Reserva.php';

Auth::init();
Auth::middleware();

$user = Auth::user();
$pdo = Database::getInstance()->getConnection();
$tema = $_SESSION['theme'] ?? 'dark';

$reservaModel = new Reserva();

// Processar ações CRUD
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['deletar'])) {
        $reservaModel->delete($_POST['id']);
        header('Location: reservas.php');
        exit;
    }
}

// Filtros
$filtros = [
    'quartos' => $_GET['filtro_quartos'] ?? '',
    'status' => $_GET['filtro_status'] ?? '',
    'plataforma' => $_GET['filtro_plataforma'] ?? '',
    'hospede' => $_GET['filtro_hospede'] ?? '',
    'numero' => $_GET['filtro_numero'] ?? '',
    'mes_checkin' => $_GET['filtro_mes_checkin'] ?? '',
    'mes_checkout' => $_GET['filtro_mes_checkout'] ?? ''
];

// Buscar dados
$reservas = $reservaModel->listarComFiltros($filtros);
$reservasPorMes = $reservaModel->reservasPorMes();
$totais = $reservaModel->totais($reservas);

// Listas para filtros
$quartos_lista = $pdo->query("SELECT DISTINCT quartos FROM reservas ORDER BY quartos")->fetchAll(PDO::FETCH_COLUMN);
$status_lista = $pdo->query("SELECT DISTINCT status FROM reservas ORDER BY status")->fetchAll(PDO::FETCH_COLUMN);
$plataforma_lista = $pdo->query("SELECT DISTINCT plataforma FROM reservas ORDER BY plataforma")->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservas - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="public/assets/css/app.css">
    <style>
    .months-stats { background: var(--surface-primary); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 1px solid var(--border-primary); }
    .stat-label { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
    .stat-boxes { display: flex; gap: 1rem; flex-wrap: wrap; }
    .stat-box { background: var(--surface-secondary); padding: 1rem; border-radius: var(--radius-md); min-width: 100px; text-align: center; }
    .stat-month { font-size: 0.875rem; color: var(--text-secondary); }
    .stat-count { font-size: 1.5rem; font-weight: 700; color: var(--primary-500); }
    .top-actions { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .filters-section { background: var(--surface-primary); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 1px solid var(--border-primary); }
    .filters-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .filter-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); }
    .filter-select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-primary); background: var(--surface-secondary); color: var(--text-primary); border-radius: var(--radius-md); }
    table { width: 100%; background: var(--surface-primary); border-radius: var(--radius-lg); overflow: hidden; }
    th { background: var(--surface-secondary); color: var(--text-primary); padding: 1rem; text-align: left; font-weight: 600; }
    td { padding: 1rem; border-bottom: 1px solid var(--border-primary); color: var(--text-secondary); }
    tr:hover { background: var(--surface-hover); }
    .badge { padding: 0.375rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge.confirmada { background: rgba(16,185,129,0.1); color: var(--success-500); }
    .badge.pendente { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .badge.cancelada { background: rgba(239,68,68,0.1); color: var(--error-500); }
    .totais { background: var(--surface-primary); padding: 1.5rem; border-radius: var(--radius-lg); margin-top: 2rem; border: 1px solid var(--border-primary); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .total-item { text-align: center; }
    .total-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .total-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    </style>
</head>
<body data-theme="<?= $tema ?>">
    <div class="topbar">
        <div class="brand"><i class="fas fa-home"></i><span><?= APP_NAME ?></span></div>
        <div class="topbar-actions">
            <a href="dashboard.php" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Dashboard</a>
            <a href="calendario.php" class="btn btn-primary"><i class="fas fa-calendar"></i> Calendário</a>
            <a href="logout.php" class="btn btn-error"><i class="fas fa-sign-out-alt"></i> Sair</a>
        </div>
    </div>
    
    <div class="container">
        <h1><i class="fas fa-calendar-check"></i> Reservas</h1>
        
        <div class="months-stats">
            <div class="stat-label">📅 Reservas por Mês:</div>
            <div class="stat-boxes">
                <?php foreach ($reservasPorMes as $mes): ?>
                <div class="stat-box">
                    <div class="stat-month"><?= $mes['mes_label'] ?></div>
                    <div class="stat-count"><?= $mes['total'] ?></div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div class="top-actions">
            <a href="reserva_form.php" class="btn btn-primary"><i class="fas fa-plus"></i> Nova Reserva</a>
            <a href="importar_reservas.php" class="btn btn-secondary"><i class="fas fa-file-import"></i> Importar CSV</a>
            <button class="btn btn-success" onclick="exportarExcel()"><i class="fas fa-file-excel"></i> Exportar Excel</button>
        </div>
        
        <div class="filters-section">
            <form method="GET" class="filters-form">
                <div class="filter-group">
                    <label>Quartos</label>
                    <select name="filtro_quartos" class="filter-select" onchange="this.form.submit()">
                        <option value="">Todos</option>
                        <?php foreach ($quartos_lista as $q): ?>
                        <option value="<?= htmlspecialchars($q) ?>" <?= $filtros['quartos'] === $q ? 'selected' : '' ?>><?= htmlspecialchars($q) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status</label>
                    <select name="filtro_status" class="filter-select" onchange="this.form.submit()">
                        <option value="">Todos</option>
                        <?php foreach ($status_lista as $s): ?>
                        <option value="<?= htmlspecialchars($s) ?>" <?= $filtros['status'] === $s ? 'selected' : '' ?>><?= htmlspecialchars($s) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Plataforma</label>
                    <select name="filtro_plataforma" class="filter-select" onchange="this.form.submit()">
                        <option value="">Todas</option>
                        <?php foreach ($plataforma_lista as $p): ?>
                        <option value="<?= htmlspecialchars($p) ?>" <?= $filtros['plataforma'] === $p ? 'selected' : '' ?>><?= htmlspecialchars($p) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Hóspede</label>
                    <input type="text" name="filtro_hospede" class="filter-select" value="<?= htmlspecialchars($filtros['hospede']) ?>" placeholder="Nome do hóspede">
                </div>
                <div class="filter-group">
                    <label>Número Reserva</label>
                    <input type="text" name="filtro_numero" class="filter-select" value="<?= htmlspecialchars($filtros['numero']) ?>" placeholder="Número">
                </div>
                <div class="filter-group">
                    <button type="submit" class="btn btn-primary" style="margin-top: 1.75rem;"><i class="fas fa-search"></i> Filtrar</button>
                    <a href="reservas.php" class="btn btn-secondary" style="margin-top: 1.75rem;"><i class="fas fa-times"></i> Limpar</a>
                </div>
            </form>
        </div>
        
        <div style="overflow-x: auto;">
            <table id="tabelaReservas">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Hóspede</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Diárias</th>
                        <th>Quartos</th>
                        <th>Plataforma</th>
                        <th>Reserva</th>
                        <th>Comissão</th>
                        <th>Outros/Desc</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($reservas)): ?>
                    <tr><td colspan="12" style="text-align: center; padding: 3rem;">Nenhuma reserva encontrada</td></tr>
                    <?php else: ?>
                        <?php foreach ($reservas as $r): ?>
                        <tr>
                            <td><?= htmlspecialchars($r['numero_reserva']) ?></td>
                            <td><strong><?= htmlspecialchars($r['nomes_hospedes']) ?></strong></td>
                            <td><?= date('d/m/Y', strtotime($r['check_in'])) ?></td>
                            <td><?= date('d/m/Y', strtotime($r['check_out'])) ?></td>
                            <td><?= $r['duracao_diarias'] ?></td>
                            <td><?= htmlspecialchars($r['quartos']) ?></td>
                            <td><?= htmlspecialchars($r['plataforma']) ?></td>
                            <td>R$ <?= number_format($r['r_reserva'], 2, ',', '.') ?></td>
                            <td>R$ <?= number_format($r['r_comissao'], 2, ',', '.') ?></td>
                            <td>R$ <?= number_format($r['r_outros_desc'], 2, ',', '.') ?></td>
                            <td><span class="badge <?= strtolower($r['status']) ?>"><?= $r['status'] ?></span></td>
                            <td>
                                <a href="reserva_form.php?id=<?= $r['id'] ?>" class="btn btn-sm btn-primary"><i class="fas fa-edit"></i></a>
                                <form method="post" style="display:inline;" onsubmit="return confirm('Deletar esta reserva?')">
                                    <input type="hidden" name="id" value="<?= $r['id'] ?>">
                                    <button type="submit" name="deletar" class="btn btn-sm btn-error"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div class="totais">
            <div class="total-item">
                <div class="total-label">Total Reservas</div>
                <div class="total-value">R$ <?= number_format($totais['reservas'], 2, ',', '.') ?></div>
            </div>
            <div class="total-item">
                <div class="total-label">Total Comissão</div>
                <div class="total-value">R$ <?= number_format($totais['comissao'], 2, ',', '.') ?></div>
            </div>
            <div class="total-item">
                <div class="total-label">Outros/Desconto</div>
                <div class="total-value">R$ <?= number_format($totais['outros_desc'], 2, ',', '.') ?></div>
            </div>
            <div class="total-item">
                <div class="total-label">Líquido</div>
                <div class="total-value" style="color: var(--success-500);">R$ <?= number_format($totais['liquido'], 2, ',', '.') ?></div>
            </div>
        </div>
    </div>
    
    <script>
    function exportarExcel() {
        window.location = 'exportar_excel.php';
    }
    </script>
</body>
</html>
