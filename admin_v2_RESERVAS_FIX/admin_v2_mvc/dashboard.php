<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';

Auth::init();
Auth::middleware();

$user = Auth::user();
$pdo = Database::getInstance()->getConnection();
$tema = $_SESSION['theme'] ?? 'dark';

// Estatísticas
$stats = [
    'total_reservas' => $pdo->query("SELECT COUNT(*) FROM reservas WHERE status != 'cancelada'")->fetchColumn(),
    'reservas_mes' => $pdo->query("SELECT COUNT(*) FROM reservas WHERE YEAR(check_in) = YEAR(CURDATE()) AND MONTH(check_in) = MONTH(CURDATE()) AND status != 'cancelada'")->fetchColumn(),
    'receita_mes' => $pdo->query("SELECT COALESCE(SUM(r_reserva), 0) FROM reservas WHERE YEAR(check_in) = YEAR(CURDATE()) AND MONTH(check_in) = MONTH(CURDATE()) AND status = 'confirmada'")->fetchColumn()
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="public/assets/css/app.css">
</head>
<body data-theme="<?= $tema ?>">
    <div class="topbar">
        <div class="brand"><i class="fas fa-home"></i><span><?= APP_NAME ?></span></div>
        <div class="topbar-actions">
            <div class="user-info">
                <div class="user-details">
                    <div class="user-name"><?= htmlspecialchars($user['nome']) ?></div>
                    <div class="user-perfil"><?= htmlspecialchars($user['perfil']) ?></div>
                </div>
                <a href="logout.php" class="btn btn-error"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
        </div>
    </div>
    
    <div class="container">
        <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
        <p class="subtitle">Visão geral do sistema</p>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-value"><?= number_format($stats['total_reservas']) ?></div>
                <div class="stat-label">Total de Reservas</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
                <div class="stat-value"><?= number_format($stats['reservas_mes']) ?></div>
                <div class="stat-label">Reservas este Mês</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-value">R$ <?= number_format($stats['receita_mes'], 2, ',', '.') ?></div>
                <div class="stat-label">Receita do Mês</div>
            </div>
        </div>
        
        <h2 style="margin-top: 3rem; margin-bottom: 1.5rem;">🚀 Próximos Passos</h2>
        <div style="background: var(--surface-primary); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-primary);">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                <strong>FASE 1 COMPLETA!</strong> Núcleo MVC está funcionando.
            </p>
            <p style="color: var(--text-secondary);">
                Agora vou adicionar módulo por módulo: Calendário, Reservas, Financeiro, etc.
            </p>
        </div>
    </div>
</body>
</html>
