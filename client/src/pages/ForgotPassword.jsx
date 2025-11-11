import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import axios from "axios";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [validation, setValidation] = useState({
		email: "untouched",
	});
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const navigate = useNavigate();

	const validateEmail = (value) => {
		if (value.trim() === "") return "empty";
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? "valid" : "invalid";
	};

	const handleEmailChange = (value) => {
		setEmail(value);
		setValidation((prev) => ({
			...prev,
			email: validateEmail(value),
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

	const handleForgotPassword = async () => {
		const emailValidation = validateEmail(email);

		setValidation({
			email: emailValidation,
		});

		if (emailValidation !== "valid") {
			showToast("Please enter a valid email address", "error");
			return;
		}

		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			await axios.post(
				`${apiUrl}/api/auth/forgot-password`,
				{
					email,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			setEmailSent(true);
			showToast(
				"If an account exists with this email, a password reset link has been sent.",
				"success"
			);
		} catch (err) {
			const errorMessage =
				err.response?.data?.error || err.message || "An error occurred";
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
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
						<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 backdrop-blur-sm text-center">
							<div className="mb-6">
								<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
									<svg
										className="h-8 w-8 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<h1 className="text-2xl font-bold text-gray-900 mb-2">
									Check Your Email
								</h1>
								<p className="text-gray-600">
									We've sent a password reset link to{" "}
									<span className="font-medium">{email}</span>
								</p>
								<p className="text-gray-600 mt-2 text-sm">
									Please check your email and click on the link to
									reset your password.
								</p>
							</div>
							<Link
								to="/login"
								className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
							>
								Back to Login
							</Link>
						</div>
					</div>
				</main>
			</div>
		);
	}

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
								Forgot Password
							</h1>
							<p className="text-gray-600">
								Enter your email address and we'll send you a link to
								reset your password.
							</p>
						</div>

						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleForgotPassword();
							}}
						>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-1"
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
									className={`w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none transition-all ${getRingColor(
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

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{loading ? "Sending..." : "Send Reset Link"}
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

