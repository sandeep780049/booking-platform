import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../AxiosClient/axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Store/UserSlice";

const FacebookCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const requestSent = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !requestSent.current) {
      requestSent.current = true; // Mark that we've sent the request

      axiosClient
        .post("/api/auth/signInWithFacebook", { code })
        .then((res) => {
          const token = res?.data?.data?.accessToken;
          if (token) {
            localStorage.setItem("accessToken", token);
          }
          dispatch(loginSuccess(res.data.data));
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("Login Failed:", err);
          requestSent.current = false; // Reset if there was an error
          navigate("/login", { replace: true });
        });
    }
  }, [navigate, dispatch]); // Include navigate in the dependency array

  return <div>Signing in...</div>;
};

export default FacebookCallback;