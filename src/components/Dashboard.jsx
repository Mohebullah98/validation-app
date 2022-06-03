import React,{useEffect,useState} from "react";
import {useLocation, Link,useNavigate} from 'react-router-dom';
import axios from 'axios';
function Dashboard(props) {
  const navigate = useNavigate();
  const url ="http://localhost:3001"
  const location = useLocation();
  const [user,setUser]= useState({});
  useEffect(()=>{
    axios.get(url+"/user"+sessionStorage.getItem("session_id"),{withCredentials:true})
    .then((res)=>{
      console.log(res);
      setUser(res.data);
    })
  },[])
  console.log(sessionStorage.getItem("session_id"));
  return (
    <div>
    <div className="navBar">
    <ul className="nav">
    <li className="navItem" onClick={()=>{
      localStorage.clear();
      sessionStorage.clear();
      axios.post(url+"/logout")
      .then((res)=>{
        navigate(res.data.path);
      })
      .catch((err)=>console.log(err));
    }}>Log out</li>
    </ul>
    </div>
    <div className="dashMenu">
    <h1>Hello {user.name}!</h1>
    </div>
    </div>
  )
}
export default Dashboard;
