import React from 'react';
import './style.css';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}
else {
  baseURL = `https://tiny-pink-parrot-tux.cyclic.app/`;
}

const Signup = () => {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const fNameHandler = (e) => {
    setFName(e.target.value);
  }
  const lNameHandler = (e) => {
    setLName(e.target.value);
  }
  const emailHandler = (e) => {
    setEmail(e.target.value);
  }
  const passHandler = (e) => {
    setPassword(e.target.value);
  }
  const signupHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response = await axios.post(`${baseURL}/api/v1/signup`, {
        firstName: fName,
        lastName: lName,
        email: email,
        password: password
      }, {
        withCredentials: true
      })
      setLoading(false)
      alert("Signup Successful")

    }
    catch (error) {
      setLoading(false);
      {error.response.data.message && alert(error.response.data.message)}

    }
  }

  return (
    <div className='main-signup'>
      {
        (loading === true) ?
          <div className="spinner-grow text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          :
          <>
            <div className="signup">
              <h2>Sign Up</h2>
              <form onSubmit={signupHandler}>
                <input type="text" placeholder='First Name' name="firstName" onChange={fNameHandler} />
                <input type="text" placeholder='Last Name' name="lastName" onChange={lNameHandler} />
                <input type="email" placeholder='Email' name="email" onChange={emailHandler} />
                <input type="password" placeholder='Password' onChange={passHandler} />
                <button type='submit'>Create Account</button>
              </form>
              <h3>Already Have An Account? <span><NavLink to="/">Click Here</NavLink></span></h3>
            </div>
          </>
      }
    </div>
  )
}

export default Signup
