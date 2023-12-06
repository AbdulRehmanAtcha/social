import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}
else {
  baseURL = `https://tiny-pink-parrot-tux.cyclic.app/`;
}

const Change = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const oldPassHandler = (e) => {
        setOldPassword(e.target.value);
    }

    const newPassHandler = (e) => {
        setNewPassword(e.target.value);
    }

    const changeHandler = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            let response = await axios.post(`${baseURL}/api/v1/changePassword`, {
                oldPassword: oldPassword,
                newPassword: newPassword
            }, {
                withCredentials: true
            })
            {<Link to='/' />}
            
            setLoading(false);
            alert("Password Change Successfully!");
            e.reset();
            // alert("Login Successful");
        }
        catch (e) {
            setLoading(false);

            console.log("Error", e);
        }
    }

    return (
        <>
            <div className='change-main'>
                {
                    (loading === true)
                        ?
                        <div className="spinner-grow text-secondary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        :
                        <div className="box">
                            <div className="head-btn">
                                <Link to="/"><button>Back To Home</button></Link>
                            </div>
                            <form onSubmit={changeHandler}>
                                <input type="password" placeholder='Current Password' onChange={oldPassHandler} autoComplete="current-password" name="current-password"/>
                                <input type="password" placeholder='New Password' onChange={newPassHandler} autoComplete="new-password" name="new-password"/>
                                <button style={{color: "black"}} type='submit'>Change Password</button>
                            </form>
                        </div>

                }


                
            </div>
        </>
    )
}

export default Change