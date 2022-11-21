import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";

import Login from "./components/Login";
import ChooseLogin from "./components/ChooseLogin";

const AppRoutes = () => {
   return(
       <BrowserRouter>
            <Routes>
                <Route component = { Login } path="/" element={<Login />} exact />  
                <Route component = { ChooseLogin } path="/login" element={<ChooseLogin />} />
            </Routes>
       </BrowserRouter>
   );
};

export default AppRoutes;