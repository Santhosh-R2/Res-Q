import React, { useState } from 'react';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { toast,ToastContainer } from 'react-toastify';
import axiosInstance from '../api/baseUrl';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      toast.success("Verification code sent to email");
      setStep(2);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pass-wrapper">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="forgot-pass-card animate-fade-up">
        <button className="back-btn" onClick={() => step === 1 ? navigate('/login') : setStep(1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="forgot-pass-header">
          <div className="icon-circle">
            {step === 1 ? <FiMail /> : <FiShield  />}
          </div>
          <h1>{step === 1 ? "Forgot Password?" : "Verify Identity"}</h1>
          <p>{step === 1 
            ? "Enter your registered email to receive a 6-digit verification code." 
            : `We've sent a tactical authorization code to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="forgot-pass-form">
            <div className="tactical-input-group">
              <label>EMAIL ADDRESS</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="forgot-pass-btn" disabled={loading}>
              {loading ? <FiLoader className="spin" /> : "SEND VERIFICATION CODE"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-pass-form">
            <div className="tactical-input-group">
              <label>6-DIGIT CODE</label>
              <div className="input-wrapper">
                <FiShield className="input-icon" />
                <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength="6"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="tactical-input-group">
              <label>NEW SECURE PASSWORD</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="forgot-pass-btn" disabled={loading}>
              {loading ? <FiLoader className="spin" /> : "RESET PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;