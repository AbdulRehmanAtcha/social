// import logo from './logo.svg';
import Main from './components/content/Main';
import Login from './components/log/Login';
import Signup from './components/sign/Signup';
import axios from 'axios';
import {
  Route, Routes
} from "react-router-dom";
import { GlobalContext } from './context/Context';
import { useContext } from "react";
import { useEffect } from 'react';

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}
else {
  baseURL = `https://spring-bud-pike-coat.cyclic.app`;
}

function App() {
  let { state, dispatch } = useContext(GlobalContext);


  useEffect(() => {

    const getHome = async () => {
      try {
        let response = await axios.get(`${baseURL}/api/v1/profile`, {
          withCredentials: true
        })
        dispatch({
          type: "USER_LOGIN",
          payload: response.data
        })
        console.log("Yes Login");
      }
      catch (error) {
        console.log(error);
        console.log("no Login");
        dispatch({
          type: 'USER_LOGOUT'
        })
      }
    }
    getHome();

  }, [])
  return (
    <>
    {/* <Login /> */}
      <body>

        {
          (state.isLogin === true) ?
            <Routes>
              <Route path='/' element={<Main />} />
              <Route path='/login' element={<Login />} />
              <Route path='*' element={<Main />} />
            </Routes>
            :
            null
        }
        {
          (state.isLogin === false) ?
            <Routes>
              <Route path='/' element={<Login />} />
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='*' element={<Login />} />
            </Routes>
            :
            null
        }

        {
          (state.isLogin === null) ?
            <Routes>
              <Route path='/' element={
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", minWidth: "100vw" }}>
                  <div className="spinner-border" role="status">
                  </div>
                </div>
              } />
            </Routes>
            :
            null
        }
      </body>
    </>
  );
}

export default App;
