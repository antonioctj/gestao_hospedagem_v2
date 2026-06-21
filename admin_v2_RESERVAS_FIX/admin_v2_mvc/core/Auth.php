<?php
/**
 * Sistema de Autenticação
 * UberHost Admin v2.0 MVC
 */

class Auth {
    private static $pdo;
    
    public static function init() {
        self::$pdo = Database::getInstance()->getConnection();
    }
    
    /**
     * Verificar se está autenticado
     */
    public static function check() {
        return isset($_SESSION['user_id']);
    }
    
    /**
     * Middleware de autenticação
     */
    public static function middleware() {
        if (!self::check()) {
            header('Location: ' . BASE_URL . '/index.php');
            exit;
        }
    }
    
    /**
     * Fazer login
     */
    public static function login($usuario, $senha) {
        try {
            $stmt = self::$pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? LIMIT 1");
            $stmt->execute([$usuario]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'Usuário não encontrado'];
            }
            
            // Tentar password_verify primeiro, se falhar tentar senha direta (compatibilidade)
            $senhaValida = false;
            if (password_verify($senha, $user['senha'])) {
                $senhaValida = true;
            } elseif ($user['senha'] === $senha || $user['senha'] === md5($senha)) {
                $senhaValida = true;
            }
            
            if (!$senhaValida) {
                return ['success' => false, 'message' => 'Senha incorreta'];
            }
            
            // Criar sessão
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_nome'] = $user['nome'];
            $_SESSION['user_usuario'] = $user['usuario'];
            $_SESSION['user_perfil'] = $user['perfil'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['login_time'] = time();
            
            // Carregar permissões
            self::loadPermissions($user['perfil']);
            
            return ['success' => true];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Erro ao fazer login'];
        }
    }
    
    /**
     * Carregar permissões do perfil
     */
    private static function loadPermissions($perfil) {
        try {
            $stmt = self::$pdo->prepare("
                SELECT r.nome, pp.criar, pp.ler, pp.atualizar, pp.deletar
                FROM perfil_permissoes pp
                INNER JOIN recursos r ON pp.recurso_id = r.id
                WHERE pp.perfil = ? AND pp.permitido = 1 AND r.ativo = 1
            ");
            $stmt->execute([$perfil]);
            $permissoes = $stmt->fetchAll();
            
            $_SESSION['permissoes'] = [];
            foreach ($permissoes as $p) {
                $_SESSION['permissoes'][$p['nome']] = [
                    'criar' => $p['criar'],
                    'ler' => $p['ler'],
                    'atualizar' => $p['atualizar'],
                    'deletar' => $p['deletar']
                ];
            }
        } catch (Exception $e) {
            $_SESSION['permissoes'] = [];
        }
    }
    
    /**
     * Verificar permissão
     */
    public static function can($recurso, $acao = 'ler') {
        if (!self::check()) {
            return false;
        }
        
        // Gerente tem acesso total
        if ($_SESSION['user_perfil'] === 'Gerente') {
            return true;
        }
        
        $permissoes = $_SESSION['permissoes'] ?? [];
        
        if (!isset($permissoes[$recurso])) {
            return false;
        }
        
        return $permissoes[$recurso][$acao] ?? false;
    }
    
    /**
     * Fazer logout
     */
    public static function logout() {
        session_destroy();
        header('Location: ' . BASE_URL . '/index.php');
        exit;
    }
    
    /**
     * Obter usuário atual
     */
    public static function user() {
        if (!self::check()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['user_id'],
            'nome' => $_SESSION['user_nome'],
            'usuario' => $_SESSION['user_usuario'],
            'perfil' => $_SESSION['user_perfil'],
            'email' => $_SESSION['user_email']
        ];
    }
}
