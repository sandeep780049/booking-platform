import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { axiosClient } from "../AxiosClient/axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Store/UserSlice";
import { Loader } from "../components/Loader";

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const requestSent = useRef(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !requestSent.current) {
      requestSent.current = true; // Mark that we've sent the request
      axiosClient
        .post("/api/auth/signInWithLinkedin", { code })
        .then((res) => {
          setTimeout(() => {
            dispatch(loginSuccess(res.data.data));
          }, 40000);
          navigate("/");
        })
        .catch((err) => {
          console.error("Login Failed:", err);
          requestSent.current = false; // Reset if there was an error
        });
    }
  }, [navigate]); // Include navigate in the dependency array

  return (
    <Loader/>
  );
};

export default LinkedInCallback;
