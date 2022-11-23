import React, { Fragment } from "react";

const ChooseLogin = () => {

    const availableHouses = JSON.parse(localStorage.getItem("@casa_apostas/available_houses"));
    const user_type = localStorage.getItem("@casa_apostas/user_type");

    console.log("id usuario ", localStorage.getItem("@casa_apostas/user_id"));
    console.log("nome completo: ", localStorage.getItem("@casa_apostas/user_name"))
    console.log("tipo usuario ", localStorage.getItem("@casa_apostas/user_type"));
    console.log("casas", JSON.parse(localStorage.getItem("@casa_apostas/available_houses")));
    
    const accessHouse = (house_id, house_name) => {
        localStorage.setItem("@casa_apostas/logged_house", house_id);
        localStorage.setItem("@casa_apostas/house_name", house_name);
        localStorage.removeItem("@casa_apostas/available_houses");

        if (user_type == 0) {
            window.location.href = window.location.href + "/user";
        }
        else if (user_type == 1) {
            window.location.href = window.location.href + "/admin";
        }
    }

    return (
        <Fragment>
            <h1 className="text-center mt-5">Escolher casa para entrar</h1>
            <table className="table text-center mt-5">
                <thead>
                    <tr>
                        <th>Nome da Casa</th>
                        <th>Acessar</th>
                    </tr>
                </thead>
                <tbody>
                    {availableHouses.map(house => (
                        <tr key = {house.id_casa_aposta}>
                            <td>{house.nome}</td>
                            <td>
                                <button 
                                    className="btn btn-success" 
                                    onClick={() => accessHouse(house.id_casa_aposta, house.nome)}>
                                    Acessar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
    );
};


export default ChooseLogin;