INSERT INTO CASA_DE_APOSTA (NOME, CNPJ, DATA_CRIACAO, ENDERECO, TELEFONE)
VALUES 
('Apostas do Ze', '00.111.222/3333-44', '2011-01-16', 'Beco da esquina, 01 - Pelotas', '32529999'),
('BetFair', '11.111.111/1111-11', '2001-05-09', 'Avenida Brasil, 150 - Sao Paulo', '5181529999'),
('Perca Conosco', '22.333.444/5555-00', '2021-06-09', 'Marechal Deodoro, 303 - Porto Alegre', '56888565499'),
('Seu azar, nossa aleg', '66.666.444/6666-00', '1969-04-29', 'Alameda central, 1001 - Brasilia', '51984452631');


INSERT INTO USUARIO (NOME, SOBRENOME, DATA_NASCIMENTO, ENDERECO, TELEFONE, SENHA, EMAIL, CPF, TIPO)
VALUES
('Joao', 'Freitas Cavalin', '1983-11-03', 'Rua Jose Boaventura, 163', '51 996221517', 'root', 'joaocavalin83@outlook.com', '04635966601', 0),
('Ana', 'Silva Galvao', '2000-03-28', 'Estrada do Rincao, N/A', '51 999431477', 'root', 'asilvagalvao@gmail.com', '35235446051', 1),
('Jose', 'Bouvier Amado', '1971-09-11', 'Beco da esquina, 01 - Pelotas', '32529999', 'root', 'joseapostas@hotmail.com', '03615936523', 1),
('Paula', 'Alves da Silva', '1963-01-06', 'Avenida Brasil, 150 - Sao Paulo', '5181529999', 'root', 'alvespaula06@outlook.com', '15036255599', 1),
('Robin', 'Charles Scherbatsky', '1980-07-23', 'Apartment near Central Park', '555 49322151', 'root', 'robertscherbatsky@gmail.com', '00000000000', 0),
('Rachel Karen', 'Green', '1974-05-18', 'New York City, 333', '55 99865321', 'root', 'rachelgreen@outlook.com', '94638063401', 0),
('Tiao', 'da Silva', '1999-12-25', 'Alameda central, 1001 - Brasilia', '11 981362594', 'root', 'tiaoinvencoes1999@yahoo.com', '35261523501', 1),
('Pedro', 'Tavares de Melo', '1993-04-11', 'Apple Park, 105', '555 333156', 'root', 'joaocavalin83@outlook.com', '35692619905', 0);


INSERT INTO GERENCIA (ID_USUARIO_ADMINISTRADOR, ID_CASA_APOSTA)
VALUES
(3, 1),
(2, 2),
(7, 3),
(7, 4);


INSERT INTO CLIENTES (ID_CASA_APOSTA, ID_USUARIO_APOSTADOR, SALDO)
VALUES
(2, 1, 1000.0),
(1, 5, 318.58),
(3, 6, 639.15),
(4, 8, 1204.0),
(3, 8, 2633.0),
(2, 6, 58355.22),
(4, 5, -150.15);


INSERT INTO BILHETE (DATA, STATUS, ID_USUARIO_APOSTADOR) 
VALUES
('15-02-2022', 0, 5),
('15-02-2022', 1, 1),
('15-02-2022', 1, 6),
('15-02-2022', 1, 8),
('03-03-2022', 0, 8),
('19-01-2022', 0, 1),
('01-03-2022', 0, 5);


INSERT INTO JOGO (TIME_CASA, TIME_FORA, DATA_INICIO, DATA_FIM) 
VALUES
('Gremio', 'Internacional', '16-02-2022 16:00:00', '16-02-2022 18:00:00'),
('Flamengo', 'Vasco', '10-03-2022 16:00:00', '10-03-2022 18:00:00'),
('Real Madrid', 'Palmeiras', '25-01-2022 21:00:00', '25-01-2022 23:00:00');


INSERT INTO RESULTADO (ID_JOGO, GOLS_TIME_CASA, GOLS_TIME_FORA, TOTAL_ESCANTEIOS)
VALUES
(1, 2, 1, 12),
(3, 1, 3, 10);


INSERT INTO APOSTA (ODD, TIPO, ID_JOGO, ID_CASA_APOSTA)
VALUES
(15.6, 0, 1, 1),
(3.6, 2, 1, 1),
(7.6, 1, 1, 2),
(9.0, 1, 1, 4),
(1.45, 1, 3, 1),
(1.36, 1, 3, 2),
(1.59, 1, 2, 3),
(1.05, 0, 2, 3);


INSERT INTO RESULTADO_FINAL (ID_APOSTA, RESULTADO_FINAL)
VALUES
(1, 'FORA'),
(8, 'CASA');


INSERT INTO NUMERO_ESCANTEIOS (ID_APOSTA, TIPO, NUMERO)
VALUES
(3, 0, 12),
(4, 1, 10),
(5, 2, 15),
(6, 0, 9),
(7, 1, 13);


INSERT INTO NUMERO_GOLS (ID_APOSTA, TIPO, NUMERO)
VALUES 
(2, 1, 1);


INSERT INTO BILHETE_TEM_APOSTA (ID_BILHETE, ID_APOSTA, ODD, VALOR_APOSTADO, STATUS, RESULTADO)
VALUES
(1, 1, 12.0, 300.0, 0, NULL),
(2, 2, 5.6, 130.0, 1, 1),
(3, 2, 5.6, 600.0, 1, 0),
(4, 2, 5.6, 255.0, 1, 0),
(5, 2, 5.6, 15.0, 1, 1),
(6, 3, 2.3, 300.0, 0, NULL),
(7, 5, 4.9, 130.0, 1, 0),
(3, 3, 2.5, 600.0, 1, 0),
(4, 4, 5.0, 255.0, 1, 1),
(2, 4, 5.0, 151.0, 1, 1);
