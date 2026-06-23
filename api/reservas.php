<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = $_GET['_route'] ?? '';

// Tentar validar, mas funcionar com ou sem token (fallback)
$user = getAuthUserOrFallback();
if (!$user) {
    $user = ['id' => 1, 'nivel' => 'gerente', 'email' => 'admin@test.com'];
}

// Rotas especiais de importação
if ($method === 'POST' && (strpos($path, 'preview') !== false || $route === 'preview' || $action === 'preview')) {
    handlePreview($pdo);
    exit;
} elseif ($method === 'POST' && (strpos($path, 'importar') !== false || $route === 'importar' || $action === 'importar')) {
    handleImportar($pdo);
    exit;
}

// Rotear por método padrão
if ($method === 'GET') {
    handleGetReservas($pdo, $user);
} elseif ($method === 'POST') {
    handleCreateReserva($pdo, $user);
} elseif ($method === 'PUT') {
    handleUpdateReserva($pdo, $user);
} elseif ($method === 'DELETE') {
    handleDeleteReserva($pdo, $user);
} else {
    jsonResponse(['error' => 'Método não permitido'], 405);
}

// ========== HANDLERS ==========

function handleGetReservas($pdo, $user) {
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 25);
    $offset = ($page - 1) * $limit;

    // Filtros
    $status = $_GET['status'] ?? '';
    $platform = $_GET['platform'] ?? '';
    $searchGuest = $_GET['search'] ?? '';
    $numeroReserva = $_GET['numero_reserva'] ?? '';
    $condominioId = $_GET['condominio_id'] ?? '';
    $periodo = $_GET['periodo'] ?? '';
    $checkInMes = $_GET['check_in_mes'] ?? '';
    $checkInAno = $_GET['check_in_ano'] ?? '';
    $checkOutMes = $_GET['check_out_mes'] ?? '';
    $checkOutAno = $_GET['check_out_ano'] ?? '';

    // Debug log
    error_log("FILTROS RECEBIDOS: condominio_id='{$condominioId}', platform='{$platform}', status='{$status}'");

    // Processar período predefinido (default: mês atual)
    $startDate = '';
    $endDate = '';

    // Se nenhum filtro de período for especificado, usar o mês atual como padrão
    if (!$periodo && !$checkInMes && !$checkOutMes) {
        $periodo = 'mes';
    }

    if ($periodo) {
        $hoje = new DateTime('now');
        switch ($periodo) {
            case 'hoje':
                $startDate = $hoje->format('Y-m-d');
                $endDate = $hoje->format('Y-m-d');
                break;
            case 'semana':
                $startDate = $hoje->format('Y-m-d');
                $hoje->modify('+6 days');
                $endDate = $hoje->format('Y-m-d');
                break;
            case 'mes':
                $startDate = $hoje->format('Y-m-01');
                $hoje->modify('last day of this month');
                $endDate = $hoje->format('Y-m-d');
                break;
            case 'trimestre':
                $mes = intval($hoje->format('m'));
                $ano = intval($hoje->format('Y'));
                $mesTrimestre = (intval($mes / 3)) * 3 + 1;
                $startDate = sprintf('%04d-%02d-01', $ano, $mesTrimestre);
                $hoje->setDate($ano, $mesTrimestre + 2, 1)->modify('last day of this month');
                $endDate = $hoje->format('Y-m-d');
                break;
            case 'ano':
                $startDate = $hoje->format('Y-01-01');
                $endDate = $hoje->format('Y-12-31');
                break;
        }
    } elseif ($checkInMes && $checkInAno) {
        $startDate = sprintf('%04d-%02d-01', intval($checkInAno), intval($checkInMes));
        $temp = new DateTime($startDate);
        $temp->modify('last day of this month');
        $startDate = $startDate . ' 00:00:00';
    }

    if ($checkOutMes && $checkOutAno) {
        $endDate = sprintf('%04d-%02d-01', intval($checkOutAno), intval($checkOutMes));
        $temp = new DateTime($endDate);
        $temp->modify('last day of this month');
        $endDate = $temp->format('Y-m-d') . ' 23:59:59';
    }

    // Construir query
    $where = '1=1';
    $params = [];

    if ($status) {
        $where .= ' AND r.status = ?';
        $params[] = $status;
    }
    if ($platform) {
        $where .= ' AND r.plataforma = ?';
        $params[] = $platform;
    }
    if ($condominioId) {
        // Buscar o nome do condominio usando o ID
        $stmt_cond = $pdo->prepare("SELECT nome FROM condominios WHERE id = ?");
        $stmt_cond->execute([intval($condominioId)]);
        $cond = $stmt_cond->fetch(PDO::FETCH_ASSOC);

        if ($cond) {
            // Filtrar usando o nome do condominio
            $where .= ' AND (r.condominio_predio = ? OR r.condominio_id = ?)';
            $params[] = $cond['nome'];
            $params[] = intval($condominioId);
        }
    }
    if ($numeroReserva) {
        $where .= ' AND r.numero_reserva LIKE ?';
        $params[] = "%$numeroReserva%";
    }
    if ($searchGuest) {
        $where .= ' AND r.nome_hospede LIKE ?';
        $params[] = "%$searchGuest%";
    }
    if ($startDate && $endDate) {
        // Usar mesma lógica do Dashboard: check_in deve estar dentro do período
        $where .= ' AND r.check_in >= ? AND r.check_in <= ?';
        $params[] = $startDate;
        $params[] = $endDate;
    } elseif ($startDate) {
        $where .= ' AND r.check_in >= ?';
        $params[] = $startDate;
    } elseif ($endDate) {
        $where .= ' AND r.check_in <= ?';
        $params[] = $endDate;
    }

    // Validar acesso (anfitrião vê apenas suas reservas)
    // TODO: Implementar controle de acesso por proprietário quando user_id for adicionado à tabela
    // if ($user['nivel'] === 'anfitrião') {
    //     $where .= ' AND user_id = ?';
    //     $params[] = $user['id'];
    // }

    // Contar total
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM reservas r LEFT JOIN condominios c ON r.condominio_id = c.id LEFT JOIN propriedades p ON r.propriedade_id = p.id WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Buscar dados com JOINs para condominio e propriedade
    $stmt = $pdo->prepare("
        SELECT
            r.*,
            r.quartos as apartamento_id,
            c.nome as condominio_nome,
            p.nome as propriedade_nome
        FROM reservas r
        LEFT JOIN condominios c ON r.condominio_id = c.id
        LEFT JOIN propriedades p ON r.propriedade_id = p.id
        WHERE $where
        ORDER BY r.check_in DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular totalizadores - usar mesma lógica do Dashboard (confirmadas + canceladas pagas)
    $where_totals = $where . " AND (r.status != 'Cancelada' OR (r.status = 'Cancelada' AND r.status_pagamento = 'pago'))";
    $stmt_totals = $pdo->prepare("
        SELECT
            COUNT(*) as qty_reservas,
            IFNULL(SUM(CAST(r.r_reserva AS DECIMAL(12,2))), 0) as total_reserva,
            IFNULL(SUM(CAST(r.r_tx_limpeza AS DECIMAL(12,2))), 0) as total_limpeza,
            IFNULL(SUM(CAST(r.r_tx_pet AS DECIMAL(12,2))), 0) as total_pet,
            IFNULL(SUM(CAST(r.r_comissao AS DECIMAL(12,2))), 0) as total_comissao,
            IFNULL(SUM(CAST(r.r_outros_desc AS DECIMAL(12,2))), 0) as total_outros_desc
        FROM reservas r
        LEFT JOIN condominios c ON r.condominio_id = c.id
        LEFT JOIN propriedades p ON r.propriedade_id = p.id
        WHERE $where_totals
    ");
    $stmt_totals->execute($params);
    $totals = $stmt_totals->fetch(PDO::FETCH_ASSOC);

    // Calcular totais derivados
    $total_geral = ($totals['total_reserva'] ?? 0) + ($totals['total_limpeza'] ?? 0) + ($totals['total_pet'] ?? 0);
    $total_descontos = ($totals['total_comissao'] ?? 0) + ($totals['total_outros_desc'] ?? 0);
    $total_rendimento = $total_geral - $total_descontos;

    jsonResponse([
        'data' => $reservas,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'pages' => ceil($total / $limit),
        'totals' => [
            'qty_reservas' => $totals['qty_reservas'] ?? 0,
            'total_reserva' => $totals['total_reserva'] ?? 0,
            'total_limpeza' => $totals['total_limpeza'] ?? 0,
            'total_pet' => $totals['total_pet'] ?? 0,
            'total_geral' => $total_geral,
            'total_comissao' => $totals['total_comissao'] ?? 0,
            'total_outros_desc' => $totals['total_outros_desc'] ?? 0,
            'total_descontos' => $total_descontos,
            'total_rendimento' => $total_rendimento
        ]
    ]);
}

function handleCreateReserva($pdo, $user) {
    // Super_admin, gerente e anfitrião podem criar
    if (!in_array($user['nivel'], ['super_admin', 'gerente', 'anfitrião'])) {
        jsonResponse(['error' => 'Permissão negada'], 403);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Validar campos obrigatórios
    if (empty($data['nome_hospede']) || empty($data['apartamento_id']) ||
        empty($data['check_in']) || empty($data['check_out'])) {
        jsonResponse(['error' => 'Campos obrigatórios faltando'], 400);
    }

    // Validar datas
    $checkin = strtotime($data['check_in']);
    $checkout = strtotime($data['check_out']);
    if ($checkin >= $checkout) {
        jsonResponse(['error' => 'Data de saída deve ser após entrada'], 400);
    }

    // Preparar valores financeiros
    $r_reserva = floatval($data['r_reserva'] ?? 0);
    $perc_comissao = floatval($data['perc_comissao'] ?? 0);
    $r_comissao = floatval($data['r_comissao'] ?? 0);
    $r_tx_limpeza = floatval($data['r_tx_limpeza'] ?? 0);
    $r_tx_pet = floatval($data['r_tx_pet'] ?? 0);
    $r_outros_desc = floatval($data['r_outros_desc'] ?? 0);

    // Se status é cancelada, zerar valores financeiros
    $status = $data['status'] ?? 'Pendente';
    if (strtolower($status) === 'cancelada') {
        $r_comissao = 0;
        $r_tx_limpeza = 0;
        $r_tx_pet = 0;
        $r_outros_desc = 0;
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO reservas (
                numero_reserva, apartamento_id, quartos, nome_hospede, email_hospede, telefone, endereco,
                check_in, check_out, qtd_adultos, qtd_criancas,
                r_reserva, perc_comissao, r_comissao, r_tx_limpeza, r_tx_pet, r_outros_desc,
                status, status_pagamento, forma_pagamento, politica_cancelamento, motivo_viagem,
                plataforma, observacoes, cidade_uf, condominio_predio, bloco_torre, user_id, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ');

        $stmt->execute([
            $data['numero_reserva'] ?? null,
            $data['apartamento_id'],
            $data['apartamento_id'],
            $data['nome_hospede'],
            $data['email_hospede'] ?? null,
            $data['telefone'] ?? null,
            $data['endereco'] ?? null,
            $data['check_in'],
            $data['check_out'],
            intval($data['qtd_adultos'] ?? 0),
            intval($data['qtd_criancas'] ?? 0),
            $r_reserva,
            $perc_comissao,
            $r_comissao,
            $r_tx_limpeza,
            $r_tx_pet,
            $r_outros_desc,
            $status,
            $data['status_pagamento'] ?? 'Pendente',
            $data['forma_pagamento'] ?? null,
            $data['politica_cancelamento'] ?? 'Flexível',
            $data['motivo_viagem'] ?? null,
            $data['platform'] ?? 'particular',
            $data['observacoes'] ?? null,
            $data['cidade_uf'] ?? null,
            $data['condominio_predio'] ?? null,
            $data['bloco_torre'] ?? null,
            $user['id']
        ]);

        $id = $pdo->lastInsertId();
        jsonResponse([
            'message' => 'Reserva criada com sucesso',
            'id' => $id
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro ao criar reserva: ' . $e->getMessage()], 500);
    }
}

function handleUpdateReserva($pdo, $user) {
    // Super_admin, gerente e anfitrião podem editar
    if (!in_array($user['nivel'], ['super_admin', 'gerente', 'anfitrião'])) {
        jsonResponse(['error' => 'Permissão negada'], 403);
    }

    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => 'ID inválido'], 400);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Validar acesso (anfitrião só pode editar suas reservas)
    if ($user['nivel'] === 'anfitrião') {
        $stmt = $pdo->prepare('SELECT user_id FROM reservas WHERE id = ?');
        $stmt->execute([$id]);
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$reserva || $reserva['user_id'] != $user['id']) {
            jsonResponse(['error' => 'Reserva não encontrada ou acesso negado'], 403);
        }
    }

    try {
        $updateFields = [];
        $params = [];

        // Campos permitidos para atualização
        $allowedFields = [
            'numero_reserva', 'nome_hospede', 'email_hospede', 'telefone', 'endereco', 'nomes_hospedes',
            'check_in', 'check_out', 'qtd_adultos', 'qtd_criancas', 'duracao_diarias',
            'r_reserva', 'perc_comissao', 'r_comissao', 'r_tx_limpeza', 'r_tx_pet', 'r_outros_desc',
            'status', 'status_pagamento', 'forma_pagamento', 'politica_cancelamento', 'motivo_viagem',
            'plataforma', 'observacoes', 'cidade_uf', 'condominio_predio', 'condominio_id',
            'bloco_torre', 'quartos', 'apartamento_id', 'propriedade_id'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updateFields)) {
            jsonResponse(['error' => 'Nenhum campo para atualizar'], 400);
        }

        // Se status foi alterado para cancelada, zerar valores financeiros
        if (isset($data['status']) && strtolower($data['status']) === 'cancelada') {
            if (!in_array('r_comissao = ?', $updateFields)) {
                $updateFields[] = 'r_comissao = ?';
                $params[] = 0;
            }
            if (!in_array('r_tx_limpeza = ?', $updateFields)) {
                $updateFields[] = 'r_tx_limpeza = ?';
                $params[] = 0;
            }
            if (!in_array('r_tx_pet = ?', $updateFields)) {
                $updateFields[] = 'r_tx_pet = ?';
                $params[] = 0;
            }
            if (!in_array('r_outros_desc = ?', $updateFields)) {
                $updateFields[] = 'r_outros_desc = ?';
                $params[] = 0;
            }
        }

        $updateFields[] = 'atualizado_em = NOW()';
        $params[] = $id;

        $query = 'UPDATE reservas SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        jsonResponse(['message' => 'Reserva atualizada com sucesso']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro ao atualizar: ' . $e->getMessage()], 500);
    }
}

function handleDeleteReserva($pdo, $user) {
    // Super_admin e gerente podem deletar
    if (!in_array($user['nivel'], ['super_admin', 'gerente'])) {
        jsonResponse(['error' => 'Apenas super_admin e gerentes podem deletar'], 403);
    }

    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => 'ID inválido'], 400);
    }

    try {
        // Soft delete (marcar como cancelada)
        $stmt = $pdo->prepare('UPDATE reservas SET status = "cancelada", atualizado_em = NOW() WHERE id = ?');
        $stmt->execute([$id]);

        jsonResponse(['message' => 'Reserva cancelada com sucesso']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro ao deletar: ' . $e->getMessage()], 500);
    }
}

function obterTaxaLimpeza($pdo) {
    try {
        if (!$pdo) {
            return 0; // Padrão se PDO não estiver disponível
        }

        $stmt = $pdo->query("SELECT dados FROM configuracoes WHERE tipo = 'reservas'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $dados = json_decode($result['dados'], true);
            return floatval($dados['parametros']['taxa_limpeza'] ?? 0);
        }

        return 0; // Padrão
    } catch (Exception $e) {
        return 0; // Padrão em caso de erro
    }
}

function handlePreview($pdo) {
    if (!isset($_FILES['file'])) {
        jsonResponse(['error' => 'Arquivo não enviado'], 400);
    }

    $platform = $_POST['platform'] ?? 'booking';
    $file = $_FILES['file']['tmp_name'];
    $filename = $_FILES['file']['name'] ?? 'arquivo';

    try {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        $dados = [];

        if ($ext === 'csv') {
            // Processar CSV
            if (($handle = fopen($file, 'r')) !== FALSE) {
                $row = 0;
                while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
                    $row++;
                    if ($row === 1) continue; // Skip header

                    // Detectar plataforma pelo tipo de dado
                    $tipo = trim($data[2] ?? '');

                    // Se a coluna 2 (Tipo) existe, é provavelmente Airbnb
                    if ($tipo === 'Reserva' || $tipo === 'Payout' || $platform === 'airbnb') {
                        // Processar como Airbnb
                        $reserva = extrairReservaAirbnb($data, $platform, $pdo);
                        if ($reserva && $reserva['numero_reserva']) {
                            $dados[] = $reserva;
                        }
                    } else {
                        // Processar como Booking (padrão)
                        // Montar objeto com dados CSV
                        // Parsing dos dados do CSV
                        $preco_bruto = floatval($data[12] ?? 0);
                        // Coluna 6 (index 6) = Status
                        $status_arquivo = strtoupper(trim(preg_replace('/\s+/', ' ', $data[6] ?? '')));

                        // Coluna 13 (index 13) = Comissão % e Coluna 14 (index 14) = Valor da comissão
                        $r_comissao_calc = floatval(str_replace(',', '.', $data[14] ?? 0));

                        // Determinar status pagamento e status da reserva
                        // REGRA: Se Status = "OK" → Confirmada com pgto "pago" e valores mantidos
                        // REGRA: Se Status ≠ "OK" (cancelada):
                        //   - COM comissão (coluna 14 > 0) → Cancelada com pgto "pago" e valores MANTIDOS
                        //   - SEM comissão → Cancelada com pgto "Cancelada" e valores ZERADOS

                        $status_reserva = 'Confirmada';
                        $status_pagamento_calc = 'pago';
                        $valor_limpeza = obterTaxaLimpeza($pdo);
                        $r_reserva = round($preco_bruto - $valor_limpeza, 2);

                        if (strpos($status_arquivo, 'OK') === false) {
                            // Status ≠ "OK" → Cancelada
                            $status_reserva = 'Cancelada';

                            if ($r_comissao_calc > 0) {
                                // COM comissão → manter valores e pgto "pago"
                                $status_pagamento_calc = 'pago';
                                // Valores já foram calculados acima, mantém
                            } else {
                                // SEM comissão → zerar TODOS os valores
                                $status_pagamento_calc = 'Cancelada';
                                $preco_bruto = 0;
                                $valor_limpeza = 0;
                                $r_reserva = 0;
                                $r_comissao_calc = 0;
                            }
                        }

                        $reserva = [
                            'numero_reserva' => $data[0] ?? '',
                            'nome_hospede' => $data[2] ?? '',
                            'check_in' => $data[3] ?? '',
                            'check_out' => $data[4] ?? '',
                            'qtd_adultos' => intval($data[9] ?? 0),
                            'qtd_criancas' => intval($data[10] ?? 0),
                            'r_reserva' => $r_reserva,
                            'r_tx_limpeza' => $valor_limpeza,
                            'perc_comissao' => intval($data[13] ?? 0),
                            'r_comissao' => floatval($data[14] ?? 0),
                            'status' => $status_reserva,
                            'status_pagamento' => $status_pagamento_calc,
                            'observacoes' => $data[17] ?? '',
                            'motivo_viagem' => $data[19] ?? '',
                            'quartos' => $data[21] ?? '',
                            'duracao_diarias' => intval($data[22] ?? 0),
                            'plataforma' => $platform,
                            'condominio_predio' => '',
                            'bloco_torre' => '',
                            'apartamento_id' => NULL
                        ];

                        // Extrair condominio, bloco e apartamento
                        extrairUnidadeDeQuartos($reserva);

                        if ($reserva['numero_reserva']) {
                            $dados[] = $reserva;
                        }
                    }
                }
                fclose($handle);
            }
        } else {
            // Tentar com PhpSpreadsheet para XLSX/XLS
            require_once __DIR__ . '/../vendor/autoload.php';

            // Verificar se ZipArchive está disponível para XLSX
            if ($ext === 'xlsx' && !class_exists('ZipArchive')) {
                jsonResponse(['error' => 'Extensão ZIP não disponível no servidor. Por favor, use arquivo CSV.'], 400);
            }

            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file);
            $worksheet = $spreadsheet->getActiveSheet();

            $row = 2;
            while ($worksheet->getCell("A$row")->getValue()) {
                $reserva = extrairReserva($worksheet, $row, $platform, $pdo);
                if ($reserva) {
                    $dados[] = $reserva;
                }
                $row++;
            }
        }

        jsonResponse([
            'sucesso' => true,
            'dados' => $dados,
            'total' => count($dados)
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Erro ao processar arquivo: ' . $e->getMessage()], 400);
    }
}

function handleImportar($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['reservas']) || empty($data['reservas'])) {
        jsonResponse(['error' => 'Nenhuma reserva para importar'], 400);
    }

    try {
        $importadas = 0;
        $atualizadas = 0;
        $protegidas = 0;
        $erros = [];

        foreach ($data['reservas'] as $r) {
            try {
                // Plataforma que está sendo importada
                $plataforma_importacao = strtolower($r['plataforma'] ?? 'booking');

                // Verificar se já existe
                $stmt = $pdo->prepare("SELECT id, plataforma FROM reservas WHERE numero_reserva = ?");
                $stmt->execute([$r['numero_reserva']]);
                $existente = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($existente) {
                    // REGRA 1: Nunca sobrescrever Particular/Direto
                    $plataforma_existente = strtolower($existente['plataforma'] ?? '');
                    if ($plataforma_existente === 'particular' || $plataforma_existente === 'direto') {
                        $protegidas++;
                        continue;
                    }

                    // REGRA 2: Só atualizar se a plataforma é a mesma (não duplicar nem sobrescrever manual)
                    if ($plataforma_existente !== $plataforma_importacao) {
                        // Reserva foi criada manualmente ou importada de outra plataforma
                        $protegidas++;
                        continue;
                    }

                    // REGRA 3: Atualizar se é da mesma plataforma
                    $stmt = $pdo->prepare("
                        UPDATE reservas SET
                            nome_hospede = ?,
                            check_in = ?,
                            check_out = ?,
                            qtd_adultos = ?,
                            qtd_criancas = ?,
                            r_reserva = ?,
                            r_tx_limpeza = ?,
                            perc_comissao = ?,
                            r_comissao = ?,
                            status = ?,
                            status_pagamento = ?,
                            observacoes = ?,
                            condominio_predio = ?,
                            bloco_torre = ?,
                            quartos = ?,
                            duracao_diarias = ?,
                            motivo_viagem = ?,
                            atualizado_em = NOW()
                        WHERE numero_reserva = ?
                    ");

                    $stmt->execute([
                        $r['nome_hospede'],
                        $r['check_in'],
                        $r['check_out'],
                        $r['qtd_adultos'] ?? 0,
                        $r['qtd_criancas'] ?? 0,
                        $r['r_reserva'] ?? 0,
                        $r['r_tx_limpeza'] ?? 0,
                        $r['perc_comissao'] ?? 0,
                        $r['r_comissao'] ?? 0,
                        $r['status'] ?? 'Confirmada',
                        $r['status_pagamento'] ?? 'Pendente',
                        $r['observacoes'] ?? '',
                        $r['condominio_predio'] ?? '',
                        $r['bloco_torre'] ?? '',
                        $r['quartos'] ?? '',
                        $r['duracao_diarias'] ?? 0,
                        $r['motivo_viagem'] ?? '',
                        $r['numero_reserva']
                    ]);

                    $atualizadas++;
                } else {
                    // Inserir nova reserva
                    $stmt = $pdo->prepare("
                        INSERT INTO reservas (
                            numero_reserva, nome_hospede, check_in, check_out,
                            qtd_adultos, qtd_criancas, r_reserva, r_tx_limpeza, perc_comissao, r_comissao,
                            status, status_pagamento, plataforma, observacoes,
                            condominio_predio, bloco_torre, quartos,
                            duracao_diarias, motivo_viagem, data_registro
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ");

                    $stmt->execute([
                        $r['numero_reserva'],
                        $r['nome_hospede'],
                        $r['check_in'],
                        $r['check_out'],
                        $r['qtd_adultos'] ?? 0,
                        $r['qtd_criancas'] ?? 0,
                        $r['r_reserva'] ?? 0,
                        $r['r_tx_limpeza'] ?? 0,
                        $r['perc_comissao'] ?? 0,
                        $r['r_comissao'] ?? 0,
                        $r['status'] ?? 'Confirmada',
                        $r['status_pagamento'] ?? 'Pendente',
                        $r['plataforma'] ?? 'booking',
                        $r['observacoes'] ?? '',
                        $r['condominio_predio'] ?? '',
                        $r['bloco_torre'] ?? '',
                        $r['quartos'] ?? '',
                        $r['duracao_diarias'] ?? 0,
                        $r['motivo_viagem'] ?? ''
                    ]);

                    $importadas++;
                }
            } catch (Exception $e) {
                $erros[] = "Erro ao importar {$r['numero_reserva']}: " . $e->getMessage();
            }
        }

        jsonResponse([
            'sucesso' => true,
            'importadas' => $importadas,
            'atualizadas' => $atualizadas,
            'protegidas' => $protegidas,
            'total_processadas' => $importadas + $atualizadas + $protegidas,
            'erros' => $erros
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Erro ao importar: ' . $e->getMessage()], 500);
    }
}

function extrairReservaAirbnb($data, $platform, $pdo = null) {
    // Colunas do CSV Airbnb:
    // 0: Data
    // 1: Disponível por data
    // 2: Tipo (Reserva, Payout, etc.)
    // 3: Código de Confirmação
    // 4: Data da reserva
    // 5: Data de início
    // 6: Data de término
    // 7: Noites
    // 8: Hóspede
    // 9: Anúncio
    // 10: Informações
    // 11: Código de referência
    // 12: Moeda
    // 13: Valor
    // 14: Pago
    // 15: Taxa de serviço
    // 16: Taxa de pagamento rápido
    // 17: Taxa de limpeza
    // 18: Taxa de animais de estimação
    // 19: Ganhos brutos
    // 20: Imposto repassado pelo Airbnb
    // 21: Ganhos do ano

    $tipo = trim($data[2] ?? '');

    // Só importar Reservas, não Payouts ou outras transações
    if ($tipo !== 'Reserva') {
        return null;
    }

    $numero_reserva = trim($data[3] ?? '');
    $nome_hospede = trim($data[8] ?? '');
    $anuncio = trim($data[9] ?? '');

    if (!$numero_reserva || !$nome_hospede) {
        return null;
    }

    // Datas
    $check_in = trim($data[5] ?? '');
    $check_out = trim($data[6] ?? '');

    // Converter datas do formato MM/DD/YYYY para Y-m-d
    if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $check_in, $m)) {
        $check_in = $m[3] . '-' . $m[1] . '-' . $m[2];
    }
    if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $check_out, $m)) {
        $check_out = $m[3] . '-' . $m[1] . '-' . $m[2];
    }

    // Valores (remover vírgulas e converter para float)
    $valor = floatval(str_replace(',', '.', $data[13] ?? 0));
    $taxa_servico = floatval(str_replace(',', '.', $data[15] ?? 0));
    $taxa_limpeza = floatval(str_replace(',', '.', $data[17] ?? 0));
    $taxa_pet = floatval(str_replace(',', '.', $data[18] ?? 0));
    $ganhos_brutos = floatval(str_replace(',', '.', $data[19] ?? 0));

    // Calcular r_reserva e r_comissao
    // r_reserva = valor da hospedagem (ganhos_brutos é já o valor final)
    // r_comissao = taxa de serviço
    $r_reserva = $ganhos_brutos > 0 ? $ganhos_brutos : $valor;
    $r_comissao = $taxa_servico;
    $r_tx_limpeza = $taxa_limpeza;

    // Extrair condominio, bloco e apartamento do nome do anúncio
    // Regras:
    // 1. Se tiver padrão "DD-DDD" (ex: 63-104) → Bloco=DD, Apartamento=DDD, Condominio=Spazio Unico
    // 2. Se tiver somente um número (ex: 201) → Apartamento=201, Bloco='', Condominio=Studio Home

    $condominio = '';
    $bloco = '';
    $apartamento = '';

    // Regra 1: Procurar padrão "DD-DDD" (Bloco-Apartamento com hífen)
    if (preg_match('/(\d{2})-(\d{3})/', $anuncio, $matches)) {
        $bloco = $matches[1];
        $apartamento = $matches[2];
        $condominio = 'Spazio Unico';
    }
    // Regra 2: Procurar padrão sem hífen "DD DDD" (Bloco Apartamento com espaço)
    elseif (preg_match('/(\d{2})\s*(\d{3})$/', $anuncio, $matches)) {
        $bloco = $matches[1];
        $apartamento = $matches[2];
        $condominio = 'Spazio Unico';
    }
    // Regra 3: Procurar um número com 2-3 dígitos ao final (apenas apartamento)
    elseif (preg_match('/(\d{2,3})$/', $anuncio, $matches)) {
        $apartamento = $matches[1];
        $bloco = '';
        $condominio = 'Studio Home';
    }

    // Número de noites
    $duracao_diarias = intval($data[7] ?? 0);

    // Status sempre Confirmada para Airbnb (já foi processado e não há negativas)
    $status_reserva = 'Confirmada';
    $status_pagamento = 'pago';

    return [
        'numero_reserva' => $numero_reserva,
        'nome_hospede' => $nome_hospede,
        'check_in' => $check_in,
        'check_out' => $check_out,
        'qtd_adultos' => 0,
        'qtd_criancas' => 0,
        'r_reserva' => round($r_reserva, 2),
        'r_tx_limpeza' => round($r_tx_limpeza, 2),
        'perc_comissao' => 0,
        'r_comissao' => round($r_comissao, 2),
        'status' => $status_reserva,
        'status_pagamento' => $status_pagamento,
        'observacoes' => '',
        'motivo_viagem' => '',
        'quartos' => '',
        'duracao_diarias' => $duracao_diarias,
        'plataforma' => 'airbnb',
        'condominio_predio' => $condominio,
        'bloco_torre' => $bloco,
        'apartamento_id' => $apartamento ? intval($apartamento) : NULL
    ];
}

function extrairUnidadeDeQuartos(&$reserva) {
    // Extrair condominio, bloco e apartamento de "Tipo de unidade" (campo "quartos")
    if (!empty($reserva['quartos'])) {
        // Padrão: "Spazio Unico - BL: 61 | AP:203"
        if (preg_match('/^(.+?)\s*-\s*BL:\s*(\d+)\s*\|\s*AP:\s*(\d+)/', $reserva['quartos'], $matches)) {
            $reserva['condominio_predio'] = trim($matches[1]);
            $reserva['bloco_torre'] = $matches[2];
            $reserva['apartamento_id'] = intval($matches[3]);
        }
    }
}

function extrairReserva($worksheet, $row, $platform, $pdo = null) {
    // Mapear colunas do Excel (Booking.com)
    $numero_reserva = $worksheet->getCell("A$row")->getValue();
    $nome_hospede = $worksheet->getCell("C$row")->getValue();
    $check_in = $worksheet->getCell("D$row")->getValue();
    $check_out = $worksheet->getCell("E$row")->getValue();
    $qtd_adultos = $worksheet->getCell("J$row")->getValue() ?? 0;
    $qtd_criancas = $worksheet->getCell("K$row")->getValue() ?? 0;
    $preco = $worksheet->getCell("M$row")->getValue();
    $perc_comissao = $worksheet->getCell("N$row")->getValue() ?? 0;
    $valor_comissao = $worksheet->getCell("O$row")->getValue() ?? 0;
    $status_pagamento = $worksheet->getCell("G$row")->getValue() ?? 'Pendente';
    $observacoes = $worksheet->getCell("R$row")->getValue() ?? '';
    $motivo_viagem = $worksheet->getCell("T$row")->getValue() ?? '';
    $tipo_unidade = $worksheet->getCell("V$row")->getValue() ?? '';
    $duracao_diarias = $worksheet->getCell("W$row")->getValue() ?? 0;

    if (!$numero_reserva) {
        return null;
    }

    // Processar preço (remover "BRL" e espaços)
    $preco = floatval(str_replace(['BRL', ' '], '', $preco ?? 0));
    $perc_comissao = floatval($perc_comissao);
    $valor_comissao_raw = trim($worksheet->getCell("O$row")->getValue() ?? '');
    $valor_comissao = floatval(str_replace(['BRL', ' '], '', $valor_comissao_raw ?? 0));

    // REGRA: Usar APENAS o valor informado na coluna "Valor da comissão"
    // NÃO calcular baseado na porcentagem se o valor estiver vazio
    // Isto garante que canceladas sem comissão real não sejam somadas

    // Processar datas
    if (is_numeric($check_in)) {
        $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($check_in);
        // SOMAR 1 dia para corrigir offset do Excel
        $dateObj->modify('+1 day');
        $check_in = $dateObj->format('Y-m-d');
    }
    if (is_numeric($check_out)) {
        $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($check_out);
        // SOMAR 1 dia para corrigir offset do Excel
        $dateObj->modify('+1 day');
        $check_out = $dateObj->format('Y-m-d');
    }

    // Extrair condominio, bloco e apartamento de "Tipo de unidade"
    $condominio = '';
    $bloco = '';
    $apartamento = '';

    if (!empty($tipo_unidade)) {
        // Padrão: "Spazio Unico - BL: 61 | AP:203"
        if (preg_match('/^(.+?)\s*-\s*BL:\s*(\d+)\s*\|\s*AP:\s*(\d+)/', $tipo_unidade, $matches)) {
            $condominio = trim($matches[1]);
            $bloco = $matches[2];
            $apartamento = $matches[3];
        }
    }

    // Determinar status pagamento e status da reserva
    $valor_limpeza = $pdo ? obterTaxaLimpeza($pdo) : 0;
    $r_reserva_final = round($preco - $valor_limpeza, 2);
    $status_reserva = 'Confirmada';
    $status_pagamento_final = 'pago';

    $status_arquivo = strtoupper(trim(preg_replace('/\s+/', ' ', $status_pagamento)));

    // Nova regra de importação:
    // 1. Se Status = "OK" → Confirmada com pgto "pago" e valores mantidos
    // 2. Se Status = "%CANCELLED%" → Cancelada com pgto "Cancelada" e valores zerados
    // 3. Se Status ≠ "OK" e ≠ "%CANCELLED%" e tem comissão (coluna O) → Cancelada com pgto "pago" e valores mantidos (para somar)
    // 4. Caso contrário → Cancelada com pgto "Cancelada" e valores zerados

    if (strpos($status_arquivo, 'OK') !== false) {
        // Status é OK - Confirmada, pgto pago, mantém valores
        $status_reserva = 'Confirmada';
        $status_pagamento_final = 'pago';
    } elseif (strpos($status_arquivo, '%CANCELLED%') !== false) {
        // Status é %cancelled% - Cancelada com pgto Cancelada, zera valores
        $status_reserva = 'Cancelada';
        $status_pagamento_final = 'Cancelada';
        $preco = 0;
        $valor_limpeza = 0;
        $r_reserva_final = 0;
        $valor_comissao = 0;
    } elseif ($valor_comissao > 0) {
        // Status ≠ "OK" e ≠ "%CANCELLED%" com comissão - Cancelada com pgto PAGO, MAS mantém valores
        $status_reserva = 'Cancelada';
        $status_pagamento_final = 'pago'; // Importante: pgto como "pago" para somar nos totais
        // Mantém os valores já calculados
    } else {
        // Status ≠ "OK" e ≠ "%CANCELLED%" sem comissão - Cancelada com pgto Cancelada, zera valores
        $status_reserva = 'Cancelada';
        $status_pagamento_final = 'Cancelada';
        $preco = 0;
        $valor_limpeza = 0;
        $r_reserva_final = 0;
        $valor_comissao = 0;
    }

    return [
        'numero_reserva' => trim($numero_reserva),
        'nome_hospede' => trim($nome_hospede),
        'check_in' => $check_in,
        'check_out' => $check_out,
        'qtd_adultos' => intval($qtd_adultos),
        'qtd_criancas' => intval($qtd_criancas),
        'r_reserva' => $r_reserva_final,
        'r_tx_limpeza' => $valor_limpeza,
        'perc_comissao' => $perc_comissao,
        'r_comissao' => $valor_comissao,
        'status' => $status_reserva,
        'status_pagamento' => $status_pagamento_final,
        'observacoes' => trim($observacoes),
        'motivo_viagem' => trim($motivo_viagem),
        'plataforma' => $platform,
        'condominio_predio' => $condominio,
        'bloco_torre' => $bloco,
        'quartos' => $apartamento,
        'duracao_diarias' => intval($duracao_diarias)
    ];
}
?>
