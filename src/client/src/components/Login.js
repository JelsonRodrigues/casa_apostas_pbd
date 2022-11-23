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
                    localStorage.setItem("@casa_apostas/user_name", result.nome_completo);
                    
                    window.location.href = window.location.href + "login";
                }
                else {
                    console.log("ERRO AO FAZER LOGIN");
                    document.getElementById("emailHelp").textContent = "Credenciais incorretas";
                    document.getElementById("emailHelp").style.color = "red";
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
        <div className='container'>
            <h1 className="text-center mt-5">Apostas PBD</h1>
        </div>
        <h2 className="text-center mt-5">Login</h2>
        <div className="container">
            <form className="d-flex mt-5" onSubmit={onSubmitLogin}>
                <div className="form-control">
                    <div className="form-group">
                        <label>Endereço de email</label>
                        <input type="text" className="form-control" placeholder="Seu email" value={email} onChange={ e => setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text">Nunca vamos compartilhar seu email, com ninguém.</small>
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <br/>
                        <input type="password" className="password-control" placeholder="Sua senha" value={password} onChange={ e => setPassword(e.target.value)}/>
                    </div>
                    <button type="submit" className="btn btn-success mt-2">Login</button>
                </div>
            </form>
        </div>
    </Fragment>
    );
};
export default Login;