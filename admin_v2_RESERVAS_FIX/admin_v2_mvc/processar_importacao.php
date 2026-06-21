<?php
// VERSÃƒO 5 - COM PROTEÃ‡ÃƒO DE EDIÃ‡Ã•ES MANUAIS
// MantÃ©m mapeamento correto do Booking.com + proteÃ§Ã£o automÃ¡tica

error_reporting(E_ALL);
ini_set('display_errors', 0);

// Capturar qualquer saÃ­da
ob_start();

// Incluir banco
try {
    require_once __DIR__ . '/../db_config.php';
} catch (Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json');
    die(json_encode(['success' => false, 'mensagem' => 'Erro DB: ' . $e->getMessage()]));
}

// Limpar buffer
ob_end_clean();

// Header JSON
header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'mensagem' => '', 'importadas' => 0, 'atualizadas' => 0, 'preservadas' => 0, 'erros' => 0, 'detalhes' => []];
$debugInfo = [];

try {
    
    // Verificar arquivo
    if (!isset($_FILES['arquivo'])) {
        $response['mensagem'] = 'Nenhum arquivo enviado';
        echo json_encode($response);
        exit;
    }
    
    $arquivo = $_FILES['arquivo']['tmp_name'];
    $nomeArquivo = $_FILES['arquivo']['name'];
    
    // Verificar se Ã© Excel
    $ext = strtolower(pathinfo($nomeArquivo, PATHINFO_EXTENSION));
    if (in_array($ext, ['xls', 'xlsx'])) {
        $response['mensagem'] = 'ðŸ“‹ Converta o Excel para TXT primeiro';
        $response['detalhes'] = ['Abra o Excel â†’ Salvar Como â†’ Texto (separado por tabulaÃ§Ã£o)'];
        echo json_encode($response);
        exit;
    }
    
    // Ler arquivo
    $handle = fopen($arquivo, 'r');
    if (!$handle) {
        $response['mensagem'] = 'Erro ao abrir arquivo';
        echo json_encode($response);
        exit;
    }
    
    $linhas = [];
    while (($linha = fgetcsv($handle, 10000, "\t")) !== FALSE) {
        $linhas[] = $linha;
    }
    fclose($handle);
    
    if (count($linhas) < 2) {
        $response['mensagem'] = 'Arquivo vazio ou invÃ¡lido';
        echo json_encode($response);
        exit;
    }
    
    // Processar
    $cabecalho = array_shift($linhas);
    $importadas = 0;
    $atualizadas = 0;
    $preservadas = 0;
    $erros = 0;
    $errosLista = [];
    
    // DEBUG
    $debugInfo[] = 'Total de linhas: ' . count($linhas);
    $debugInfo[] = 'Total de colunas: ' . count($cabecalho);
    
    foreach ($linhas as $i => $linha) {
        $num = $i + 2;
        
        try {
            // ============ MAPEAMENTO CORRETO DAS COLUNAS ============
            // Col 0: NÃºmero da reserva
            $numero_reserva = trim($linha[0] ?? '');
            
            // Col 1: Reservado por
            $reservado_por = trim($linha[1] ?? '');
            
            // Col 2: Nome(s) do(s) hÃ³spede(s)
            $nomes_hospedes = trim($linha[2] ?? '');
            $nome_hospede = $nomes_hospedes;
            
            // Col 3: Entrada
            $check_in = trim($linha[3] ?? '');
            $data_entrada = $check_in;
            
            // Col 4: SaÃ­da
            $check_out = trim($linha[4] ?? '');
            $data_saida = $check_out;
            
            // Col 5: Reservado em
            $reservado_em = trim($linha[5] ?? '');
            
            // Col 6: Status
            $status_raw = strtolower(trim($linha[6] ?? 'ok'));
            $status = mapearStatus($status_raw);
            
            // Col 7: Quartos
            $quartos = trim($linha[7] ?? '');
            $tipo_unidade = trim($linha[7] ?? '');
            
            // Col 8: Pessoas
            $pessoas = extrairNumero($linha[8] ?? '0');
            
            // Col 9: Adultos
            $qtd_adultos = extrairNumero($linha[9] ?? '0');
            $adultos = $qtd_adultos;
            
            // Col 10: CrianÃ§as
            $qtd_criancas = extrairNumero($linha[10] ?? '0');
            $criancas = $qtd_criancas;
            
            // Col 11: Idade das crianÃ§as
            $idade_criancas = trim($linha[11] ?? '');
            
            // Col 12: PreÃ§o
            $r_reserva = limparValor($linha[12] ?? '0');
            $preco = $r_reserva;
            
            // Col 13: ComissÃ£o %
            $perc_comissao = limparValor($linha[13] ?? '0');
            $comissao_percentual = $perc_comissao;
            
            // Col 14: Valor da comissÃ£o
            $r_comissao = limparValor($linha[14] ?? '0');
            $valor_comissao = $r_comissao;
            
            // Col 15: Status do pagamento
            $status_pagamento = mapearStatusPagamento($linha[15] ?? '');
            
            // Col 16: Forma de pagamento (provedor de pagamento)
            $forma_pagamento = mapearFormaPagamento($linha[16] ?? '');
            $provedor_pagamento = trim($linha[16] ?? '') ?: 'Booking.com';
            
            // Col 17: ObservaÃ§Ãµes
            $observacoes = trim($linha[17] ?? '');
            
            // Col 18: Grupo de usuÃ¡rios
            $grupo_usuarios = trim($linha[18] ?? '');
            
            // Col 19: Booker country
            $booker_country = trim($linha[19] ?? '') ?: 'N/A';
            
            // Col 20: Motivo da viagem
            $motivo_viagem = mapearMotivoViagem($linha[20] ?? '');
            
            // Col 21: Dispositivo
            $dispositivo = mapearDispositivo($linha[21] ?? '');
            
            // Col 22: Tipo de unidade (redundante - jÃ¡ temos)
            // Ignorar
            
            // Col 23: DuraÃ§Ã£o (diÃ¡rias)
            $duracao_diarias = extrairNumero($linha[23] ?? '0');
            
            // Col 24: Data de cancelamento
            $data_cancelamento = NULL;
            $data_canc_raw = trim($linha[24] ?? '');
            if (!empty($data_canc_raw)) {
                $data_cancelamento = converterData($data_canc_raw);
            }
            
            // Col 25: EndereÃ§o
            $endereco = trim($linha[25] ?? '');
            
            // Col 26: Telefone
            $telefone = trim($linha[26] ?? '');
            
            // Validar campos obrigatÃ³rios
            if (empty($numero_reserva) || empty($check_in) || empty($check_out)) {
                continue;
            }
            
            // Converter datas
            $check_in = converterData($check_in);
            $check_out = converterData($check_out);
            $data_entrada = $check_in;
            $data_saida = $check_out;
            
            if (!$check_in || !$check_out) {
                $errosLista[] = "Linha {$num}: data invÃ¡lida";
                $erros++;
                continue;
            }
            
            // Campos calculados
            $mes_ano = date('Y-m', strtotime($check_in));
            $plataforma = 'Booking.com';
            
            if ($pessoas == 0) {
                $pessoas = $qtd_adultos + $qtd_criancas;
            }
            
            // Converter reservado_em
            if (!empty($reservado_em)) {
                $reservado_em_obj = converterData($reservado_em);
                if ($reservado_em_obj) {
                    $reservado_em = $reservado_em_obj . ' ' . date('H:i:s');
                } else {
                    $reservado_em = NULL;
                }
            } else {
                $reservado_em = NULL;
            }
            
            // Campos nÃ£o presentes no arquivo (definir como 0)
            $r_tx_limpeza = 0;
            $valor_limpeza = 0;
            $r_tx_pet = 0;
            $valor_tx_pet = 0;
            $r_outros_desc = 0;
            $outros_desconto = 0;
            
            // PolÃ­tica de cancelamento
            $politica_cancelamento = mapearPoliticaCancelamento($status_raw);
            
            // ============ VERIFICAR PROTEÃ‡ÃƒO DE EDIÃ‡Ã•ES ============
            $stmt = $pdo->prepare('SELECT id, atualizado_em, data_registro FROM reservas WHERE numero_reserva = ?');
            $stmt->execute([$numero_reserva]);
            $reserva_existe = $stmt->fetch();
            
            if ($reserva_existe) {
                // Comparar timestamps - PROTEÃ‡ÃƒO DE EDIÃ‡Ã•ES
                try {
                    $data_registro = new DateTime($reserva_existe['data_registro']);
                    $atualizado_em = new DateTime($reserva_existe['atualizado_em']);
                    
                    // Se foi atualizada APÃ“S a criaÃ§Ã£o, foi editada manualmente
                    $foi_editada_manualmente = $atualizado_em > $data_registro;
                } catch (Exception $e) {
                    // Se houver erro com datas, considerar como nÃ£o editada
                    $foi_editada_manualmente = false;
                }
                
                if ($foi_editada_manualmente) {
                    // PULAR - PRESERVAR EDIÃ‡ÃƒO
                    $preservadas++;
                    continue;
                }
                
                // ATUALIZAR
                $sql = 'UPDATE reservas SET 
                    reservado_por=?, nomes_hospedes=?, nome_hospede=?, 
                    telefone=?, endereco=?, booker_country=?,
                    check_in=?, data_entrada=?, check_out=?, data_saida=?, 
                    mes_ano=?, duracao_diarias=?,
                    quartos=?, tipo_unidade=?, pessoas=?,
                    qtd_adultos=?, adultos=?, qtd_criancas=?, criancas=?,
                    idade_criancas=?,
                    plataforma=?, status=?, status_pagamento=?, data_cancelamento=?,
                    r_reserva=?, preco=?, r_comissao=?, valor_comissao=?, 
                    comissao_percentual=?, perc_comissao=?,
                    r_tx_limpeza=?, valor_limpeza=?, 
                    r_tx_pet=?, valor_tx_pet=?, 
                    r_outros_desc=?, outros_desconto=?,
                    forma_pagamento=?, provedor_pagamento=?, 
                    politica_cancelamento=?,
                    motivo_viagem=?, dispositivo=?, grupo_usuarios=?,
                    observacoes=?, reservado_em=?,
                    atualizado_em=NOW() 
                    WHERE numero_reserva=?';
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $reservado_por, $nomes_hospedes, $nome_hospede,
                    $telefone, $endereco, $booker_country,
                    $check_in, $data_entrada, $check_out, $data_saida,
                    $mes_ano, $duracao_diarias,
                    $quartos, $tipo_unidade, $pessoas,
                    $qtd_adultos, $adultos, $qtd_criancas, $criancas,
                    $idade_criancas,
                    $plataforma, $status, $status_pagamento, $data_cancelamento,
                    $r_reserva, $preco, $r_comissao, $valor_comissao,
                    $comissao_percentual, $perc_comissao,
                    $r_tx_limpeza, $valor_limpeza,
                    $r_tx_pet, $valor_tx_pet,
                    $r_outros_desc, $outros_desconto,
                    $forma_pagamento, $provedor_pagamento,
                    $politica_cancelamento,
                    $motivo_viagem, $dispositivo, $grupo_usuarios,
                    $observacoes, $reservado_em,
                    $numero_reserva
                ]);
                
                $atualizadas++;
            } else {
                // INSERIR
                $sql = 'INSERT INTO reservas (
                    numero_reserva, reservado_por, nomes_hospedes, nome_hospede,
                    telefone, endereco, booker_country,
                    check_in, data_entrada, check_out, data_saida,
                    mes_ano, duracao_diarias,
                    quartos, tipo_unidade, pessoas,
                    qtd_adultos, adultos, qtd_criancas, criancas,
                    idade_criancas,
                    plataforma, status, status_pagamento, data_cancelamento,
                    r_reserva, preco, r_comissao, valor_comissao,
                    comissao_percentual, perc_comissao,
                    r_tx_limpeza, valor_limpeza,
                    r_tx_pet, valor_tx_pet,
                    r_outros_desc, outros_desconto,
                    forma_pagamento, provedor_pagamento,
                    politica_cancelamento,
                    motivo_viagem, dispositivo, grupo_usuarios,
                    observacoes, reservado_em,
                    data_registro, atualizado_em
                ) VALUES (
                    ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW()
                )';
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $numero_reserva, $reservado_por, $nomes_hospedes, $nome_hospede,
                    $telefone, $endereco, $booker_country,
                    $check_in, $data_entrada, $check_out, $data_saida,
                    $mes_ano, $duracao_diarias,
                    $quartos, $tipo_unidade, $pessoas,
                    $qtd_adultos, $adultos, $qtd_criancas, $criancas,
                    $idade_criancas,
                    $plataforma, $status, $status_pagamento, $data_cancelamento,
                    $r_reserva, $preco, $r_comissao, $valor_comissao,
                    $comissao_percentual, $perc_comissao,
                    $r_tx_limpeza, $valor_limpeza,
                    $r_tx_pet, $valor_tx_pet,
                    $r_outros_desc, $outros_desconto,
                    $forma_pagamento, $provedor_pagamento,
                    $politica_cancelamento,
                    $motivo_viagem, $dispositivo, $grupo_usuarios,
                    $observacoes, $reservado_em
                ]);
                
                $importadas++;
            }
            
        } catch (Exception $e) {
            $errosLista[] = "Linha {$num}: " . $e->getMessage();
            $erros++;
        }
    }
    
    $response['success'] = true;
    $response['importadas'] = $importadas;
    $response['atualizadas'] = $atualizadas;
    $response['preservadas'] = $preservadas;
    $response['erros'] = $erros;
    
    $response['mensagem'] = "âœ… ImportaÃ§Ã£o ConcluÃ­da! ";
    $response['mensagem'] .= "$importadas inseridas | $atualizadas atualizadas | $preservadas preservadas";
    
    if ($erros > 0) {
        $response['mensagem'] .= " | âš ï¸ $erros erros";
        $response['detalhes'] = array_slice($errosLista, 0, 10);
    }
    
} catch (Exception $e) {
    $response['mensagem'] = 'âŒ Erro: ' . $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

// ============ FUNÃ‡Ã•ES ============

function converterData($data) {
    $data = trim($data);
    if (empty($data)) return false;
    
    $formatos = ['Y-m-d', 'd-m-Y', 'd/m/Y', 'Y/m/d', 'm/d/Y', 'Y-m-d H:i:s'];
    
    foreach ($formatos as $fmt) {
        $dt = DateTime::createFromFormat($fmt, $data);
        if ($dt && $dt->format('Y') >= 2000 && $dt->format('Y') <= 2100) {
            return $dt->format('Y-m-d');
        }
    }
    
    $ts = strtotime($data);
    if ($ts && $ts > 946684800) {
        return date('Y-m-d', $ts);
    }
    
    return false;
}

function mapearStatus($status) {
    if ($status === 'ok') return 'Confirmada';
    if ($status === 'no_show') return 'Sem show';
    if (strpos($status, 'cancel') !== false) return 'Cancelada';
    return 'Pendente';
}

function mapearStatusPagamento($status) {
    $status = strtolower(trim($status));
    if (strpos($status, 'pago') !== false || strpos($status, 'on-line') !== false) return 'Pago';
    if (strpos($status, 'pendente') !== false) return 'Pendente';
    return 'Pendente';
}

function mapearFormaPagamento($forma) {
    return 'Outro';
}

function mapearPoliticaCancelamento($status) {
    if (strpos($status, 'cancel') !== false) return 'Cancelada';
    return 'ReembolsÃ¡vel';
}

function mapearMotivoViagem($motivo) {
    $motivo = strtolower(trim($motivo));
    if (empty($motivo)) return 'Lazer';
    if (strpos($motivo, 'negÃ³cios') !== false) return 'NegÃ³cios';
    if (strpos($motivo, 'lazer') !== false) return 'Lazer';
    return 'Lazer';
}

function mapearDispositivo($dispositivo) {
    $dispositivo = strtolower(trim($dispositivo));
    if (strpos($dispositivo, 'celular') !== false) return 'Mobile';
    if (strpos($dispositivo, 'computador') !== false) return 'Desktop';
    if (strpos($dispositivo, 'tablet') !== false) return 'Tablet';
    return 'Desktop';
}

function extrairNumero($texto) {
    preg_match('/(\d+)/', $texto, $m);
    return intval($m[1] ?? 0);
}

function limparValor($valor) {
    $valor = preg_replace('/[^0-9,.\-]/', '', $valor);
    $valor = str_replace(',', '.', $valor);
    return floatval($valor);
}
?>