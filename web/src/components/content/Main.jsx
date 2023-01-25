import React from "react";
import "./style.css";
import moment from "moment";
import { useContext } from "react";
import { Link } from 'react-router-dom';
import { GlobalContext } from "../../context/Context";
import { useState, useEffect } from "react";
import axios from "axios";
let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
} else {
  baseURL = `https://nervous-pocketbook-dog.cyclic.app`;
}
const Main = () => {
  axios.defaults.withCredentials = true;
  let { state, dispatch } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const addObj = {
    description: description,
  };

  const AddHandler = (e) => {
    e.preventDefault();
    // console.log(description);
    var fileInput = document.getElementById("picture");
    // console.log("Post Piture: ", fileInput.files[0]);
    let formData = new FormData();
    formData.append("myFile", fileInput.files[0]);
    formData.append("description", addObj.description);
    setLoading(true);

    axios({
      method: "post",
      url: `${baseURL}/api/v1/product`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setLoading(false);
        console.log("response: ", res.data);
        allPosts();
      })
      .catch((err) => {
        setLoading(false);
        console.log("error: ", err);
      });

    // axios
    //   .post(`${baseURL}/api/v1/product`, addObj)
    //   .then((response) => {
    //     setLoading(false);
    //     console.log("response: ", response.data);
    //     allPosts();
    //   })
    //   .catch((err) => {
    //     setLoading(false);
    //     console.log("error: ", err);
    //   });
  };

  const allPosts = async () => {
    setLoading(true);

    try {
      setLoading(false);
      const response = await axios.get(`${baseURL}/api/v1/products`);
      console.log("Got All Products", response.data.data);
      setProducts(response.data.data);
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
    }
  };

  useEffect(() => {
    allPosts();
    // console.log(state.user)
  }, []);

  const deletProduct = async (id) => {
    setLoading(true);

    try {
      setLoading(false);
      const response = await axios.delete(`${baseURL}/api/v1/product/${id}`);
      console.log("Got All Products", response.data.data);
      allPosts();
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
    }
  };

  const editDescHandler = (e) => {
    setEditDesc(e.target.value);
  };

  const updateHandler = (event) => {
    event.preventDefault();
    let newDesc = editDesc;
    setLoading(true);
    axios
      .put(`${baseURL}/api/v1/product/${editId}`, {
        description: newDesc,
      })
      .then(
        (response) => {
          setLoading(false);

          console.log(response);
          allPosts();
        },
        (error) => {
          setLoading(false);

          console.log(error);
        }
      );
  };
  const editHandler = async (e) => {};

  const logoutHandler = async () => {
    try {
      let response = await axios.post(`${baseURL}/api/v1/logout`, {
        withCredentials: true,
      });
      console.log("res", response);
      dispatch({
        type: "USER_LOGOUT",
      });
    } catch (e) {
      console.log("e: ", e);
    }
  };

  return (
    <>
      <header>
        <nav>
          <div className="nav-left">
            <h2>New Social</h2>
          </div>
          <div className="nav-mid">
            <input
              type="text"
              placeholder="Search For Friend, Post or any Video"
            />
          </div>
          <div className="nav-right">
            <Link to='/changePassword'><button className="btn btn-success">Change Password</button></Link>
            <button
              type="button"
              onClick={logoutHandler}
              className="btn btn btn-danger btn-sm"
            >
              Logout
            </button>

          </div>
        </nav>
      </header>
      {loading === true ? (
        <div className="loader">
          <div className="spinner-grow text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="main">
          <div className="main-left"></div>
          <div className="main-mid">
            <div className="head-box">
              <form onSubmit={AddHandler}>
                <textarea
                  cols="80"
                  rows="4"
                  required
                  minLength="3"
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                ></textarea>
                <br />
                <input type="file" accept="image/*" id="picture" />
                <br />
                {/* <br /> */}
                <button type="submit">Post</button>
              </form>
            </div>
            <br />
            <br />
            <div className="all-posts">
              {products.map((eachProduct, i) => (
                <div
                  className="post"
                  key={i}
                  style={{
                    backgroundColor: "white",
                    width: "730px",
                    minHeight: "75px",
                    borderRadius: "8px",
                  }}
                >
                  {/* {state?.user?.firstName} {state?.user?.lastName} */}
                  <h2>
                    {state?.user?.user?.firstName === undefined
                      ? state?.user?.firstName
                      : state?.user?.user?.firstName}{" "}
                    {state?.user?.user?.lastName === undefined
                      ? state?.user?.lastName
                      : state?.user?.user?.lastName}
                  </h2>
                  <hr />
                  <p>{moment(eachProduct.createdOn).fromNow()}</p>
                  <hr />
                  <h2>{eachProduct.description}</h2>
                  {eachProduct.pictureURL === undefined ||
                  eachProduct.pictureURL === null ||
                  eachProduct.pictureURL === "" ? null : (
                    <img
                      src={eachProduct.pictureURL}
                      style={{
                        width: "100%",
                        height: "300px",
                      }}
                    />
                  )}
                  <br />
                  <br />
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop"
                    onClick={() => {
                      editHandler(setEditId(eachProduct._id));
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      deletProduct(eachProduct._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="main-right"></div>
          <div
            className="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="staticBackdropLabel">
                    Edit Form
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={updateHandler}>
                    <textarea
                      cols="60"
                      rows="4 "
                      onChange={editDescHandler}
                    ></textarea>
                    <br />
                    <button
                      data-bs-dismiss="modal"
                      className="btn btn-dark"
                      type="submit"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Main;
