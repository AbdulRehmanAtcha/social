import React from 'react';
import './style.css';
import { GlobalContext } from '../../context/Context';
import { useState, useContext } from "react";
import axios from 'axios';
import { NavLink } from 'react-router-dom';

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}
else {
  baseURL = `https://tiny-pink-parrot-tux.cyclic.app/`;
}

const Login = () => {
  let { state, dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // const [fName, setFname] = useState("");
  // const [lName, setLname] = useState("");

  const emailHandler = (e) => {
    setEmail(e.target.value);
  }
  const passHandler = (e) => {
    setPassword(e.target.value);
  }

  const loginHandler = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      let response = await axios.post(`${baseURL}/api/v1/login`, {
        email: email,
        password: password
      }, {
        withCredentials: true
      })
      dispatch({
        type: "USER_LOGIN",
        payload: response.data.profile
      })
      // setFname(response.data.data.firstName)
      // console.log(fName)
      // console.log(state)
      setLoading(false);
      // alert("Login Successful");
    }
    catch (e) {
      setLoading(false);

    }
  }
  return (
    <div className='main-login'>
      {
        (loading === true) ?
          <div className="spinner-grow text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          :
          <div div className="login" >
            <h2>LOGIN</h2>
            <form onSubmit={loginHandler}>
              <input type="email" placeholder='Email' name="email" onChange={emailHandler} autoComplete="on" />
              <input type="password" placeholder='Password' onChange={passHandler} />
              <button type='submit'>Login</button>
            </form>
            <h3 style={{color: "#717683"}}>Don't Have An Account? <span><NavLink to="/signup">Click Here</NavLink></span></h3>
          </div>
      }
    </div>
  )
}

export default Login



