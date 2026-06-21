<?php
/**
 * Entry Point
 * UberHost Admin v2.0 MVC
 */

// Debug temporário
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Controller.php';

Auth::init();

// Se já está logado, redirecionar para dashboard
if (Auth::check()) {
    header('Location: dashboard.php');
    exit;
}

$erro = '';

// Processar login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = $_POST['usuario'] ?? '';
    $senha = $_POST['senha'] ?? '';
    
    if ($usuario && $senha) {
        try {
            $result = Auth::login($usuario, $senha);
            if ($result['success']) {
                header('Location: dashboard.php');
                exit;
            } else {
                $erro = $result['message'];
            }
        } catch (Exception $e) {
            $erro = 'Erro no sistema: ' . $e->getMessage();
        }
    } else {
        $erro = 'Preencha todos os campos';
    }
}

$tema = $_SESSION['theme'] ?? 'dark';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?= APP_NAME ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="public/assets/css/app.css">
    <style>
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bg-primary); position: relative; overflow: hidden; }
    .login-page::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%); animation: pulse 15s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; } 50% { transform: scale(1.1) rotate(180deg); opacity: 0.5; } }
    .login-container { background: var(--surface-primary); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 3rem; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); position: relative; z-index: 1; animation: slideUp 0.5s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .logo { text-align: center; margin-bottom: 2.5rem; }
    .logo i { font-size: 4rem; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; display: block; }
    .logo h1 { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
    .logo p { color: var(--text-secondary); font-size: 0.875rem; }
    .btn-login { width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; border: none; border-radius: var(--radius-md); font-size: 1rem; font-weight: 700; cursor: pointer; transition: all var(--transition-base); margin-top: 0.5rem; }
    .btn-login:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .footer { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-primary); color: var(--text-tertiary); font-size: 0.8125rem; }
    </style>
</head>
<body data-theme="<?= $tema ?>">
    <div class="login-page">
        <div class="login-container">
            <div class="logo">
                <i class="fas fa-home"></i>
                <h1><?= APP_NAME ?></h1>
                <p>Sistema de Gestão Profissional</p>
            </div>
            
            <?php if ($erro): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span><?= htmlspecialchars($erro) ?></span>
            </div>
            <?php endif; ?>
            
            <form method="post">
                <div class="form-group">
                    <label>Usuário</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user"></i>
                        <input type="text" name="usuario" placeholder="Digite seu usuário" required autofocus>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Senha</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="senha" placeholder="Digite sua senha" required>
                    </div>
                </div>
                
                <button type="submit" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Entrar
                </button>
            </form>
            
            <div class="footer">© <?= date('Y') ?> <?= APP_NAME ?> v<?= APP_VERSION ?></div>
        </div>
    </div>
</body>
</html>
