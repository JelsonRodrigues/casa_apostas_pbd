import React, { Fragment, useState, useEffect } from "react";

var newTicketBets = new Array();

const CreateTicket = () => {
    const user_id = localStorage.getItem("@casa_apostas/user_id");
    const house_id = localStorage.getItem("@casa_apostas/logged_house");


    const [availableBets_resultado_final, setAvailableBets_resultado_final] = useState([]);
    const [availableBets_escanteios, setAvailableBets_escanteios] = useState([]);
    const [availableBets_gols, setAvailableBets_gols] = useState([]);
    const [valorAposta, setvalorAposta] = useState("");

    const getAvailableBets = async () => {
        try {
            const response = await fetch("http://localhost:5000/get/bet/" + house_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined) {
                    console.log("ERRO AO CARREGAR AS APOSTAS DISPONIVEIS");
                }

                setAvailableBets_resultado_final(result.bets_resultado_final);
                setAvailableBets_escanteios(result.bets_escanteios);
                setAvailableBets_gols(result.bets_gols);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = (aposta_id) => {
        console.log("Valor aposta: ", valorAposta);
        console.log("Aposta id: ", aposta_id);
        try {
            newTicketBets.push({
                id_aposta : aposta_id,
                valor : parseFloat(valorAposta)
            });
    
        }
        catch (error){
            console.error(error);
        }
    };

    const confirmTicket = async () => {
        console.log("bets: ", newTicketBets);
        try {
            const body = {
                id_usuario: user_id,
                bets : newTicketBets
            };
            const response = await fetch("http://localhost:5000/add/bet/", {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined) {
                    console.log("ERRO AO CARREGAR AS APOSTAS DISPONIVEIS");
                }
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
            window.location.href = window.location.origin + "/login/user";
        } catch (error) {
            console.error(error);
        }
    };

    const updateMoney = () => {
        const money = localStorage.getItem("@casa_apostas/user_money");
        if (parseFloat(money) > 0){
            document.getElementById("userMoney").style.color = "green";
        }
        else if (parseFloat(money) < 0) {
            document.getElementById("userMoney").style.color = "red";
        }
        document.getElementById("userMoney").textContent = "R$ " + money;
    }
    
    useEffect(() => {getAvailableBets()}, []);
    useEffect(() => {updateMoney()}, []);

    return (
        <Fragment>
            <div className="text-center mt-5">
                <h1>Monte seu bilhete!</h1>
            </div>
            <div className="text-center mt-3">
                <label>
                    <b> DICA: </b> Insira um valor no campo "<b>Valor da aposta</b>"
                    na linha da aposta desejada e clique em "<b>Adicionar</b>" para adicioná-la ao bilhete
                </label>
            </div>
            <div className="text-center mt-3">
                <b>Saldo:</b> <label id='userMoney'>R$ 00.00</label> 
            </div>
            <div className="text-center mt-3">
                <button className="btn btn-warning" onClick={() => {window.location.href = window.location.origin + "/login/user"}}>
                    Voltar
                </button>
            </div>
            <div>
                <h2 className="text-center mt-5">Apostas disponíveis</h2>
            </div>
            <div className="container mx-auto w-25">
                <input type="text" size="2" className="form-control" placeholder="Valor" value={valorAposta} onChange={ (e) => setvalorAposta(e.target.value)}/>
            </div>
            <div>
                <table className="table text-center mt-4">
                    <thead>
                        <tr>
                            <th>Aposta (ID)</th>
                            <th>Time CASA</th>
                            <th>Time FORA</th>
                            <th>Tipo Aposta</th>
                            <th>Variante</th>
                            <th>Palpite</th>
                            <th>Odd</th>
                            <th>Valor da aposta</th>
                        </tr>
                    </thead>
                    {availableBets_resultado_final != null && (
                        <tbody>
                            {availableBets_resultado_final.map(bet => (
                                <tr key={bet.aposta_id}>
                                    <td>{bet.aposta_id}</td>
                                    <td>{bet.time_casa}</td>
                                    <td>{bet.time_fora}</td>
                                    <td>Resultado Final</td>
                                    <td>-</td>
                                    <td>{bet.resultado_final}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>
                                    <div className="d-flex">
                                        {/* <input type="text" size="2" className="form-control" placeholder="Valor" value={valorAposta} onChange={ (e) => setvalorAposta(e.target.value)}/> */}
                                        <button onClick={(aposta_id) => onSubmit(bet.aposta_id)} className="btn btn-success mx-auto">Adicionar</button>
                                    </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                    {availableBets_escanteios != null && (
                        <tbody>
                            {availableBets_escanteios.map(bet => (
                                <tr key={bet.aposta_id}>
                                    <td>{bet.aposta_id}</td>
                                    <td>{bet.time_casa}</td>
                                    <td>{bet.time_fora}</td>
                                    <td>Escanteios</td>
                                    {bet.escanteios_tipo === 0 && (
                                        <td>Número Exato</td>
                                    )}
                                    {bet.escanteios_tipo === 1 && (
                                        <td>Mais que</td>
                                    )}
                                    {bet.escanteios_tipo === 2 && (
                                        <td>Menos que</td>
                                    )}
                                    <td>{bet.escanteios_numero}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>
                                        <div className="d-flex">
                                            {/* <input type="text" size="2" className="form-control" placeholder="Valor" value={valorAposta} onChange={ (e) => setvalorAposta(e.target.value)}/> */}
                                            <button onClick={(aposta_id) => onSubmit(bet.aposta_id)} className="btn btn-success mx-auto">Adicionar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                    {availableBets_gols != null && (
                        <tbody>
                            {availableBets_gols.map(bet => (
                                <tr key={bet.aposta_id}>
                                    <td>{bet.aposta_id}</td>
                                    <td>{bet.time_casa}</td>
                                    <td>{bet.time_fora}</td>
                                    <td>Gols</td>
                                    {bet.gols_tipo === 0 && (
                                        <td>Número Exato</td>
                                    )}
                                    {bet.gols_tipo === 1 && (
                                        <td>Mais que</td>
                                    )}
                                    {bet.gols_tipo === 2 && (
                                        <td>Menos que</td>
                                    )}
                                    <td>{bet.gols_numero}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>
                                        <div className="d-flex">
                                            {/* <input type="text" size="2" className="form-control" placeholder="Valor" value={valorAposta} onChange={ (e) => setvalorAposta(e.target.value)}/> */}
                                            <button onClick={(aposta_id) => onSubmit(bet.aposta_id)} className="btn btn-success mx-auto">Adicionar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
            <form onSubmit={() => confirmTicket()}>
                <div className="text-center mt5">
                    <button type="submit"
                    className="btn btn-success btn-lg active">Confirmar</button>
                </div>
            </form>
        </Fragment>
    );
}

export default CreateTicket;