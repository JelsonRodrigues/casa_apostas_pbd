const { json } = require("express");
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());


const jsonInitFile  = require("./init.json");

app.listen(jsonInitFile.server_port, () => {
    console.log("Server started listening on port ", jsonInitFile.server_port);
});

// Rotas ADMIN
// Adicionar um jogo
app.post("/add/game", async (req, res) => {
    try {
        console.log(req.body);
        const game = req.body;
        const newGame = await pool.query(
            "INSERT INTO JOGO (TIME_CASA, TIME_FORA, DATA_INICIO, DATA_FIM) VALUES ($1, $2, $3, $4)", 
            [game.time_casa, game.time_fora, game.data_inicio, game.data_fim]
        );
        res.json(newGame);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar um resultado
app.post("/add/result", async (req, res) => {
    try {
        console.log(req.body);
        const result = req.body;
        const newResult = await pool.query(
            "INSERT INTO RESULTADO (ID_JOGO, GOLS_TIME_CASA, GOLS_TIME_FORA, TOTAL_ESCANTEIOS) VALUES ($1, $2, $3, $4)",
            [result.id_jogo, result.gols_time_casa, result.gols_time_fora, result.total_escanteios]
        );
        
        // Passar esta parte diretamente para o banco de dados
        const betsInGame = await pool.query(
            `SELECT 
            CLIENTES.ID_USUARIO_APOSTADOR AS ID_USUARIO,
            CLIENTES.SALDO AS SALDO,
            APOSTA.ID_CASA_APOSTA,
            APOSTA.ID_APOSTA AS ID_APOSTA, 
            APOSTA.ODD, 
            APOSTA.TIPO AS TIPO_APOSTA, 
            APOSTA.ID_JOGO, 
            BILHETE_TEM_APOSTA.VALOR_APOSTADO, 
            RESULTADO_FINAL.RESULTADO_FINAL AS RESULTADO_FINAL, 
            NUMERO_ESCANTEIOS.TIPO AS TIPO_NUMERO_ESCANTEIOS, 
            NUMERO_ESCANTEIOS.NUMERO AS NUMERO_ESCANTEIOS, 
            NUMERO_GOLS.TIPO AS TIPO_NUMERO_GOLS, 
            NUMERO_GOLS.NUMERO AS NUMERO_GOLS
            FROM APOSTA 
            JOIN BILHETE_TEM_APOSTA ON APOSTA.ID_APOSTA = BILHETE_TEM_APOSTA.ID_APOSTA AND BILHETE_TEM_APOSTA.STATUS = 0
            LEFT JOIN RESULTADO_FINAL ON RESULTADO_FINAL.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 0
            LEFT JOIN NUMERO_ESCANTEIOS ON NUMERO_ESCANTEIOS.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 1
            LEFT JOIN NUMERO_GOLS ON NUMERO_GOLS.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 2
            JOIN BILHETE ON BILHETE_TEM_APOSTA.ID_BILHETE = BILHETE.ID_BILHETE
            JOIN CLIENTES ON BILHETE.ID_USUARIO_APOSTADOR = CLIENTES.ID_USUARIO_APOSTADOR AND APOSTA.ID_CASA_APOSTA = CLIENTES.ID_CASA_APOSTA
            WHERE APOSTA.ID_JOGO = ($1) AND BILHETE_TEM_APOSTA.STATUS = 0`,
            [result.id_jogo]
        );
        
        let winner = "";
        if (result.gols_time_casa > result.gols_time_fora) {
            winner = "CASA";
        }
        else if (result.gols_time_casa < result.gols_time_fora) {
            winner = "FORA";
        }

        const total_gols = result.gols_time_casa + result.gols_time_fora; 

        for (let index = 0; index < betsInGame.rows.length; index++) {
            const element = betsInGame.rows[index];
            let flagResultOfBet = false;
            switch (element.tipo_aposta) {
                case 0:
                    if (element.resultado_final == winner) { flagResultOfBet = true;}
                    break;
                case 1:
                    switch (element.tipo_numero_escanteios) {
                        case 0:
                            if (element.numero_escanteios == result.numero_escanteios){flagResultOfBet = true;}    
                            break;
                        case 1:
                            if (element.numero_escanteios > result.numero_escanteios){flagResultOfBet = true;}    
                            break;
                        case 2:
                            if (element.numero_escanteios < result.numero_escanteios){flagResultOfBet = true;}    
                            break;
                    }
                    break;
                case 2:
                    switch (element.tipo_numero_gols) {
                        case 0:
                            if (element.numero_gols == total_gols){flagResultOfBet = true;}    
                            break;
                        case 1:
                            if (element.numero_gols > total_gols){flagResultOfBet = true;}    
                            break;
                        case 2:
                            if (element.numero_gols < total_gols){flagResultOfBet = true;}    
                            break;
                    }
                    break;
            }
            
            if (flagResultOfBet) {
                await pool.query(
                    "UPDATE BILHETE_TEM_APOSTA SET STATUS = 1, RESULTADO = 1 WHERE BILHETE_TEM_APOSTA.ID_APOSTA = ($1)",
                    [element.id_aposta]
                );
                // Also add the money to the user account
                await pool.query(
                    "UPDATE CLIENTES SET SALDO = ($1) WHERE CLIENTES.ID_USUARIO_APOSTADOR = ($2) AND CLIENTES.ID_CASA_APOSTA = ($3)",
                    [(parseFloat(element.saldo) + parseFloat(element.odd * element.valor_apostado)), element.id_usuario, element.id_casa_aposta]
                );
            }
            else {
                await pool.query(
                    "UPDATE BILHETE_TEM_APOSTA SET STATUS = 1, RESULTADO = 0 WHERE BILHETE_TEM_APOSTA.ID_APOSTA = ($1)",
                    [element.id_aposta]
                );
            }
        }

        res.json(newResult);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar uma aposta
app.post("/add/bet", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        const newBet = await pool.query(
            "INSERT INTO APOSTA (ODD, TIPO, ID_JOGO, ID_CASA_APOSTA) VALUES ($1, $2, $3, $4)"
            [bet.odd, bet.tipo, bet.id_jogo, bet.id_casa_aposta]
        );
        res.json(newBet);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Alterar a odd
app.put("/alter/bet", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        const changedBet = await pool.query(
            "UPDATE APOSTA SET ODD = $1 WHERE ID_APOSTA = $2",
            [bet.nova_odd, bet.id_aposta]
        );
        res.json(changedBet);
        console.log("Odd changed!");
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Rotas USER
// Ver apostas disponíveis na casa de aposta
app.get("/get/bet/:house_id", async (req, res) => {
    try {
        console.log(req.params);
        const { house_id } = req.params;
        const bets = await pool.query(
            "SELECT * FROM APOSTA WHERE ID_CASA_APOSTA = $1",
            [house_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas em aberto de qualquer tipo
app.get("/get/bet/open/:house_id/:user_id", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO, JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO 
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS = 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO`,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas em aberto do tipo escanteio
app.get("/get/bet/open/:house_id/:user_id/escanteio", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA , JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, NUMERO_ESCANTEIOS.TIPO, NUMERO_ESCANTEIOS.NUMERO
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS = 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN NUMERO_ESCANTEIOS ON NUMERO_ESCANTEIOS.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas em aberto do tipo numero gols
app.get("/get/bet/open/:house_id/:user_id/gols", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA , JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, NUMERO_GOLS.TIPO, NUMERO_GOLS.NUMERO
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS = 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN NUMERO_GOLS ON NUMERO_GOLS.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas em aberto do tipo resultado final
app.get("/get/bet/open/:house_id/:user_id/gols", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA , JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, RESULTADO_FINAL.RESULTADO_FINAL
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS = 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN RESULTADO_FINAL ON RESULTADO_FINAL.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas encerradas de qualquer tipo
app.get("/get/bet/history/:house_id/:user_id", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO, JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO 
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS != 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO`,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas encerradas do tipo escanteio
app.get("/get/bet/history/:house_id/:user_id/escanteio", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA, JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, NUMERO_ESCANTEIOS.TIPO, NUMERO_ESCANTEIOS.NUMERO
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS != 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN NUMERO_ESCANTEIOS ON NUMERO_ESCANTEIOS.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas encerradas do tipo numero gols
app.get("/get/bet/history/:house_id/:user_id/gols", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA , JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, NUMERO_GOLS.TIPO, NUMERO_GOLS.NUMERO
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS != 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN NUMERO_GOLS ON NUMERO_GOLS.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver as apostas encerradas do tipo resultado final
app.get("/get/bet/history/:house_id/:user_id/gols", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const bets = await pool.query(
            `SELECT APOSTA.TIPO AS TIPO_APOSTA , JOGO.TIME_CASA, JOGO.TIME_FORA, BILHETE.DATA, BILHETE_TEM_APOSTA.ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO, RESULTADO_FINAL.RESULTADO_FINAL
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE_TEM_APOSTA.STATUS != 0 AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1
            JOIN JOGO ON JOGO.ID_JOGO = APOSTA.ID_JOGO
            JOIN RESULTADO_FINAL ON RESULTADO_FINAL.ID_APOSTA = APOSTA.ID_APOSTA
            `,
            [params.house_id, params.user_id]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Realizar aposta no resultado final
app.post("/add/bet/resultado", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        const bets = await pool.query(
            `INSERT INTO RESULTADO_FINAL (ID_APOSTA, RESULTADO_FINAL)
            VALUES
            ($1, $2)
            `,
            [bet.id_aposta, bet.resultado_final]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Realizar aposta no número de escanteios
app.post("/add/bet/escanteios", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        const bets = await pool.query(
            `INSERT INTO NUMERO_ESCANTEIOS (ID_APOSTA, TIPO, NUMERO)
            VALUES
            ($1, $2, $3)
            `,
            [bet.id_aposta, bet.tipo, bet.numero]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Realizar aposta no número de gols
app.post("/add/bet/gols", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        const bets = await pool.query(
            `INSERT INTO NUMERO_GOLS (ID_APOSTA, TIPO, NUMERO)
            VALUES
            ($1, $2, $3)
            `,
            [bet.id_aposta, bet.tipo, bet.numero]
        );
        res.json(bets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar aposta ao carrinho

// Rotas AMBOS
// Fazer login

// Alterar senha
    