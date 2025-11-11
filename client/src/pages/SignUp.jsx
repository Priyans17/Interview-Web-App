import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "../components/Toast";
import axios from "axios";

export default function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [validation, setValidation] = useState({
		name: "untouched",
		email: "untouched",
		password: "untouched",
	});
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const [passwordStrength, setPasswordStrength] = useState("");

	const navigate = useNavigate();

	const validateName = (value) => {
		if (value.trim() === "") return "empty";
		if (value.trim().length < 2) return "invalid";
		return "valid";
	};

	const validateEmail = (value) => {
		if (value.trim() === "") return "empty";
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? "valid" : "invalid";
	};

	const validatePassword = (value) => {
		if (value === "") return "empty";
		if (value.length < 6) return "invalid";
		return "valid";
	};

	const calculatePasswordStrength = (value) => {
		let strength = "Weak";
		let strengthScore = 0;

		if (value.length >= 6) strengthScore++;
		if (/[A-Z]/.test(value)) strengthScore++;
		if (/[0-9]/.test(value)) strengthScore++;
		if (/[^A-Za-z0-9]/.test(value)) strengthScore++;

		if (strengthScore >= 4) strength = "Strong";
		else if (strengthScore >= 2) strength = "Medium";

		return strength;
	};

	const handleNameChange = (value) => {
		setName(value);
		setValidation((prev) => ({
			...prev,
			name: validateName(value),
		}));
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
		setPasswordStrength(calculatePasswordStrength(value));
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

	const handleSignUp = async () => {
		const nameValidation = validateName(name);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		setValidation({
			name: nameValidation,
			email: emailValidation,
			password: passwordValidation,
		});

		if (
			nameValidation !== "valid" ||
			emailValidation !== "valid" ||
			passwordValidation !== "valid"
		) {
			showToast("Please fill in all fields correctly", "error");
			return;
		}

		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			
			const response = await axios.post(
				`${apiUrl}/api/auth/signup`,
				{
					name,
					email,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			showToast(
				response.data.message || "Account created! Please check your email for OTP.",
				"success"
			);
			
			if (response.data.otp) {
				console.log("OTP CODE:", response.data.otp);
			}
			
			setTimeout(() => {
				navigate("/verify-otp", { state: { email } });
			}, 1500);
		} catch (err) {
			let errorMessage = "An error occurred during sign up";
			
			if (err.response) {
				errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
			} else if (err.request) {
				errorMessage = "Cannot connect to server. Please check if the server is running.";
			} else {
				errorMessage = err.message || "An error occurred during sign up";
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
								Create Account
							</h1>
							<p className="text-slate-600">Sign up to get started</p>
						</div>

						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleSignUp();
							}}
						>
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-semibold text-slate-700 mb-2"
								>
									Name
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) =>
										handleNameChange(e.target.value)
									}
									placeholder="Enter your name"
									className={`w-full px-4 py-3 border rounded-lg placeholder-slate-400 focus:outline-none transition-all bg-white text-slate-800 ${getRingColor(
										validation.name
									)}`}
								/>
								{validation.name === "invalid" && (
									<p className="mt-1 text-sm text-red-600">
										Name must be at least 2 characters long
									</p>
								)}
								{validation.name === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Name is required
									</p>
								)}
							</div>

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
								{validation.password === "invalid" && (
									<p className="mt-1 text-sm text-red-600">
										Password must be at least 6 characters long
									</p>
								)}
								{validation.password === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Password is required
									</p>
								)}
								{password && validation.password !== "empty" && (
									<p
										className={`mt-1 text-sm font-semibold ${
											passwordStrength === "Weak"
												? "text-red-600"
												: passwordStrength === "Medium"
												? "text-yellow-600"
												: "text-green-600"
										}`}
									>
										Password strength: {passwordStrength}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full text-white py-3 px-4 rounded-lg font-semibold transition-all focus:outline-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
							>
								{loading ? "Creating account..." : "Sign up"}
							</button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-slate-600">
								{"Already have an account? "}
								<Link
									to="/login"
									className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
								>
									Login
								</Link>
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
