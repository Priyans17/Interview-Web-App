import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "../components/Toast";
import axios from "axios";

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [validation, setValidation] = useState({
		password: "untouched",
		confirmPassword: "untouched",
	});
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const [loading, setLoading] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState("");

	useEffect(() => {
		if (!token) {
			navigate("/forgot-password");
		}
	}, [token, navigate]);

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

	const handlePasswordChange = (value) => {
		setPassword(value);
		setValidation((prev) => ({
			...prev,
			password: validatePassword(value),
		}));
		setPasswordStrength(calculatePasswordStrength(value));

		// Validate confirm password if it's already filled
		if (confirmPassword) {
			setValidation((prev) => ({
				...prev,
				confirmPassword:
					value === confirmPassword ? "valid" : "invalid",
			}));
		}
	};

	const handleConfirmPasswordChange = (value) => {
		setConfirmPassword(value);
		setValidation((prev) => ({
			...prev,
			confirmPassword:
				password === value ? "valid" : value === "" ? "empty" : "invalid",
		}));
	};

	const getRingColor = (fieldValidation) => {
		switch (fieldValidation) {
			case "empty":
				return "focus:ring-orange-500 focus:border-orange-500";
			case "invalid":
				return "focus:ring-red-500 focus:border-red-500 ring-2 ring-red-500 border-red-500";
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

	const handleResetPassword = async () => {
		const passwordValidation = validatePassword(password);
		const confirmPasswordValidation =
			password === confirmPassword ? "valid" : "invalid";

		setValidation({
			password: passwordValidation,
			confirmPassword: confirmPasswordValidation,
		});

		if (passwordValidation !== "valid") {
			showToast("Password must be at least 6 characters", "error");
			return;
		}

		if (password !== confirmPassword) {
			showToast("Passwords do not match", "error");
			return;
		}

		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			await axios.post(
				`${apiUrl}/api/auth/reset-password`,
				{
					token,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			showToast("Password reset successfully!", "success");
			setTimeout(() => {
				navigate("/login");
			}, 1500);
		} catch (err) {
			const errorMessage =
				err.response?.data?.error || err.message || "An error occurred";
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 min-w-screen">
			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

			<main className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 backdrop-blur-sm">
						<div className="text-center mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Reset Password
							</h1>
							<p className="text-gray-600">
								Enter your new password below
							</p>
						</div>

						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleResetPassword();
							}}
						>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									New Password
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
										placeholder="Enter your new password"
										className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none transition-all ${getRingColor(
											validation.password
										)}`}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
										Password must be at least 6 characters
										long
									</p>
								)}
								{validation.password === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Password is required
									</p>
								)}
								{password && validation.password !== "empty" && (
									<p
										className={`mt-1 text-sm font-medium ${
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

							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Confirm Password
								</label>
								<div className="relative">
									<input
										id="confirmPassword"
										type={
											showConfirmPassword
												? "text"
												: "password"
										}
										value={confirmPassword}
										onChange={(e) =>
											handleConfirmPasswordChange(
												e.target.value
											)
										}
										placeholder="Confirm your new password"
										className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none transition-all ${getRingColor(
											validation.confirmPassword
										)}`}
									/>
									<button
										type="button"
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showConfirmPassword ? (
											<FaEyeSlash className="w-5 h-5" />
										) : (
											<FaEye className="w-5 h-5" />
										)}
									</button>
								</div>
								{validation.confirmPassword === "invalid" && (
									<p className="mt-1 text-sm text-red-600">
										Passwords do not match
									</p>
								)}
								{validation.confirmPassword === "empty" && (
									<p className="mt-1 text-sm text-orange-600">
										Please confirm your password
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{loading ? "Resetting..." : "Reset Password"}
							</button>
						</form>

						<div className="mt-6 text-center">
							<Link
								to="/login"
								className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
							>
								Back to Login
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

