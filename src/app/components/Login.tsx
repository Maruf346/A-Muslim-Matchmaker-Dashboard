import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Heart, ArrowLeft, Loader2 } from "lucide-react";
import { adminLoginStep1, adminLoginVerify } from "../api/auth";
import { ApiError } from "../api/errors";
import { isAuthenticated, saveAuthSession } from "../lib/authStorage";

function isValidEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const startResendTimer = (seconds = 60) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(seconds);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === "otp") {
      startResendTimer();
      const t = setTimeout(() => otpRefs.current[0]?.focus(), 520);
      return () => {
        clearTimeout(t);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmittingCredentials(true);
    try {
      const response = await adminLoginStep1({ email: email.trim(), password });
      startResendTimer(response.expires_in_seconds ?? 60);
      setStep("otp");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please check your credentials and try again.";
      setError(message);
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    const otpValue = otp.join("");
    if (otp.some((d) => d === "")) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await adminLoginVerify({
        email: email.trim(),
        otp: otpValue,
      });

      saveAuthSession({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        adminType: response.admin_type,
        user: response.user,
      });

      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Verification failed. Please check the code and try again.";
      setOtpError(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResendingOtp) return;

    setOtpError("");
    setIsResendingOtp(true);
    try {
      const response = await adminLoginStep1({ email: email.trim(), password });
      startResendTimer(response.expires_in_seconds ?? 60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to resend the verification code. Please try again.";
      setOtpError(message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const goBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setResendTimer(0);
    setStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-[45%] relative overflow-hidden bg-[#E8C4B8]">
        <img
          src="/cover.jpeg"
          alt="A Muslim couple"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-lg border border-white/30 rounded-full px-5 py-2.5 shadow-xl shadow-black/15">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D07C84] to-[#415192] flex items-center justify-center shrink-0">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-white text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap">
              Connecting Hearts
            </span>
          </div>
        </div>

        <div className="absolute top-[18%] left-7 z-10 pointer-events-none">
          <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-white/30 to-white/8 backdrop-blur-md border border-white/35 rounded-2xl shadow-xl shadow-black/10 rotate-6">
            <div className="absolute top-1.5 left-2 w-4 h-1.5 bg-white/55 rounded-full blur-[1px]" />
            <Heart className="w-6 h-6 text-white fill-white/75" />
          </div>
        </div>
        <div className="absolute top-[22%] right-9 z-10 pointer-events-none">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-md border border-white/30 rounded-xl shadow-lg shadow-black/10 -rotate-6">
            <div className="absolute top-1 left-1.5 w-3 h-1 bg-white/50 rounded-full blur-[1px]" />
            <Heart className="w-5 h-5 text-white fill-white/60" />
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute top-4 right-4 w-36 h-36 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-10 left-8 w-2 h-2 rounded-full bg-white/50 pointer-events-none" />
        <div className="absolute top-16 left-16 w-1.5 h-1.5 rounded-full bg-white/35 pointer-events-none" />
        <div className="absolute top-24 left-10 w-1 h-1 rounded-full bg-white/25 pointer-events-none" />
        <div className="absolute top-1/3 -left-6 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

        <div className="absolute inset-x-6 bottom-8 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl px-6 py-5 shadow-xl">
            <div className="w-8 h-[2px] bg-white/70 mb-3 rounded-full" />
            <p className="text-white text-[1.35rem] font-semibold leading-snug tracking-wide drop-shadow-sm">
              Where tradition meets<br />matrimony.
            </p>
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mt-2.5">
              A Muslim Matchmaker
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-9">
            <img
              src="/logo.png"
              alt="A Muslim Matchmaker"
              className="h-[128px] w-auto mx-auto object-contain"
            />
            <p className="text-[12px] font-bold tracking-[0.25em] text-gray-400 uppercase mt-3">
              Admin Panel
            </p>
          </div>

          <div className="relative h-[480px]">
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                step === "credentials"
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 -translate-x-8 pointer-events-none"
              }`}
            >
              <div className="mb-7">
                <h2 className="text-[1.65rem] font-bold text-gray-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  Sign in to access the admin dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="admin@matchmaker.com"
                      disabled={isSubmittingCredentials}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#415192]/25 focus:border-[#415192] transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      disabled={isSubmittingCredentials}
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#415192]/25 focus:border-[#415192] transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingCredentials}
                  className="w-full py-3 mt-1 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#415192] to-[#D07C84] hover:opacity-90 active:scale-[0.985] transition-all shadow-lg shadow-[#415192]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingCredentials && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmittingCredentials ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>

            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                step === "otp"
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 translate-x-8 pointer-events-none"
              }`}
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#415192]/10 to-[#D07C84]/10 border border-[#415192]/10 flex items-center justify-center mb-5">
                  <Mail className="w-5 h-5 text-[#415192]" />
                </div>
                <h2 className="text-[1.65rem] font-bold text-gray-900 tracking-tight">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  We sent a 6-digit verification code to
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-sm font-semibold text-[#415192] truncate">{email}</span>
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isVerifyingOtp || isResendingOtp}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 shrink-0 transition-colors disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-1.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        disabled={isVerifyingOtp}
                        className={`flex-1 min-w-0 h-11 text-center text-base font-bold border-2 rounded-lg outline-none transition-all duration-200 disabled:opacity-60 ${
                          digit
                            ? "border-[#415192] bg-[#415192]/5 text-[#415192]"
                            : "border-gray-200 bg-gray-50/50 text-gray-900"
                        } focus:border-[#415192] focus:bg-white focus:ring-2 focus:ring-[#415192]/15`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">Didn't receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0 || isResendingOtp || isVerifyingOtp}
                      className={`text-xs font-semibold transition-colors ${
                        resendTimer > 0 || isResendingOtp
                          ? "text-gray-400 cursor-default"
                          : "text-[#415192] hover:text-[#354177]"
                      }`}
                    >
                      {isResendingOtp
                        ? "Sending..."
                        : resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend OTP"}
                    </button>
                  </div>
                </div>

                {otpError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#415192] to-[#D07C84] hover:opacity-90 active:scale-[0.985] transition-all shadow-lg shadow-[#415192]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>

              <button
                type="button"
                onClick={goBack}
                disabled={isVerifyingOtp || isResendingOtp}
                className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-10">
            © {new Date().getFullYear()} A Muslim Matchmaker · All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
