import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function VerifyOTP() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const email = location.state?.email || "";

	const [otp, setOtp] = useState("");
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (!email) {
			navigate("/signup");
		}
	}, [email, navigate]);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleVerifyOTP = async () => {
		if (otp.length !== 6) {
			showToast("Please enter a valid 6-digit OTP", "error");
			return;
		}

		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			
			const response = await axios.post(
				`${apiUrl}/api/auth/verify-otp`,
				{
					email,
					otp,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.token && response.data.user) {
				await login(response.data.token, response.data.user);
				showToast("Email verified successfully!", "success");
				setTimeout(() => {
					navigate("/dashboard");
				}, 1000);
			} else {
				showToast("Invalid response from server", "error");
			}
		} catch (err) {
			let errorMessage = "Invalid OTP";
			
			if (err.response) {
				errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
			} else if (err.request) {
				errorMessage = "Cannot connect to server. Please check if the server is running.";
			} else {
				errorMessage = err.message || "Invalid OTP";
			}
			
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleResendOTP = async () => {
		if (countdown > 0) return;

		setResendLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			await axios.post(`${apiUrl}/api/auth/resend-otp`, {
				email,
			});
			showToast("OTP sent successfully to your email", "success");
			setCountdown(60);
		} catch (err) {
			const errorMessage =
				err.response?.data?.error || err.message || "Failed to resend OTP";
			showToast(errorMessage, "error");
		} finally {
			setResendLoading(false);
		}
	};

	const handleOtpChange = (e) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		setOtp(value);
	};

	return (
		<div className="min-h-screen min-w-screen" style={{ background: '#F5F6FA' }}>
			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

			<main className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
						<div className="text-center mb-8">
							<h1 className="text-3xl font-bold text-slate-800 mb-2">
								Verify Your Email
							</h1>
							<p className="text-slate-600">
								We've sent a 6-digit OTP to
							</p>
							<p className="text-slate-800 font-semibold mt-1">{email}</p>
							<p className="text-sm text-slate-500 mt-2">
								Check your server console for OTP if email is not configured
							</p>
						</div>

						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleVerifyOTP();
							}}
						>
							<div>
								<label
									htmlFor="otp"
									className="block text-sm font-semibold text-slate-700 mb-2 text-center"
								>
									Enter OTP
								</label>
								<input
									id="otp"
									type="text"
									value={otp}
									onChange={handleOtpChange}
									placeholder="000000"
									maxLength="6"
									className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-slate-800"
								/>
							</div>

							<button
								type="submit"
								disabled={loading || otp.length !== 6}
								className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Verifying..." : "Verify OTP"}
							</button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-slate-600 mb-2">
								Didn't receive the OTP?
							</p>
							<button
								onClick={handleResendOTP}
								disabled={resendLoading || countdown > 0}
								className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{resendLoading
									? "Sending..."
									: countdown > 0
									? `Resend OTP in ${countdown}s`
									: "Resend OTP"}
							</button>
						</div>

						<div className="mt-6 text-center">
							<Link
								to="/signup"
								className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
							>
								Change email address
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
