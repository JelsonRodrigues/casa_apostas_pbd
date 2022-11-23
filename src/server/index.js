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
        else {
            winner = "EMPATE";
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

// Adicionar uma aposta para resultado final
app.post("/create/bet/resultado", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
        
        // verifica se já existe uma aposta nesta casa, neste jogo e com este resultado final
        const alreadyExists = await pool.query(
            `SELECT * 
            FROM APOSTA
            JOIN RESULTADO_FINAL ON RESULTADO_FINAL.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 0
            WHERE  APOSTA.ID_JOGO = ($1) AND RESULTADO_FINAL.RESULTADO_FINAL = ($2) AND APOSTA.ID_CASA_APOSTA = ($3)`,
            [bet.id_jogo, bet.resultado_final, bet.id_casa_aposta]
        );
        if (alreadyExists.rowCount == 0) {
            const newBet = await pool.query(
                "INSERT INTO APOSTA (ODD, TIPO, ID_JOGO, ID_CASA_APOSTA) VALUES ($1, $2, $3, $4) RETURNING ID_APOSTA",
                [bet.odd, 0, bet.id_jogo, bet.id_casa_aposta]
            );
            await pool.query(
                "INSERT INTO RESULTADO_FINAL (ID_APOSTA, RESULTADO_FINAL) VALUES ($1, $2)",
                [newBet.rows[0].id_aposta, bet.resultado_final]
            );
            res.json(newBet);
        }
        else {
            res.json({
                "error": "Bet with those parameters already exists in this house, maybe try changing the odd"
            });
        }
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar uma aposta para numero de escanteios
app.post("/create/bet/escanteios", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;

        // verifica se já existe uma aposta nesta casa, neste jogo e com o tipo escolhido e com o este número de escanteios
        const alreadyExists = await pool.query(
            `SELECT * 
            FROM APOSTA
            JOIN NUMERO_ESCANTEIOS ON NUMERO_ESCANTEIOS.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 1
            WHERE APOSTA.ID_JOGO = ($1) AND NUMERO_ESCANTEIOS.TIPO = ($2) AND NUMERO_ESCANTEIOS.NUMERO = ($3) AND APOSTA.ID_CASA_APOSTA = ($4)`,
            [bet.id_jogo, bet.tipo, bet.numero, bet.id_casa_aposta]
        );
        if (alreadyExists.rowCount == 0) {
            const newBet = await pool.query(
                "INSERT INTO APOSTA (ODD, TIPO, ID_JOGO, ID_CASA_APOSTA) VALUES ($1, $2, $3, $4) RETURNING ID_APOSTA",
                [bet.odd, 1, bet.id_jogo, bet.id_casa_aposta]
            );
            await pool.query(
                "INSERT INTO NUMERO_ESCANTEIOS (ID_APOSTA, TIPO, NUMERO) VALUES ($1, $2, $3)",
                [newBet.rows[0].id_aposta, bet.tipo, bet.numero]
            );
            res.json(newBet);
        }
        else {
            res.json({
                "error": "Bet with those parameters already exists in this house, maybe try changing the odd"
            });
        }
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar uma aposta para numero de gols
app.post("/create/bet/gols", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;

        // verifica se já existe uma aposta nesta casa, neste jogo e com o tipo escolhido e com o este número de gols
        const alreadyExists = await pool.query(
            `SELECT * 
            FROM APOSTA
            JOIN NUMERO_GOLS ON NUMERO_GOLS.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.TIPO = 2
            WHERE APOSTA.ID_JOGO = ($1) AND NUMERO_GOLS.TIPO = ($2) AND NUMERO_GOLS.NUMERO = ($3) AND APOSTA.ID_CASA_APOSTA = ($4)`,
            [bet.id_jogo, bet.tipo, bet.numero, bet.id_casa_aposta]
        );
        if (alreadyExists.rowCount == 0) {
            const newBet = await pool.query(
                "INSERT INTO APOSTA (ODD, TIPO, ID_JOGO, ID_CASA_APOSTA) VALUES ($1, $2, $3, $4) RETURNING ID_APOSTA",
                [bet.odd, 2, bet.id_jogo, bet.id_casa_aposta]
            );
            await pool.query(
                "INSERT INTO NUMERO_GOLS (ID_APOSTA, TIPO, NUMERO) VALUES ($1, $2, $3)",
                [newBet.rows[0].id_aposta, bet.tipo, bet.numero]
            );
            res.json(newBet);
        }
        else {
            res.json({
                "error": "Bet with those parameters already exists in this house, maybe try changing the odd"
            });
        }
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
        const bets_resultado_final = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, APOSTA.ODD AS APOSTA_ODD, RESULTADO_FINAL.RESULTADO_FINAL,
            JOGO.TIME_CASA, JOGO.TIME_FORA
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN RESULTADO_FINAL ON APOSTA.ID_APOSTA = RESULTADO_FINAL.ID_APOSTA
            WHERE ID_CASA_APOSTA = $1`,
            [house_id]
        );

        const bets_escanteios = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, APOSTA.ODD AS APOSTA_ODD, NUMERO_ESCANTEIOS.TIPO AS ESCANTEIOS_TIPO,
            NUMERO_ESCANTEIOS.NUMERO AS ESCANTEIOS_NUMERO, JOGO.TIME_CASA, JOGO.TIME_FORA
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN NUMERO_ESCANTEIOS ON APOSTA.ID_APOSTA = NUMERO_ESCANTEIOS.ID_APOSTA
            WHERE ID_CASA_APOSTA = $1`,
            [house_id]
        );

        const bets_gols = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, APOSTA.ODD AS APOSTA_ODD, NUMERO_GOLS.TIPO AS GOLS_TIPO,
            NUMERO_GOLS.NUMERO AS GOLS_NUMERO, JOGO.TIME_CASA, JOGO.TIME_FORA
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN NUMERO_GOLS ON APOSTA.ID_APOSTA = NUMERO_GOLS.ID_APOSTA
            WHERE ID_CASA_APOSTA = $1`,
            [house_id]
        );
        res.json({
            "bets_resultado_final" : bets_resultado_final.rows,
            "bets_escanteios" : bets_escanteios.rows,
            "bets_gols" : bets_gols.rows
        });
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Ver os bilhetes registrados na casa de aposta

app.get("/get/tickets/:house_id/:user_id", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const tickets = await pool.query(
            `SELECT DISTINCT BILHETE.ID_BILHETE, BILHETE.DATA, BILHETE.STATUS
            FROM BILHETE 
            JOIN BILHETE_TEM_APOSTA ON BILHETE.ID_BILHETE = BILHETE_TEM_APOSTA.ID_BILHETE AND BILHETE.ID_USUARIO_APOSTADOR = $2
            JOIN APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA AND APOSTA.ID_CASA_APOSTA = $1`,
            [params.house_id, params.user_id]
        );
        res.json(tickets.rows);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Consultar dados completos do bilhete

app.get("/get/ticket/:bilhete_id", async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const ticket_info = await pool.query(
            `SELECT BILHETE.DATA AS BILHETE_DATA, BILHETE.STATUS AS BILHETE_STATUS
            FROM BILHETE 
            WHERE BILHETE.ID_BILHETE = $1`,
            [params.bilhete_id]
        );

        const bets_resultado_final = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, BILHETE_TEM_APOSTA.ODD AS APOSTA_ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO,
            BILHETE_TEM_APOSTA.STATUS AS APOSTA_STATUS, BILHETE_TEM_APOSTA.RESULTADO AS APOSTA_RESULTADO,
            RESULTADO_FINAL.RESULTADO_FINAL, JOGO.TIME_CASA, JOGO.TIME_FORA 
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN BILHETE_TEM_APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA
            JOIN RESULTADO_FINAL ON APOSTA.ID_APOSTA = RESULTADO_FINAL.ID_APOSTA
            WHERE BILHETE_TEM_APOSTA.ID_BILHETE = $1 AND APOSTA.TIPO = 0`,
            [params.bilhete_id]
        );

        const bets_escanteios = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, BILHETE_TEM_APOSTA.ODD AS APOSTA_ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO,
            BILHETE_TEM_APOSTA.STATUS AS APOSTA_STATUS, BILHETE_TEM_APOSTA.RESULTADO AS APOSTA_RESULTADO, APOSTA.TIPO AS APOSTA_TIPO,
            NUMERO_ESCANTEIOS.TIPO AS ESCANTEIOS_TIPO, NUMERO_ESCANTEIOS.NUMERO AS ESCANTEIOS_NUMERO, JOGO.TIME_CASA, JOGO.TIME_FORA 
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN BILHETE_TEM_APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA
            JOIN NUMERO_ESCANTEIOS ON APOSTA.ID_APOSTA = NUMERO_ESCANTEIOS.ID_APOSTA
            WHERE BILHETE_TEM_APOSTA.ID_BILHETE = $1 AND APOSTA.TIPO = 1`,
            [params.bilhete_id]
        );

        const bets_gols = await pool.query(
            `SELECT APOSTA.ID_APOSTA AS APOSTA_ID, BILHETE_TEM_APOSTA.ODD AS APOSTA_ODD, BILHETE_TEM_APOSTA.VALOR_APOSTADO,
            BILHETE_TEM_APOSTA.STATUS AS APOSTA_STATUS, BILHETE_TEM_APOSTA.RESULTADO AS APOSTA_RESULTADO, APOSTA.TIPO AS APOSTA_TIPO,
            NUMERO_GOLS.TIPO AS GOLS_TIPO, NUMERO_GOLS.NUMERO AS GOLS_NUMERO, JOGO.TIME_CASA, JOGO.TIME_FORA 
            FROM APOSTA
            JOIN JOGO ON APOSTA.ID_JOGO = JOGO.ID_JOGO
            JOIN BILHETE_TEM_APOSTA ON BILHETE_TEM_APOSTA.ID_APOSTA = APOSTA.ID_APOSTA
            JOIN NUMERO_GOLS ON APOSTA.ID_APOSTA = NUMERO_GOLS.ID_APOSTA
            WHERE BILHETE_TEM_APOSTA.ID_BILHETE = $1 AND APOSTA.TIPO = 2`,
            [params.bilhete_id]
        );

        res.json({
            "ticket_info": ticket_info.rows[0],
            "bets_resultado_final" : bets_resultado_final.rows,
            "bets_escanteios" : bets_escanteios.rows,
            "bets_gols" : bets_gols.rows
        });
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
            JOIN NUMERO_ESCANTEIOS ON NUMERO_ESCANTEIOS.ID_APOSTA = APOSTA.ID_APOSTA`,
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
app.get("/get/bet/open/:house_id/:user_id/resultado", async (req, res) => {
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
app.get("/get/bet/history/:house_id/:user_id/resultado", async (req, res) => {
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

// Realizar aposta
app.post("/add/bet", async (req, res) => {
    try {
        console.log(req.body);
        const bet = req.body;
    
        // create a new ticket
        const ticket = await pool.query(
            "INSERT INTO BILHETE (DATA, ID_USUARIO_APOSTADOR) VALUES (now()::timestamp, ($1)) RETURNING ID_BILHETE",
            [bet.id_usuario]
        );
        let totalValue = 0;

        for (let index = 0; index < bet.bets.length; index++) {
            const element = bet.bets[index];

            const currentOdd = await pool.query(
                "SELECT ODD FROM APOSTA WHERE APOSTA.ID_APOSTA = ($1)",
                [element.id_aposta]
            );
            
            await pool.query(
                "INSERT INTO BILHETE_TEM_APOSTA (ID_BILHETE, ID_APOSTA, ODD, VALOR_APOSTADO) VALUES ($1, $2, $3, $4)",
                [ticket.rows[0].id_bilhete, element.id_aposta, currentOdd.rows[0].odd, element.valor]
            );
            totalValue += parseFloat(element.valor);
        }
        
        const houseBet = await pool.query(
            "SELECT ID_CASA_APOSTA FROM APOSTA WHERE APOSTA.ID_APOSTA = ($1)",
            [bet.bets[0].id_aposta]
        );
        
        console.log(houseBet);

        const currentMoney = await pool.query(
            "SELECT SALDO FROM CLIENTES WHERE ID_CASA_APOSTA = ($1) AND ID_USUARIO_APOSTADOR = ($2)",
            [houseBet.rows[0].id_casa_aposta, bet.id_usuario]
        );
        console.log(currentMoney);
        await pool.query(
            "UPDATE CLIENTES SET SALDO = ($1) WHERE ID_CASA_APOSTA = ($2) AND ID_USUARIO_APOSTADOR = ($3)",
            [currentMoney.rows[0].saldo - totalValue, houseBet.rows[0].id_casa_aposta, bet.id_usuario]
        );

        res.json(ticket);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Pegar o saldo de um usuário
app.get("/money/:house_id/:user_id",  async (req, res) => {
    try {
        console.log(req.params);
        const params = req.params;
        const money = await pool.query(
            "SELECT SALDO FROM CLIENTES WHERE CLIENTES.ID_USUARIO_APOSTADOR = ($1) AND CLIENTES.ID_CASA_APOSTA = ($2)",
            [params.user_id, params.house_id]
        );
        res.json(money.rows[0]);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Rotas AMBOS
// Fazer login
app.post("/login",  async (req, res) => {
    try {
        console.log(req.body);
        const userInfo = req.body;
        const user = await pool.query(
            "SELECT TIPO, ID_USUARIO, NOME, SOBRENOME FROM USUARIO WHERE EMAIL = ($1) AND SENHA = ($2)",
            [userInfo.email, userInfo.senha]
        );

        if (user.rows.length > 0){
            let houses;
            if (user.rows[0].tipo == 0){
                houses = await pool.query(
                    `SELECT CASA_DE_APOSTA.ID_CASA_APOSTA, CASA_DE_APOSTA.NOME 
                    FROM CLIENTES 
                    JOIN CASA_DE_APOSTA ON CLIENTES.ID_CASA_APOSTA = CASA_DE_APOSTA.ID_CASA_APOSTA
                    WHERE CLIENTES.ID_USUARIO_APOSTADOR = ($1)`,
                    [user.rows[0].id_usuario]
                );
            }
            else {
                houses = await pool.query(
                    `SELECT CASA_DE_APOSTA.ID_CASA_APOSTA, CASA_DE_APOSTA.NOME 
                    FROM GERENCIA 
                    JOIN CASA_DE_APOSTA ON GERENCIA.ID_CASA_APOSTA = CASA_DE_APOSTA.ID_CASA_APOSTA
                    WHERE GERENCIA.ID_USUARIO_ADMINISTRADOR = ($1)`,
                    [user.rows[0].id_usuario]
                );
            }
            
            res.json({
                "tipo": user.rows[0].tipo,
                "id_usuario": user.rows[0].id_usuario,
                "nome_completo" : user.rows[0].nome + " " + user.rows[0].sobrenome,
                "houses": houses.rows
            });
        }
        else {
            res.json({
                "erro" : "Not found user with these info"
            });
        }
    } catch (error) {

        console.error("ERROR: " + error.message);
    }
});

// Alterar senha
    