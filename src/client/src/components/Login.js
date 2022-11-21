import React,{Fragment, useState} from "react";

const Login = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitLogin = async (e) => {
        e.preventDefault();
        try {
            const body = {
                "email": email,
                "senha": password
            };
            const response = await fetch("http://localhost:5000/login", {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            console.log(response);
            if (response.ok) {
                const result = await response.json();
                if (result.erro === undefined){
                    console.log("SUCESSO AO FAZER LOGIN");
                    localStorage.clear();
                    localStorage.setItem("@casa_apostas/user_id", result.id_usuario);
                    localStorage.setItem("@casa_apostas/user_type", result.tipo);
                    localStorage.setItem("@casa_apostas/available_houses", JSON.stringify(result.houses));

                    window.location.href = window.location.href + "login";
                }
                else {
                    console.log("ERRO AO FAZER LOGIN");
                }
                console.log(result);
            }
            else {
                console.log("ERROR CONNECTING TO THE SERVER");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
    <Fragment>
        <h1 className="text-center mt-5">Login</h1>
        <form className="d-flex mt-5" onSubmit={onSubmitLogin}>
            <input type="text" className="form-control" value={email} onChange={ e => setEmail(e.target.value)}/>
            <input type="password" className="password-control" value={password} onChange={ e => setPassword(e.target.value)}/>
            <button className="btn btn-success">Login</button>
        </form>
    </Fragment>
    );
};
export default Login;