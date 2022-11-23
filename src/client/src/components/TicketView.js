import React, { Fragment, useEffect, useState } from "react";

const TicketView = () => {

    const ticket_id = localStorage.getItem("@casa_apostas/viewTicket_id");

    const [ticket_info, setTicket_info] = useState();
    const [bets_resultado_final, setBets_resultado_final] = useState([]);
    const [bets_escanteios, setBets_escanteios] = useState([]);
    const [bets_gols, setBets_gols] = useState([]);
    const [total_apostado, setTotal_apostado] = useState(0);

    const getTicket = async () => {
        try {
            const response = await fetch("http://localhost:5000/get/ticket/" + ticket_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined) {
                    console.log("ERRO AO CARREGAR AS INFORMAÇÕES DO TICKET");
                }

                setTicket_info(result.ticket_info);
                setBets_resultado_final(result.bets_resultado_final);
                setBets_escanteios(result.bets_escanteios);
                setBets_gols(result.bets_gols);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getTotalApostado = () => {
        let total = 0.0;

        if(bets_resultado_final[0] !== undefined){
            if(bets_resultado_final[1] !== undefined){
                bets_resultado_final.forEach(bet => {
                    total = total + parseFloat(bet.total_apostado);
                });
            } else{
                total = total + parseFloat(bets_resultado_final[0].valor_apostado);
            }
        }
        if(bets_escanteios[0] !== undefined){
            if(bets_escanteios[1] !== undefined){
                console.log("chrck 1");
                bets_escanteios.forEach(bet => {
                    total = total + parseFloat(bet.total_apostado);
                });
            } else{
                total = total + parseFloat(bets_escanteios[0].valor_apostado);
            }
        }
        if(bets_gols[0] !== undefined){
            if(bets_gols[1] !== undefined){
                bets_gols.forEach(bet => {
                    total = total + parseFloat(bet.total_apostado);
                });
            } else{
                total = total + parseFloat(bets_gols[0].valor_apostado);
            }
        }

        console.log("total:", total);
        return total;
    }

    useEffect(() => {
        getTicket();
    }, []);

    useEffect(() => {
        setTotal_apostado(parseFloat(getTotalApostado()));
    });

    return (
        <Fragment>
            <div>
                <h1 className="text-center mt-5">Bilhete #{ticket_id}</h1>
            </div>
            <div className="text-center mt-4">
                {ticket_info != null && (<label>
                    <p> <b>Data do bilhete: </b> 
                        {ticket_info.bilhete_data} 
                    </p>
                    <p> <b>Status: </b>
                        {ticket_info.bilhete_status === 0 && (<label>Pendente</label>)}
                        {ticket_info.bilhete_status === 1 && (<label>Concluído</label>)}
                        {ticket_info.bilhete_status === 2 && (<label>Cancelado</label>)}
                    </p>
                        <p> <b>Valor total apostado: </b> 
                            R$ {total_apostado} 
                        </p>
                </label>)}
            </div>
            <div className="text-center mt5">
                <button className="btn btn-warning" onClick={() => {window.history.go(-1);}}>
                    Voltar
                </button>
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
                            <th>Valor Apostado</th>
                            <th>Odd</th>
                            <th>Possível Retorno</th>
                            <th>Status</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    {bets_resultado_final != null && (
                        <tbody>
                            {bets_resultado_final.map(bet => (
                                <tr key={bet.aposta_id}>
                                    <td>{bet.aposta_id}</td>
                                    <td>{bet.time_casa}</td>
                                    <td>{bet.time_fora}</td>
                                    <td>Resultado Final</td>
                                    <td>-</td>
                                    <td>{bet.resultado_final}</td>
                                    <td>R$ {parseFloat(bet.valor_apostado)}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>R$ {parseFloat(bet.aposta_odd * bet.valor_apostado)}</td>
                                    {bet.aposta_status === 0 && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_status === 1 && (
                                        <td>Concluída</td>
                                    )}
                                    {bet.aposta_status === 2 && (
                                        <td>Cancelada</td>
                                    )}
                                    {bet.aposta_resultado === null && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_resultado === 0 && (
                                        <td>Perdida</td>
                                    )}
                                    {bet.aposta_resultado === 1 && (
                                        <td>Ganha</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                    {bets_escanteios != null && (
                        <tbody>
                            {bets_escanteios.map(bet => (
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
                                    <td>R$ {parseFloat(bet.valor_apostado)}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>R$ {parseFloat(bet.aposta_odd * bet.valor_apostado)}</td>
                                    {bet.aposta_status === 0 && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_status === 1 && (
                                        <td>Concluída</td>
                                    )}
                                    {bet.aposta_status === 2 && (
                                        <td>Cancelada</td>
                                    )}
                                    {bet.aposta_resultado === null && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_resultado === 0 && (
                                        <td>Perdida</td>
                                    )}
                                    {bet.aposta_resultado === 1 && (
                                        <td>Ganha</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                    {bets_gols != null && (
                        <tbody>
                            {bets_gols.map(bet => (
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
                                    <td>R$ {parseFloat(bet.valor_apostado)}</td>
                                    <td>{bet.aposta_odd}</td>
                                    <td>R$ {parseFloat(bet.aposta_odd * bet.valor_apostado)}</td>
                                    {bet.aposta_status === 0 && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_status === 1 && (
                                        <td>Concluída</td>
                                    )}
                                    {bet.aposta_status === 2 && (
                                        <td>Cancelada</td>
                                    )}
                                    {bet.aposta_resultado === null && (
                                        <td>Pendente</td>
                                    )}
                                    {bet.aposta_resultado === 0 && (
                                        <td>Perdida</td>
                                    )}
                                    {bet.aposta_resultado === 1 && (
                                        <td>Ganha</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </Fragment>
    );
};

export default TicketView;