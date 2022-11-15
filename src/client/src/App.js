import './App.css';
import React,{Fragment} from 'react';

// Components
import Login from "./components/Login";

function App() {
  return (
    <Fragment>
      <div className='container'>
        <Login />
      </div>
    </Fragment>
  );
}

export default App;
