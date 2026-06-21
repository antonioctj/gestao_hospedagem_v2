<?php
class Reserva extends Model {
    protected $table = 'reservas';
    
    public function listarComFiltros($filtros = []) {
        $where = ["1=1"];
        $params = [];
        
        if (!empty($filtros['quartos'])) {
            $where[] = "quartos = ?";
            $params[] = $filtros['quartos'];
        }
        
        if (!empty($filtros['status'])) {
            $where[] = "status = ?";
            $params[] = $filtros['status'];
        }
        
        if (!empty($filtros['plataforma'])) {
            $where[] = "plataforma = ?";
            $params[] = $filtros['plataforma'];
        }
        
        if (!empty($filtros['hospede'])) {
            $where[] = "(nomes_hospedes LIKE ? OR nome_hospede LIKE ?)";
            $busca = "%{$filtros['hospede']}%";
            $params[] = $busca;
            $params[] = $busca;
        }
        
        if (!empty($filtros['numero'])) {
            $where[] = "numero_reserva LIKE ?";
            $params[] = "%{$filtros['numero']}%";
        }
        
        if (!empty($filtros['mes_checkin'])) {
            $where[] = "DATE_FORMAT(check_in, '%Y-%m') = ?";
            $params[] = $filtros['mes_checkin'];
        }
        
        if (!empty($filtros['mes_checkout'])) {
            $where[] = "DATE_FORMAT(check_out, '%Y-%m') = ?";
            $params[] = $filtros['mes_checkout'];
        }
        
        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where) . " ORDER BY check_in DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    public function reservasPorMes() {
        $sql = "SELECT 
                    DATE_FORMAT(check_in, '%Y-%m') as mes,
                    DATE_FORMAT(check_in, '%m/%Y') as mes_label,
                    COUNT(*) as total
                FROM {$this->table}
                WHERE status != 'cancelada'
                GROUP BY DATE_FORMAT(check_in, '%Y-%m')
                ORDER BY mes DESC
                LIMIT 12";
        
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }
    
    public function totais($reservas) {
        $totais = [
            'reservas' => 0,
            'comissao' => 0,
            'outros_desc' => 0,
            'liquido' => 0
        ];
        
        foreach ($reservas as $r) {
            if (strtolower($r['status']) !== 'cancelada') {
                $totais['reservas'] += floatval($r['r_reserva']);
                $totais['comissao'] += floatval($r['r_comissao']);
                $totais['outros_desc'] += floatval($r['r_outros_desc']);
            }
        }
        
        $totais['liquido'] = $totais['reservas'] - $totais['comissao'] - $totais['outros_desc'];
        
        return $totais;
    }
    
    public function paraCalendario() {
        $sql = "SELECT 
                    id,
                    numero_reserva,
                    nomes_hospedes,
                    check_in,
                    check_out,
                    status,
                    plataforma,
                    quartos
                FROM {$this->table}
                WHERE status != 'cancelada'";
        
        $stmt = $this->pdo->query($sql);
        $reservas = $stmt->fetchAll();
        
        $eventos = [];
        foreach ($reservas as $r) {
            $cor = match(strtolower($r['status'])) {
                'confirmada' => '#10b981',
                'pendente' => '#f59e0b',
                default => '#6b7280'
            };
            
            $eventos[] = [
                'id' => $r['id'],
                'title' => $r['nomes_hospedes'] . ' - ' . $r['quartos'],
                'start' => $r['check_in'],
                'end' => $r['check_out'],
                'backgroundColor' => $cor,
                'borderColor' => $cor,
                'extendedProps' => [
                    'numero' => $r['numero_reserva'],
                    'plataforma' => $r['plataforma'],
                    'status' => $r['status']
                ]
            ];
        }
        
        return $eventos;
    }
}
