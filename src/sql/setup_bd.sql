CREATE TABLE CASA_DE_APOSTA (
    ID_CASA_APOSTA  SMALLSERIAL PRIMARY KEY,
    NOME            VARCHAR(20) NOT NULL,
    CNPJ            CHAR(18) UNIQUE NOT NULL,
    DATA_CRIACAO    TIMESTAMP NOT NULL,
    ENDERECO        VARCHAR(100),
    TELEFONE        VARCHAR(15)
);

CREATE TABLE USUARIO (
    ID_USUARIO      SMALLSERIAL PRIMARY KEY,
    NOME            VARCHAR(15) NOT NULL,
    SOBRENOME       VARCHAR(30) NOT NULL,
    DATA_NASCIMENTO TIMESTAMP NOT NULL,
    ENDERECO        VARCHAR(100),
    TELEFONE        VARCHAR(15),
    SENHA           VARCHAR(88) NOT NULL,
    EMAIL           VARCHAR(50) NOT NULL,
    CPF             VARCHAR(11) UNIQUE NOT NULL,
    TIPO            SMALLINT NOT NULL,

    CONSTRAINT check_usuario_tipo CHECK (TIPO IN (0, 1))
);

CREATE TABLE GERENCIA (
    ID_USUARIO_ADMINISTRADOR    SMALLINT,
    ID_CASA_APOSTA              SMALLINT,

    CONSTRAINT pk_gerencia PRIMARY KEY (ID_USUARIO_ADMINISTRADOR, ID_CASA_APOSTA),
    CONSTRAINT fk_gerencia_administrador FOREIGN KEY (ID_USUARIO_ADMINISTRADOR) REFERENCES USUARIO (ID_USUARIO)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_gerencia_casa FOREIGN KEY (ID_CASA_APOSTA) REFERENCES CASA_DE_APOSTA (ID_CASA_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE CLIENTES (
    ID_CASA_APOSTA          SMALLINT,
    ID_USUARIO_APOSTADOR    SMALLINT,
    SALDO                   DECIMAL (10,2)  NOT NULL,

    CONSTRAINT pk_clientes PRIMARY KEY (ID_CASA_APOSTA, ID_USUARIO_APOSTADOR),
    CONSTRAINT fk_clientes_usuario FOREIGN KEY (ID_USUARIO_APOSTADOR) REFERENCES USUARIO (ID_USUARIO)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_clientes_casa FOREIGN KEY (ID_CASA_APOSTA) REFERENCES CASA_DE_APOSTA (ID_CASA_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE BILHETE (
    ID_BILHETE              SMALLSERIAL PRIMARY KEY,
    DATA                    TIMESTAMP NOT NULL DEFAULT NOW()::TIMESTAMP,
    STATUS                  SMALLINT NOT NULL DEFAULT 0,
    ID_USUARIO_APOSTADOR    SMALLINT NOT NULL,

    CONSTRAINT check_bilhete_status CHECK (STATUS IN (0, 1, 2)),
    CONSTRAINT fk_bilhete_usuario FOREIGN KEY (ID_USUARIO_APOSTADOR) REFERENCES USUARIO (ID_USUARIO)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE JOGO (
    ID_JOGO                 SMALLSERIAL PRIMARY KEY,
    TIME_CASA               VARCHAR(30) NOT NULL,
    TIME_FORA               VARCHAR(30) NOT NULL,
    DATA_INICIO             TIMESTAMP NOT NULL,
    DATA_FIM                TIMESTAMP NOT NULL,

    CONSTRAINT check_jogo_datas CHECK (DATA_INICIO <= DATA_FIM),
    CONSTRAINT check_jogo_times CHECK (TIME_CASA != TIME_FORA)
);

CREATE TABLE RESULTADO (
    ID_JOGO                 SMALLINT PRIMARY KEY,
    GOLS_TIME_CASA          SMALLINT NOT NULL,
    GOLS_TIME_FORA          SMALLINT NOT NULL,
    TOTAL_ESCANTEIOS        SMALLINT NOT NULL,

    CONSTRAINT check_resultado_gols_time_casa CHECK (GOLS_TIME_CASA >= 0),
    CONSTRAINT check_resultado_gols_time_fora CHECK (GOLS_TIME_FORA >= 0),
    CONSTRAINT check_resultado_total_escanteios CHECK (TOTAL_ESCANTEIOS >= 0),
    CONSTRAINT fk_resultado_jogo FOREIGN KEY (ID_JOGO) REFERENCES JOGO (ID_JOGO)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE APOSTA (
    ID_APOSTA               SERIAL PRIMARY KEY,
    ODD                     DECIMAL (4,2) NOT NULL,
    TIPO                    SMALLINT NOT NULL,
    ID_JOGO                 SMALLINT NOT NULL,
    ID_CASA_APOSTA          SMALLINT NOT NULL,

    CONSTRAINT check_aposta_tipo CHECK (TIPO IN (0, 1, 2)),
    CONSTRAINT fk_aposta_jogo FOREIGN KEY (ID_JOGO) REFERENCES JOGO (ID_JOGO)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_aposta_casa FOREIGN KEY (ID_CASA_APOSTA) REFERENCES CASA_DE_APOSTA (ID_CASA_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE RESULTADO_FINAL (
    ID_APOSTA               SMALLINT PRIMARY KEY,
    RESULTADO_FINAL         CHAR(6) NOT NULL,
    
    CONSTRAINT check_resultado_final_resultado_final CHECK (RESULTADO_FINAL IN ('CASA', 'FORA', 'EMPATE')),
    CONSTRAINT fk_resultado_final_aposta FOREIGN KEY (ID_APOSTA) REFERENCES APOSTA(ID_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE NUMERO_ESCANTEIOS (
    ID_APOSTA               SMALLINT PRIMARY KEY,
    TIPO                    SMALLINT NOT NULL,
    NUMERO                  SMALLINT NOT NULL,

    CONSTRAINT check_numero_escanteios_tipo CHECK (TIPO IN (0, 1, 2)),
    CONSTRAINT check_numero_escanteios_numero CHECK (NUMERO >= 0),
    CONSTRAINT fk_numero_escanteios_aposta FOREIGN KEY (ID_APOSTA) REFERENCES APOSTA (ID_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE NUMERO_GOLS (
    ID_APOSTA               SMALLINT PRIMARY KEY,
    TIPO                    SMALLINT NOT NULL ,
    NUMERO                  SMALLINT NOT NULL ,

    CONSTRAINT check_numero_gols_tipo CHECK (TIPO IN (0, 1, 2)),
    CONSTRAINT check_numero_gols_numero CHECK (NUMERO >= 0),
    CONSTRAINT fk_numero_gols_aposta FOREIGN KEY (ID_APOSTA) REFERENCES APOSTA (ID_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE BILHETE_TEM_APOSTA (
    ID_BILHETE              SMALLINT,
    ID_APOSTA               SMALLINT,
    ODD                     DECIMAL (4,2) NOT NULL,
    VALOR_APOSTADO          DECIMAL (10,2) NOT NULL,
    STATUS                  SMALLINT NOT NULL DEFAULT 0,
    RESULTADO               SMALLINT DEFAULT NULL,

    CONSTRAINT check_bilhete_tem_aposta_resultado CHECK ((STATUS = 1 AND (RESULTADO IN (0, 1))) OR (STATUS != 1 AND RESULTADO IS NULL)),
    CONSTRAINT check_bilhete_tem_aposta_valor_apostado CHECK (VALOR_APOSTADO > 0.0),
    CONSTRAINT check_bilhete_tem_aposta_status  CHECK (STATUS >= 0 AND STATUS <= 2),
    CONSTRAINT pk_bilhete_tem_aposta PRIMARY KEY (ID_BILHETE, ID_APOSTA),
    CONSTRAINT fk_bilhete_tem_aposta_bilhete FOREIGN KEY (ID_BILHETE) REFERENCES BILHETE (ID_BILHETE)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_bilhete_tem_aposta_aposta FOREIGN KEY (ID_APOSTA) REFERENCES APOSTA (ID_APOSTA)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- Quando adicionar o resultado de um jogo:
-- (um resultado só pode ser adicionado após o final do jogo)
-- atualizar na tabela bilhete_tem_aposta o status para concluída, 
-- o resultado será calculado, verificando na aposta, o tipo e na tabela do 
-- tipo de aposta, verificar qual a escolha do usuário
-- se escolheu por resultado final e o valor escolhido ganhou, então o resultado será 1, senão 0
-- se escolheu por número exato de gols, então verificar se o número escolhido foi o que deu no jogo, etc.
-- caso tenha ganhado, então adicionar no saldo da pessoa o valor_apostado * odd 
-- depois de atualizar o resultado, na tabela bilhete, verificar o bilhete que contém a aposta, e se todas as apostas do 
-- bilhete tiverem terminado, então altera o status do bilhete para concluído

-- Ao fazer uma aposta:
-- verificar se já não existe resultado para o jogo, se existir resultado, não deixar apostar
-- se a data final do jogo já estiver passado não permitir também
-- Caso seja possível apostar, subtrair o valor que será apostado da conta da pessoa, caso ela não possua dinheiro 
-- não permitir a aposta, depois de subtraído, criar um bilhete que conterá esta aposta, criar uma entrada na tabela 
-- bilhete_tem_aposta com o id deste bilhete criado e o id da aposta, também com a odd que estava a aposta
-- criar uma entrada em uma das tabelas resultado_final, ou numero_escanteios, ou numero_gols (de acordo com o campo tipo da aposta)
-- e inserir os valores necessários

-- 