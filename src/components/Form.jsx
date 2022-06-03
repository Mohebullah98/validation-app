import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {MdErrorOutline} from 'react-icons/md';
import axios from "axios";
function Form() {
  const navigate = useNavigate();
  const url = "http://localhost:3001"
  const [user, setUser] = useState({username: "", password: ""});
  const [visibility, setVisibility] = useState("none");
  function handleInput(event) {
    const {name, value} = event.target;
    setUser((prevValue) => {
      return {
        ...prevValue,
        [name]: value
      };
    });
  }
  sessionStorage.setItem("session_id", "");
  return (<div className="container">
    <h1>Welcome</h1>
    <form onSubmit={e => e.preventDefault()}>
      <span className="error" style={{display:visibility}}><MdErrorOutline/>
        Username and Password don't match</span>
      <input name="username" onChange={handleInput} placeholder="Email" required="required"/>
      <input name="password" onChange={handleInput} placeholder="Password" type="password" required="required"/>
      <button type="submit" onClick={() => {
          axios.post(url + "/login", user).then((res) => {
            console.log(res);
            if (res.data === "failure") {
              console.log("you failed");
              setVisibility("inline-block");
            } else {
              localStorage.setItem("isAuthenticated", "true");
              sessionStorage.setItem("session_id", '/' + user.username);
              navigate(res.data.path, {
                state: {
                  username: user.username,
                  name: res.data.name
                }
              });

            }
          }).catch((err) => console.log(err));console.log(user)
        }}>Login</button>
    </form>
    <a href={url + "/auth/google"}>
      <button type="button" className="google" onClick={() => {}}>
        <i className="fab fa-google"></i>
        Sign in with Google
      </button>
    </a>
    <a href={url + "/auth/facebook"}>
      <button className="facebook">
        <i className="fab fa-facebook-f"></i>
        Sign in with Facebook
      </button>
    </a>
    <footer>
      <p>
        Don't have an account?&nbsp;
        <Link to="/Signup">
        Register here</Link>
      </p>
    </footer>
  </div>);
}
export default Form;
