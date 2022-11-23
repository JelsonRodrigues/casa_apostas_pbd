import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";

import Login from "./components/Login";
import ChooseLogin from "./components/ChooseLogin";
import User from "./components/User";
import Admin from "./components/Admin";
import TicketView from "./components/TicketView";
import CreateTicket from "./components/CreateTicket";

const AppRoutes = () => {
   return(
       <BrowserRouter>
            <Routes>
                <Route component = { Login } path="/" element={<Login />} exact />  
                <Route component = { ChooseLogin } path="/login" element={<ChooseLogin />} />
                <Route component = { Admin } path="/login/admin" element={<Admin />} />
                <Route component = { User } path="/login/user" element={<User />} />
                <Route component = { TicketView } path="/view/ticket" element={<TicketView />} />
                <Route component = { CreateTicket } path="/new/ticket" element={<CreateTicket />} />
            </Routes>
       </BrowserRouter>
   );
};

export default AppRoutes;