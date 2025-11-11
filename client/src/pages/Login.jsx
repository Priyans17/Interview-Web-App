import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [validation, setValidation] = useState({
		email: "untouched",
		password: "untouched",
	});
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});

	const validateEmail = (value) => {
		if (value.trim() === "") return "empty";
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? "valid" : "invalid";
	};

	const validatePassword = (value) => {
		if (value === "") return "empty";
		return "valid";
	};

	const handleEmailChange = (value) => {
		setEmail(value);
		setValidation((prev) => ({
			...prev,
			email: validateEmail(value),
		}));
	};

	const handlePasswordChange = (value) => {
		setPassword(value);
		setValidation((prev) => ({
			...prev,
			password: validatePassword(value),
		}));
	};

	const getRingColor = (fieldValidation) => {
		switch (fieldValidation) {
			case "empty":
				return "focus:ring-blue-400 focus:border-blue-400";
			case "invalid":
				return "focus:ring-red-400 focus:border-red-400 ring-2 ring-red-400 border-red-400";
			case "valid":
				return "focus:ring-blue-500 focus:border-blue-500";
			default:
				return "focus:ring-blue-500 focus:border-blue-500";
		}
	};

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleLogin = async () => {
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		setValidation({
			email: emailValidation,
			password: passwordValidation,
		});

		if (emailValidation !== "valid" || passwordValidation !== "valid") {
			showToast("Please fill in all fields correctly", "error");
			return;
		}

		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			
			const response = await axios.post(
				`${apiUrl}/api/auth/login`,
				{
					email,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.requiresVerification) {
				showToast("Please verify your email address first", "error");
				navigate("/verify-otp", { state: { email } });
				return;
			}

			if (response.data.token && response.data.user) {
				await login(response.data.token, response.data.user);
				showToast("Logged in successfully!", "success");
				setTimeout(() => {
					navigate("/dashboard");
				}, 500);
			} else {
				showToast("Invalid response from server", "error");
			}
		} catch (err) {
			let errorMessage = "An error occurred during login";
			
			if (err.response) {
				errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
			} else if (err.request) {
				errorMessage = "Cannot connect to server. Please check if the server is running.";
			} else {
				errorMessage = err.message || "An error occurred during login";
			}
			
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
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
								Welcome Back
							</h1>
							<p className="text-slate-600">Login to your account</p>
						</div>

						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleLogin();
							}}
						>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-slate-700 mb-2"
								>
									Email address
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) =>
										handleEmailChange(e.target.value)
									}
									placeholder="Enter your email"
									className={`w-full px-4 py-3 border rounded-lg placeholder-slate-400 focus:outline-none transition-all bg-white text-slate-800 ${getRingColor(
										validation.email
									)}`}
								/>
								{validation.email === "invalid" && (
									<p className="mt-1 text-sm text-red-600">
										Please enter a valid email address
									</p>
								)}
								{validation.email === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Email is required
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-slate-700 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										value={password}
										onChange={(e) =>
											handlePasswordChange(e.target.value)
										}
										placeholder="Enter your password"
										className={`w-full px-4 py-3 pr-10 border rounded-lg placeholder-slate-400 focus:outline-none transition-all bg-white text-slate-800 ${getRingColor(
											validation.password
										)}`}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
									>
										{showPassword ? (
											<FaEyeSlash className="w-5 h-5" />
										) : (
											<FaEye className="w-5 h-5" />
										)}
									</button>
								</div>
								{validation.password === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Password is required
									</p>
								)}
								<div className="text-right mt-2">
									<Link
										to="/forgot-password"
										className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
									>
										Forgot password?
									</Link>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full text-white py-3 px-4 rounded-lg font-semibold transition-all focus:outline-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
							>
								{loading ? "Logging in..." : "Login"}
							</button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-slate-600">
								{"Don't have an account? "}
								<Link
									to="/signup"
									className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
								>
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
