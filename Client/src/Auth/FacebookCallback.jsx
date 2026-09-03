import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FacebookCallback = () => {
  const navigate = useNavigate();
  // Move useRef to the component top level
  const requestSent = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code && !requestSent.current) {
      requestSent.current = true;  // Mark that we've sent the request
      
      axios
        .post("http://localhost:8080/api/auth/signInWithFacebook", { code })
        .then((res) => {
          navigate("/");
        })
        .catch((err) => {
          console.error("Login Failed:", err);
          requestSent.current = false;  // Reset if there was an error
        });
    }
  }, [navigate]); // Include navigate in the dependency array

  return <div>Signing in...</div>;
};

export default FacebookCallback;