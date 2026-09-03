import { Modal } from 'antd';
import { ForgotPass, UpdatePass, VerifyUser } from '../Auth/UserAuth';
import React, { useState } from 'react';
import { MdEmail } from 'react-icons/md';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from '../components/ui/input-otp';
import { useNavigate } from 'react-router-dom';
export const ResetPass = () => {
  const [email, setEmail] = useState('');
  const [model, setModel] = useState(false);
  const [value, setValue] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [passModel, setPassModel] = useState(false);
  const Navigate = useNavigate();
  const verifyOtp = async () => {
    try {
      const data = { email: email, otp: value };
      const res = await VerifyUser(data);
      if (res === 200) {
        toast('OTP Verified');
        setModel(false);
        setPassModel(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          toast('Invalid OTP');
        }
      }
    }
  };
  const verify = async () => {
    try {
      const res = await ForgotPass(email);
      if (res.data.statusCode === 200) {
        toast('One-Time Password Sent to Email');
        setModel(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          toast('User Not Found');
        }
      }
    }
  };

  const update = async () => {
    const data = { email: email, password: pass };
    if (pass !== pass2) {
      toast("Both password don't matches");
      return;
    }
    const res = await UpdatePass(data);
    if (res.data.statusCode === 200) {
      toast('Password Updated Successfully');
      setPassModel(false);
      Navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CEF2FF] to-white flex flex-col justify-center items-center px-[10rem]">
      <div className="reset flex flex-col gap-3 px-5 py-4 w-full bg-white rounded-lg shadow-lg">
        <div className="title">
          <h1 className="md:text-3xl text-sm text-center font-mono">
            Reset Account Password
          </h1>
        </div>
        <div className="input flex items-center gap-2">
          <span>
            <MdEmail className="lg:text-3xl text-xl" />
          </span>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Email"
            className="border-2 border-gray-300 md:p-2 p-1 rounded-md w-full"
          />
        </div>
        {email && (
          <button
            onClick={verify}
            className="bg-black text-white md:p-2 p-1 rounded-md"
          >
            Verify Email
          </button>
        )}
      </div>
      <Modal
        open={model}
        footer={null}
        onCancel={() => {
          setModel(false);
        }}
      >
        <div className="space-y-2 flex flex-col items-center gap-4">
          <h1>
            Enter One-Time Password sent on{' '}
            <span className="text-blue-500">{email}</span>
          </h1>
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
          <button
            onClick={verifyOtp}
            className="bg-black text-white p-2 rounded-md"
          >
            Verify OTP
          </button>
        </div>
      </Modal>
      <Modal
        open={passModel}
        footer={null}
        onCancel={() => {
          setPassModel(false);
        }}
      >
        <div className="space-y-2 flex flex-col items-center gap-4">
          <input
            type="password"
            onChange={(e) => {
              setPass(e.target.value);
            }}
            placeholder="Enter New Password"
            className="border-2 border-gray-300 md:p-2 p-1 rounded-md w-full"
          />
          <input
            type="password"
            onChange={(e) => setPass2(e.target.value)}
            placeholder="Enter New Password"
            className="border-2 border-gray-300 md:p-2 p-1 rounded-md w-full"
          />
          <button
            onClick={update}
            className="bg-black text-white p-2 rounded-md"
          >
            Reset Password
          </button>
        </div>
      </Modal>
    </div>
  );
};
