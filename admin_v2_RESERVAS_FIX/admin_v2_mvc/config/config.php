<?php
/**
 * Configurações Gerais
 * UberHost Admin v2.0 MVC
 */

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Ambiente
define('ENVIRONMENT', 'development');
define('DEBUG', true);

// URLs
define('BASE_URL', 'https://uberhost.com.br/admin_v2');
define('ASSETS_URL', BASE_URL . '/public/assets');

// Paths
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . '/app');
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('STORAGE_PATH', ROOT_PATH . '/storage');

// Sessão
define('SESSION_LIFETIME', 7200); // 2 horas

// Aplicação
define('APP_NAME', 'UberHost Admin');
define('APP_VERSION', '2.0.0');

// Erro reporting
if (DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
