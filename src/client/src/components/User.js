import React, { Fragment, useState, useEffect } from "react";
import MyTickets from "./MyTickets";

const User = () => {

    const user_name =  localStorage.getItem("@casa_apostas/user_name");
    const house_name = localStorage.getItem("@casa_apostas/house_name");
    const user_id = localStorage.getItem("@casa_apostas/user_id");
    const house_id = localStorage.getItem("@casa_apostas/logged_house");

    const getSaldo = async () => {
        try {
            const response = await fetch("http://localhost:5000/money/" + house_id + "/" + user_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined){
                    console.log("ERRO AO OBTER O SALDO");
                }
                localStorage.setItem("@casa_apostas/user_money", result.saldo);

                if (parseFloat(result.saldo) > 0){
                    document.getElementById("userMoney").style.color = "green";
                }
                else if (parseFloat(result.saldo) < 0) {
                    document.getElementById("userMoney").style.color = "red";
                }
                document.getElementById("userMoney").textContent = "R$ " + result.saldo;
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const createTicket = () => {
        window.location.href = window.location.origin + "/new/ticket";
    }

    useEffect(() => {
    getSaldo();
    });

    return (
        <Fragment>
            <h1 className="text-center mt-5">{house_name}</h1>
            <div className="text-center mt-4">
                <label>
                    <b>Usuário:</b> {user_name}
                </label>
            </div>
            <div className="text-center mt-2">
                <b>Saldo:</b> <label id="userMoney">R$ 00.00</label>
            </div>
            <div className="text-center mt-4">
                <button
                    className="btn btn-success m-4"
                    onClick={() => createTicket()}>
                    Fazer uma aposta
                </button>
                <button className="btn btn-danger m-4" onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}>Sair</button>
            </div>
            <div className="mt-5">
                <MyTickets />
            </div>

        </Fragment>
    );
};

export default User;