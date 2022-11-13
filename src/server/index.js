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
            "INSERT INTO RESULTADO (ID_JOGO, GOLS_TIME_CASA, GOLS_TIME_FORA, TOTAL_ESCANTEIOS) VALUES ($1, $2, $3, $4)"
            [result.id_jogo, result.gols_time_fora, result.gols_time_casa, result.total_escanteios]
        );
        res.json(newResult);
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
});

// Adicionar uma aposta

// Alterar a odd


// Rotas USER
// Ver apostas disponíveis

// Realizar aposta

// Ver apostas realizadas


// Rotas AMBOS
// Fazer login

// Alterar senha
    