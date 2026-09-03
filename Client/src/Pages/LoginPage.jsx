import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Eye, EyeClosed, Lock, Mail, Phone, User, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { GoogleLoginSuccess, ResendOtp, UserLogin, UserRegister, VerifyUser } from "../Auth/UserAuth";
import { Checkbox, Modal } from "antd";
import {
  InputOTPSlot,
  InputOTP,
  InputOTPGroup,
} from "../components/ui/input-otp";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaGoogle, FaLinkedinIn, FaFacebookF } from "react-icons/fa";
import { useAuth } from "./AuthProvider";
import { Loader } from "../components/Loader";

export default function LoginPage() {
  document.title = "Adventure Login"
  const dispatch = useDispatch();
  const location = useLocation();
  const [viewPassword, setViewPassword] = useState(false);
  const [usingPhone, setUsingPhone] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const paramAction = searchParams.get('action') || location?.state?.action;
  const paramRole = searchParams.get('role') || location?.state?.role || 'explorer';
  // Capture redirect URL from query param and persist it so the post-login effect can use it
  const paramRedirect = searchParams.get('redirect') || location?.state?.redirect;

  const [signup, setSignup] = useState(() => paramAction === 'signup');
  const [role, setRole] = useState(() => paramRole);

  // Store redirect URL in localStorage as early as possible so AuthProvider's
  // effect can pick it up even after a hard navigation (e.g. OAuth flow)
  useEffect(() => {
    if (paramRedirect) {
      localStorage.setItem('redirectAfterLogin', paramRedirect);
    }
  }, [paramRedirect]);
  const { register, handleSubmit, reset } = useForm();
  const [openOtp, setopenOtp] = useState(false);
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setloader] = useState(false);
  const [otpLoader, setOtpLoader] = useState(false);
  const { user, loading } = useAuth();
  const Navigate = useNavigate();

  const getErrorMessage = (error, defaultMessage = "An error occurred") => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  };

  const onSubmit = async (data) => {
    // Validate form data before submission
    if (!validateFormData(data)) {
      return;
    }

    // If signing up as instructor or hotel, redirect to their registration pages
    if (signup && (role === 'instructor' || role === 'hotel')) {
      if (role === 'instructor') {
        Navigate('/instructor/register', { state: { role: 'instructor' } });
      } else if (role === 'hotel') {
        Navigate('/hotel/register', { state: { role: 'hotel' } });
      }
      return;
    }

    setloader(true);
    try {
      if (signup) {
        setEmail(data.email);
        const registrationData = { ...data, role };
        const res = await UserRegister(registrationData);

        if (res.success) {
          setopenOtp(true);
          toast.success("Registration successful! Please check your email for verification.");
          reset();
        }
      } else {
        const res = await UserLogin(data, dispatch);
        setEmail(data.email);

        if (res.success) {
          toast.success("Welcome back!");
        }
      }
    } catch (err) {
      const statusCode = err?.response?.status;
      const errorMessage = getErrorMessage(err);

      if (statusCode === 403) {
        toast.warning("Account not verified. Please check your email.");
        setEmail(data.email || data.phone);
        setopenOtp(true);
        try {
          await ResendOtp(data.email || data.phone);
          toast.info("Verification code sent to your email.");
        } catch (resendErr) {
          toast.error(getErrorMessage(resendErr, "Failed to resend verification code."));
        }
      } else if (!err?.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setloader(false);
    }
  };
  const verifyOtp = async () => {
    if (!value || value.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setOtpLoader(true);
    try {
      const data = { email, otp: value };
      const res = await VerifyUser(data, dispatch);

      if (res.success) {
        toast.success("Email verified successfully! Welcome aboard.");
        setopenOtp(false);
        setValue("");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Verification failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setOtpLoader(false);
    }
  };

  const handleModeSwitch = () => {
    const next = !signup;
    setSignup(next);
    reset(); // Clear form data
    setValue(""); // Clear OTP
    setEmail(""); // Clear email
    setopenOtp(false); // Close OTP modal if open
    // If switching into sign up mode, prefer role from query param if present
    if (next) {
      const params = new URLSearchParams(location.search);
      const r = params.get('role') || location?.state?.role;
      if (r) setRole(r);
    }
  };

  const cancel = () => {
    setopenOtp(false);
    setValue("");
    setEmail("");
  };

  const validateFormData = (data) => {
    if (!data.email || !data.email.trim()) {
      toast.error("Email is required.");
      return false;
    }

    if (!data.password || !data.password.trim()) {
      toast.error("Password is required.");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    // Password validation for signup
    if (signup) {
      if (data.password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }

      if (!data.name || !data.name.trim()) {
        toast.error("Name is required for registration.");
        return false;
      }

      if (data.confirmPassword !== data.password) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const onGoogleLoginSucces = async (response) => {
    try {
      const res = await GoogleLoginSuccess(response, dispatch);
      if (res?.success) {
        toast.success("Welcome back!");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Google sign-in failed. Please try again.");
      toast.error(errorMessage);
    }
  };


  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email not found. Please try again.");
      return;
    }

    try {
      toast.loading("Sending verification code...", { id: "resend-otp" });
      await ResendOtp(email);
      toast.success("Verification code sent!", { id: "resend-otp" });
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Failed to send verification code.");
      toast.error(errorMessage, { id: "resend-otp" });
    }
  };

  const linkedInLogin = () => {
    try {
      if (!import.meta.env.VITE_LINKEDIN_CLIENT_ID) {
        toast.error("LinkedIn sign-in is not configured.");
        return;
      }

      const REDIRECT_URI = "http://localhost:5173/auth/signInWithLinkedin";
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${import.meta.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;
      window.location.href = authUrl;
    } catch (err) {
      toast.error("LinkedIn sign-in failed. Please try again.");
    }
  };

  const facebookLogin = () => {
    try {
      if (!import.meta.env.VITE_FACEBOOK_CLIENT_ID) {
        toast.error("Facebook sign-in is not configured.");
        return;
      }

      const REDIRECT_URI = "http://localhost:5173/auth/signInWithFacebook";
      const authUrl = `https://www.facebook.com/v11.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state="{st=state123abc,ds=123456789}"&scope=email,public_profile&response_type=code`;
      window.location.href = authUrl;
    } catch (err) {
      toast.error("Facebook sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    if (user.user !== null && !loading) {
      localStorage.setItem("accessToken", user.user.refreshToken);

      // Admins always go to /admin — never follow redirectAfterLogin
      if (user.user.role === "admin") {
        Navigate("/admin");
        return;
      }

      // For every other role, honour the redirect URL if one was stored
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin) {
        localStorage.removeItem("redirectAfterLogin");
        Navigate(redirectAfterLogin);
        return;
      }

      // Default role-based navigation
      if (user.user.role === "hotel") {
        Navigate("/hotel");
      } else if (user.user.role === "instructor") {
        Navigate("/instructor/dashboard");
      } else {
        // explorer and any other role
        Navigate("/browse");
      }
    }
  }, [user, loading, Navigate]);

  // If the page was opened with action=signup for instructor/hotel, redirect immediately to their registration pages
  useEffect(() => {
    if (signup && (role === 'instructor' || role === 'hotel')) {
      if (role === 'instructor') Navigate('/instructor/register', { state: { role: 'instructor' } });
      if (role === 'hotel') Navigate('/hotel/register', { state: { role: 'hotel' } });
    }
  }, [signup, role, Navigate]);

  // Use the official GoogleLogin component (returns a credential via response.credential)

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 w-full h-screen overflow-hidden -z-50 bg-black">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://dazzling-chaja-b80bdd.netlify.app/video.mp4" type="video/mp4" />
        </video>
      </div>

      <button
        onClick={() => Navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="w-full max-w-md relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <Modal
            open={openOtp}
            footer={null}
            onCancel={cancel}
            transitionName=""
            maskTransitionName=""
            animation={false}
            centered
          >
            <div className="space-y-6 flex flex-col items-center py-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
              </div>

              <InputOTP
                maxLength={6}
                value={value}
                onChange={(value) => setValue(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div className="w-full space-y-3">
                <button
                  onClick={verifyOtp}
                  disabled={value.length !== 6 || otpLoader}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {otpLoader ? <Loader btn={true} /> : "Verify Code"}
                </button>
                <button
                  onClick={handleResendOtp}
                  type="button"
                  disabled={otpLoader}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:text-gray-400"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </div>
          </Modal>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {signup ? "Create Account" : "Welcome Back"}
            </h1>
            {signup && role && (
              <p className="text-sm text-white/60">
                Signing up as {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="group">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                    {usingPhone ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  {usingPhone ? (
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      {...register("phone", { required: signup })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                  ) : (
                    <input
                      type="email"
                      placeholder="Email Address"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address"
                        }
                      })}
                      autoComplete="email"
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setUsingPhone(!usingPhone)}
                  className="mt-2 text-xs text-white/60 hover:text-white/80 transition-colors"
                >
                  {usingPhone ? "Use email instead" : "Use phone instead"}
                </button>
              </div>

              {signup && (
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    {...register("name", {
                      required: signup ? "Name is required" : false,
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                      }
                    })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={viewPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: signup ? {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    } : undefined
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setViewPassword(!viewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {viewPassword ? <Eye className="w-5 h-5" /> : <EyeClosed className="w-5 h-5" />}
                </button>
              </div>

              {signup && (
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={viewPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    {...register("confirmPassword", {
                      required: signup ? "Please confirm your password" : false,
                      validate: signup ? (value) => {
                        const password = document.querySelector('input[name="password"]').value;
                        return value === password || "Passwords do not match";
                      } : undefined
                    })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                </div>
              )}

              {signup && (
                <div className="space-y-2">
                  <Checkbox className="text-white/80 text-sm [&_.ant-checkbox-inner]:border-white/40 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-white [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-white">
                    <span className="text-white/80 text-sm ml-2">
                      I agree to the{" "}
                      <a href="/terms" className="text-white hover:text-white/80 underline transition-colors">
                        Terms of Service
                      </a>
                    </span>
                  </Checkbox>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              {!signup && (
                <button
                  type="button"
                  onClick={() => Navigate('/reset')}
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loader}
              className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:bg-white/50 disabled:cursor-not-allowed"
            >
              {loader ? <Loader btn={true} /> : signup ? "Create Account" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleModeSwitch}
              className="w-full text-center text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              {signup ? (
                <>Already have an account? <span className="text-white font-medium">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="text-white font-medium">Sign Up</span></>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <span className="text-sm text-white/60">Or continue with</span>
            </div>

            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <div className="space-y-3">
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all"
                  >
                    <FaGoogle className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Continue with Google</span>
                  </button>
                  <div className="absolute inset-0">
                    <GoogleLogin
                      onSuccess={onGoogleLoginSucces}
                      onError={() => {
                        toast.error("Google sign-in failed. Please try again.");
                      }}
                      containerProps={{
                        style: {
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          inset: 0,
                          opacity: 0
                        }
                      }}
                    />
                  </div>
                </div>

                {(role === 'instructor' || role === 'hotel') ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={linkedInLogin}
                      className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all"
                    >
                      <FaLinkedinIn className="w-4 h-4 text-white" />
                      <span className="text-sm font-medium text-white">LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={facebookLogin}
                      className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all"
                    >
                      <FaFacebookF className="w-4 h-4 text-white" />
                      <span className="text-sm font-medium text-white">Facebook</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={facebookLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all"
                  >
                    <FaFacebookF className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Continue with Facebook</span>
                  </button>
                )}
              </div>
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
