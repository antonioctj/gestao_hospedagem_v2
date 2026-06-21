<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Model.php';
require_once __DIR__ . '/app/Models/Reserva.php';

Auth::init();
Auth::middleware();

$user = Auth::user();
$reservaModel = new Reserva();
$tema = $_SESSION['theme'] ?? 'dark';

// API para FullCalendar
if (isset($_GET['action']) && $_GET['action'] === 'eventos') {
    header('Content-Type: application/json');
    echo json_encode($reservaModel->paraCalendario());
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendário - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="public/assets/css/app.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales/pt-br.js"></script>
</head>
<body data-theme="<?= $tema ?>">
    <div class="topbar">
        <div class="brand"><i class="fas fa-home"></i><span><?= APP_NAME ?></span></div>
        <div class="topbar-actions">
            <a href="dashboard.php" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Dashboard</a>
            <a href="reservas.php" class="btn btn-primary"><i class="fas fa-list"></i> Lista</a>
            <a href="logout.php" class="btn btn-error"><i class="fas fa-sign-out-alt"></i> Sair</a>
        </div>
    </div>
    
    <div class="container">
        <h1><i class="fas fa-calendar-alt"></i> Calendário de Reservas</h1>
        <div id="calendar" style="background: var(--surface-primary); padding: 2rem; border-radius: var(--radius-lg); margin-top: 2rem;"></div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            events: 'calendario.php?action=eventos',
            eventClick: function(info) {
                alert('Reserva: ' + info.event.title + '\nNúmero: ' + info.event.extendedProps.numero);
            },
            height: 'auto'
        });
        calendar.render();
    });
    </script>
</body>
</html>
