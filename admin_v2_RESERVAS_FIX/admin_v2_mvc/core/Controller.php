<?php
class Controller {
    protected function view($view, $data = []) {
        extract($data);
        $viewPath = APP_PATH . '/Views/' . str_replace('.', '/', $view) . '.php';
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("View não encontrada: $view");
        }
    }
    
    protected function redirect($url) {
        header("Location: $url");
        exit;
    }
    
    protected function json($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
