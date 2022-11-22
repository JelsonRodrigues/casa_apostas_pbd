import React, { Fragment, useEffect, useState } from "react";

const TicketView = () => {

    const ticket_id = localStorage.getItem("@casa_apostas/viewTicket_id");

    const [ticket_info, setTicket_info] = useState();
    const [bets, setBets] = useState([]);

    const getTicket = async () => {
        try {
            const response = await fetch("http://localhost:5000/get/ticket/" + ticket_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined) {
                    console.log("ERRO AO CARREGAR AS INFORMAÇÕES DO TICKET");
                }

                setTicket_info(result.ticket_info);

                setBets(result.bets);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getTicket();
    }, []);

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
                </label>)}
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
                    {/* {bets != null && (
                        <tbody>
                            {bets.map(bet => (
                                <tr key={bets.aposta_id}>
                                    <td>{bets.aposta_id}</td>
                                    <td>{bets.time_casa}</td>
                                    <td>{bets.time_fora}</td>
                                    <td>{bets.aposta_tipo}</td>
                                    {bets.aposta_tipo === 0 && (
                                        <td>Resultado Final</td>
                                    )}
                                    {bets.aposta_tipo === 1 && (
                                        <td>Número de Escanteios</td>
                                    )}
                                    {bets.aposta_tipo === 2 && (
                                        <td>Número de Gols</td>
                                    )}
                                    {bets.aposta_tipo === 0 && (
                                        <td>-</td>
                                    )}
                                    {bets.aposta_tipo === 1 && (
                                        {bets.escanteios_tipo === 0 && (
                                            <td>Nmr. Exato</td>
                                        )}
                                        {bets.escanteios_tipo === 1 && (
                                            <td>Mais que</td>
                                        )}
                                        {bets.escanteios_tipo === 2 && (
                                            <td>Menos que</td>
                                        )}
                                    )}
                                    {bets.aposta_tipo === 2 && (
                                        {bets.gols_tipo === 0 && (
                                            <td>Nmr. Exato</td>
                                        )}
                                        {bets.gols_tipo === 1 && (
                                            <td>Mais que</td>
                                        )}
                                        {bets.gols_tipo === 2 && (
                                            <td>Menos que</td>
                                        )}
                                    )}
                                    {bets.aposta_tipo === 0 && (
                                        <td>{bets.resultado_final}</td>
                                    )}
                                    {bets.aposta_tipo === 1 && (
                                        <td>{bets.escanteios_numero}</td>
                                    )}
                                    {bets.aposta_tipo === 2 && (
                                        <td>{bets.gols_numero}</td>
                                    )}
                                    <td>{bets.odd}</td>
                                    <td>calcular</td>
                                    <td>{bets.aposta_status}</td>
                                    <td>{bets.aposta_resultado}</td>
                                </tr>
                            ))}
                        </tbody>
                    )} */}
                </table>
            </div>
        </Fragment>
    );
};

export default TicketView;