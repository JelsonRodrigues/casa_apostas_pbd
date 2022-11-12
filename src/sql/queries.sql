-- Buscar os usuários que são clientes de casas de apostas
SELECT DISTINCT NOME, SOBRENOME
FROM USUARIO
JOIN CLIENTES ON ID_USUARIO = ID_USUARIO_APOSTADOR;

-- Buscar o nome, sobrenome e saldo dos clientes da casa de aposta 'BetFair'
SELECT casa_de_aposta.nome, usuario.nome, usuario.sobrenome, clientes.saldo
FROM usuario
JOIN clientes ON id_usuario = id_usuario_apostador
JOIN casa_de_aposta ON clientes.id_casa_aposta = casa_de_aposta.id_casa_aposta
WHERE casa_de_aposta.nome = 'BetFair'
ORDER BY usuario.nome ASC;