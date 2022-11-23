import React, { Fragment, useState, useEffect } from "react";

const MyTickets = () => {

    const user_id = localStorage.getItem("@casa_apostas/user_id");
    const house_id = localStorage.getItem("@casa_apostas/logged_house");

    const [tickets, setTickets] = useState([]);

    const getTickets = async () => {
        try {
            const response = await fetch("http://localhost:5000/get/tickets/" + house_id + "/" + user_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined) {
                    console.log("ERRO AO CARREGAR OS TICKETS");
                }

                setTickets(result);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const viewTicket = (ticket_id) => {
        localStorage.setItem("@casa_apostas/viewTicket_id", ticket_id);
        window.location.href = window.location.origin + "/view/ticket";
    }

    useEffect(() => {
        getTickets();
    }, []);

    return (
        <Fragment>
            <h2 className="text-center">Meus bilhetes</h2>
            <div>
                <table className="table text-center mt-4">
                    <thead>
                        <tr>
                            <th>Bilhete (ID)</th>
                            <th>Data da Aposta</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    {tickets != null && (
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id_bilhete}>
                                    <td>{ticket.id_bilhete}</td>
                                    <td>{ticket.data}</td>
                                    {ticket.status === 0 && (
                                        <td>Pendente</td>
                                    )}
                                    {ticket.status === 1 && (
                                        <td>Concluído</td>
                                    )}
                                    {ticket.status === 2 && (
                                        <td>Cancelado</td>
                                    )}
                                    <td>
                                        <button 
                                        className="btn btn-warning"
                                        onClick={() => viewTicket(ticket.id_bilhete)}>
                                            Visualizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </Fragment>
    );
}

export default MyTickets;

