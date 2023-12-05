import React from "react";
import "./style.css";
import moment from "moment";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../../context/Context";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Modal, Upload, message } from "antd";
import Meta from "antd/es/card/Meta";
import { UploadOutlined } from '@ant-design/icons';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [isModal2Open, setIsModal2Open] = useState(false);
  const handleCancel2 = () => {
    setIsModal2Open(false);
  };

  const showModal2 = () => {
    setIsModal2Open(true);
  };

  const addObj = {
    description: description,
  };
  let imageUrl;
  const props = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        imageUrl = info.file.response.url;
        console.log(imageUrl, "IMG")
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const AddHandler = (e) => {
    e.preventDefault();
    var fileInput = document.getElementById("picture");
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
        allPosts();
      })
      .catch((err) => {
        setLoading(false);
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
            <Button type="primary" onClick={showModal2}>
              Add Post
            </Button>
            <Button type="primary" danger>
              Logout
            </Button>
          </div>
        </header>
        <div className="all-posts">
          {products.map((eachPost, index) => (
            <div className={eachPost?.pictureURL ? "each-post" : "each-post2"}>
              {eachPost?.pictureURL && (
                <>
                  <img src={eachPost?.pictureURL} alt="" />
                  <hr />
                </>
              )}
              <h2>
                {state?.user?.user?.firstName} {state?.user?.user?.lastName}
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
        >
          <input
            type="text"
            placeholder="New Description"
            style={{ width: "100%" }}
            onChange={editDescHandler}
          />
        </Modal>
        <Modal title="Basic Modal" open={isModal2Open} onCancel={handleCancel2}>
          <input
            type="text"
            placeholder="New Description"
            style={{ width: "100%" }}
            onChange={editDescHandler}
          />
          <input type="file" name="" id="" />
        </Modal>
      </body>
    </>
  );
};

export default Main;
