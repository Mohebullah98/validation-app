import React, {useState} from "react";
import { Link ,useNavigate} from "react-router-dom";
import {MdErrorOutline} from 'react-icons/md';
import axios from "axios";
function Signup() {
  const navigate = useNavigate();
  const url ="http://localhost:3001"
  const [user,setUser] = useState({
    username:"",
    password:"",
    name:""
  });
  const [confirmation,setConfirmation]= useState("");
  const [passError,setPassError]= useState("");
  function handleConfirmation(event){
    setConfirmation(event.target.value);
  }
  const [visibility,setVisibility]=useState("none");
  function handleInput(event){
    const{name,value} = event.target;
    setUser((prevValue)=>{
      return{
        ...prevValue,
        [name]:value
      };
    });
  }
  function handleValidation(){
    let formIsValid=true;
    if(user.name==="") formIsValid=false;
    if (typeof user.username !== "undefined") {
      let lastAtPos = user.username.lastIndexOf("@");
      let lastDotPos = user.username.lastIndexOf(".");
      if (
        !(
          lastAtPos < lastDotPos &&
          lastAtPos > 0 &&
          user.username.indexOf("@@") === -1 &&
          lastDotPos > 2 &&
          user.username.length - lastDotPos > 2
        )
      ) {
        formIsValid = false;
      }
    }
    if(user.password==="") formIsValid=false;
    let pass =/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,20})/
    if(!user.password.match(pass)) formIsValid=false;
    return formIsValid;
  }
  sessionStorage.setItem("session_id","");
  return (
    <div className="container">
      <h1>Create an account</h1>
      <form onSubmit={e=>e.preventDefault()}>
      <span className="error" style ={{display:visibility}}><MdErrorOutline />An account with that Email already exists.</span>
        <label style={{display:"block"}}>Email</label>
        <input name ="username" type ="email"placeholder="Email" onChange={handleInput} value={user.username} required />
        <input name ="name" placeholder="Name" onChange={handleInput} value={user.name} required />
        <input name ="password" placeholder="Password" type="password" onChange={handleInput} value={user.password} pattern="((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,20})" title="Must be between 8-20 characters with atleast 1 lowercase, 1 capital, 1 number and 1 special character." required />
        <span className="errorPassword">{passError}</span>
        <label>Confirm Password</label>
        <input placeholder="Password" type="password" onChange={handleConfirmation} value={confirmation} required />
        <button type="submit" onClick={()=>{
          if(handleValidation()===false)return;
          axios.post(url+"/register",user)
          .then((res)=>{
            console.log(res);
            if(res.data==="/Signup"|| confirmation!==user.password){
              if(res.data==="/Signup") setVisibility("inline-block");
              if(confirmation!==user.password) setPassError("Passwords don't match");
            }
            else {
              sessionStorage.setItem("session_id",'/'+user.username);
              navigate(res.data,{state:{username:user.username,name:user.name}});
            }
          })
          .catch((err)=>console.log(err))
          console.log(user)
        }}>Register</button>
          </form>
        <a href= {url+"/auth/google"}><button type ="button" className="google" onClick={()=>{
        }}>
          <i className="fab fa-google"></i> Sign up with Google
      </button></a>

        <button type ="button" className="facebook">
          <i className="fab fa-facebook-f"></i> Sign up with Facebook
        </button>
      <footer>
        <p>
          Already have an account? <Link to="/"> Login here</Link>
        </p>
      </footer>
    </div>
  );
}
export default Signup;
