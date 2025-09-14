import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { getAdmin, generateOTP, sendOTP, updateAdminOTP, verifyAdminOTP } from '../utils/database';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtpInput] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const admin = await getAdmin(email.toLowerCase());
    if (!admin) {
      setError('Email not found in admin records');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const generatedOTP = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
      await sendOTP(email, generatedOTP);
      await updateAdminOTP(email.toLowerCase(), generatedOTP, otpExpiry);
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
    
    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (await verifyAdminOTP(email.toLowerCase(), otp)) {
      onLogin();
    } else {
      setError('Invalid or expired OTP. Please try again.');
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const generatedOTP = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await sendOTP(email, generatedOTP);
      await updateAdminOTP(email.toLowerCase(), generatedOTP, otpExpiry);
      setError('');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-300">
            {step === 'email' ? 'Enter your admin email to receive OTP' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-gray-300 text-sm mt-2 text-center">
                  OTP sent to: {email}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpInput('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* Demo Info */}
        
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;