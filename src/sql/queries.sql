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

-- Buscar todas as casas de apostas que o Pedro Tavares de Melo tem conta e o saldo em cada uma
SELECT casa_de_aposta.nome, usuario.nome, usuario.sobrenome, clientes.saldo
FROM clientes
JOIN casa_de_aposta ON clientes.id_casa_aposta = casa_de_aposta.id_casa_aposta
JOIN usuario ON clientes.id_usuario_apostador = usuario.id_usuario
WHERE usuario.nome = 'Pedro' AND usuario.sobrenome = 'Tavares de Melo'
ORDER BY clientes.saldo DESC;

-- Buscar o valor total que Pedro Tavares de Melo possui entre todas as casas que ele tem conta
SELECT SUM(clientes.saldo)
FROM clientes
JOIN usuario ON clientes.id_usuario_apostador = usuario.id_usuario
WHERE usuario.nome = 'Pedro' AND usuario.sobrenome = 'Tavares de Melo';

-- Buscar o nome e a data de criação de todas as casas de aposta gerenciadas por Tiao da Silva
SELECT casa_de_aposta.nome, casa_de_aposta.data_criacao
FROM gerencia
JOIN casa_de_aposta ON gerencia.id_casa_aposta = casa_de_aposta.id_casa_aposta
JOIN usuario ON gerencia.id_usuario_administrador = usuario.id_usuario
WHERE usuario.nome = 'Tiao' AND usuario.sobrenome = 'da Silva';

-- Buscar o valor total de dinheiro das casas de aposta administradas por Ana Silva Galvao
SELECT SUM(clientes.saldo)
FROM gerencia
JOIN casa_de_aposta ON gerencia.id_casa_aposta = casa_de_aposta.id_casa_aposta
JOIN usuario ON gerencia.id_usuario_administrador = usuario.id_usuario
JOIN clientes ON clientes.id_casa_aposta = casa_de_aposta.id_casa_aposta
WHERE usuario.nome = 'Ana' AND usuario.sobrenome = 'Silva Galvao';

-- Buscar o nome, sobrenome e saldo de todos os usuários que possuem saldo negativo na casa Seu azar, nossa aleg
SELECT usuario.nome, usuario.sobrenome, clientes.saldo
FROM casa_de_aposta
JOIN clientes ON casa_de_aposta.id_casa_aposta = clientes.id_casa_aposta
JOIN usuario ON clientes.id_usuario_apostador = usuario.id_usuario
WHERE casa_de_aposta.nome = 'Seu azar, nossa aleg' AND clientes.saldo < 0
ORDER BY clientes.saldo DESC;

-- Buscar o nome de todos os usuários que venceram na aposta do jogo Grêmio x Internacional
SELECT usuario.nome, usuario.sobrenome, casa_de_aposta.nome, bilhete_tem_aposta.odd
FROM aposta
JOIN bilhete_tem_aposta ON aposta.id_aposta = bilhete_tem_aposta.id_aposta
JOIN bilhete ON bilhete_tem_aposta.id_bilhete = bilhete.id_bilhete
JOIN usuario ON bilhete.id_usuario_apostador = usuario.id_usuario
JOIN casa_de_aposta ON aposta.id_casa_aposta = casa_de_aposta.id_casa_aposta
JOIN resultado ON resultado.id_jogo = aposta.id_jogo
JOIN jogo ON jogo.id_jogo = resultado.id_jogo
WHERE bilhete_tem_aposta.resultado = 1 AND jogo.time_casa = 'Gremio' AND jogo.time_fora = 'Internacional';

-- Buscar o nome de cada time, a odd, o valor apostado, a casa de aposta de todas as apostas do usuario Joao Freitas Cavalin
SELECT casa_de_aposta.nome, bilhete.data, bilhete_tem_aposta.odd, jogo.time_casa, jogo.time_fora
FROM bilhete_tem_aposta
JOIN bilhete ON bilhete_tem_aposta.id_bilhete = bilhete.id_bilhete
JOIN usuario ON usuario.id_usuario = bilhete.id_usuario_apostador
JOIN aposta ON aposta.id_aposta = bilhete_tem_aposta.id_aposta
JOIN casa_de_aposta ON casa_de_aposta.id_casa_aposta = aposta.id_casa_aposta
JOIN jogo ON aposta.id_jogo = jogo.id_jogo
WHERE usuario.nome = 'Joao' AND usuario.sobrenome = 'Freitas Cavalin';

-- Média de valor apostado no jogo Real Madrid vs. Palmeiras contando todos os tipos de apostas
SELECT AVG(bilhete_tem_aposta.valor_apostado)
FROM bilhete_tem_aposta
JOIN aposta ON bilhete_tem_aposta.id_aposta = aposta.id_aposta
JOIN jogo ON jogo.id_jogo = aposta.id_jogo
WHERE jogo.time_casa = 'Real Madrid' AND jogo.time_fora = 'Palmeiras';
