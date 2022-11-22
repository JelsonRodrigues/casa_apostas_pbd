import React, { Fragment, useState, useEffect } from "react";
import MyTickets from "./MyTickets";

const User = () => {

    const user_name =  localStorage.getItem("@casa_apostas/user_name");
    const house_name = localStorage.getItem("@casa_apostas/house_name");
    const user_id = localStorage.getItem("@casa_apostas/user_id");
    const house_id = localStorage.getItem("@casa_apostas/logged_house");

    const [saldo, setSaldo] = useState(0);

    const getSaldo = async () => {
        try {
            const response = await fetch("http://localhost:5000/money/" + house_id + "/" + user_id);
            if (response.ok) {
                const result = await response.json();
                if (result.erro !== undefined){
                    console.log("ERRO AO OBTER O SALDO");
                }
                setSaldo(result.saldo);
                console.log("Estado saldo:", saldo);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                <label>
                    <b>Saldo:</b> {saldo}
                </label>
            </div>
            <div className="text-center mt-4">
                <button className="btn btn-danger" onClick={() => {
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