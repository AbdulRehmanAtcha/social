import React from "react";
import "./style.css";
import { useContext } from "react";
import { GlobalContext } from "../../context/Context";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal,  } from "antd";
import { Dna } from "react-loader-spinner";

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
} else {
  baseURL = `https://tiny-pink-parrot-tux.cyclic.app/`;
}
const Main = () => {
  axios.defaults.withCredentials = true;
  let { state, dispatch } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const addObj = {
    description: description,
  };

  const AddHandler = (e) => {
    e.preventDefault();
    var fileInput = document.getElementById("imageInput");
    let formData = new FormData();
    formData.append("myFile", fileInput.files[0]);
    formData.append("description", addObj.description);
    setLoading(true);
    console.log(addObj, "FORM");
    setDescription("");
    fileInput.value = "";

    axios({
      method: "post",
      url: `${baseURL}/api/v1/product`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setLoading(false);
        allPosts();
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const allPosts = async () => {
    setLoading(true);

    try {
      setLoading(false);
      const response = await axios.get(`${baseURL}/api/v1/products`);
      setProducts(response.data.data);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    allPosts();
  }, []);

  const deletProduct = async (id) => {
    setLoading(true);

    try {
      setLoading(false);
      const response = await axios.delete(`${baseURL}/api/v1/product/${id}`);
      allPosts();
    } catch (error) {
      setLoading(false);
    }
  };

  const editDescHandler = (e) => {
    setEditDesc(e.target.value);
  };

  const updateHandler = (event) => {
    event.preventDefault();
    let newDesc = editDesc;
    setIsModalOpen(false);
    setLoading(true);
    axios
      .put(`${baseURL}/api/v1/product/${editId}`, {
        description: newDesc,
      })
      .then(
        (response) => {
          setLoading(false);
          allPosts();
        },
        (error) => {
          setLoading(false);
        }
      );
  };
  const editHandler = (e) => {
    setIsModalOpen(true);
  };

  const logoutHandler = async () => {
    try {
      let response = await axios.post(`${baseURL}/api/v1/logout`, {
        withCredentials: true,
      });
      dispatch({
        type: "USER_LOGOUT",
      });
    } catch (e) {}
  };

  return (
    <>
      <body>
        <header>
          <h2>New Social</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button type="primary" danger onClick={logoutHandler}>
              Logout
            </Button>
          </div>
        </header>
        {loading ? (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Dna
              visible={true}
              height="80"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
            />
          </div>
        ) : (
          <>
            <div className="form-container" onSubmit={AddHandler}>
              <form className="your-form">
                <label htmlFor="textArea">Your Message:</label>
                <textarea
                  id="textArea"
                  name="message"
                  rows="4"
                  placeholder="Type your message here..."
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  value={description}
                />

                <label htmlFor="imageInput" className="image-input-label">
                  <span>Choose an Image</span>
                  <input
                    type="file"
                    id="imageInput"
                    name="imageInput"
                    accept="image/*"
                  />
                </label>

                <button type="submit">Submit</button>
              </form>
            </div>
            <div className="all-posts">
              {products.map((eachPost, index) => (
                <div
                  className={eachPost?.pictureURL ? "each-post" : "each-post2"}
                >
                  {eachPost?.pictureURL && (
                    <>
                      <img src={eachPost?.pictureURL} alt="" />
                      <hr />
                    </>
                  )}
                  <h2>
                    {state?.user?.user?.firstName === undefined
                      ? state?.user?.firstName
                      : state?.user?.user?.firstName}
                    {state?.user?.user?.lastName === undefined
                      ? state?.user?.lastName
                      : state?.user?.user?.lastName}
                  </h2>
                  <hr />
                  <p>{eachPost?.description}</p>
                  <div style={{ display: "flex", columnGap: "10px" }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        editHandler(setEditId(eachPost._id));
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      type="primary"
                      danger
                      onClick={() => {
                        deletProduct(eachPost._id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Modal
              title="Edit"
              open={isModalOpen}
              onOk={updateHandler}
              onCancel={handleCancel}
              footer={[
                <Button key="ok" type="primary" onClick={updateHandler}>
                  OK
                </Button>,
              ]}
            >
              <input
                type="text"
                placeholder="New Description"
                style={{ width: "100%" }}
                onChange={editDescHandler}
              />
            </Modal>
          </>
        )}
      </body>
    </>
  );
};

export default Main;
