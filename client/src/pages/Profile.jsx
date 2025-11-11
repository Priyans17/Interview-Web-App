import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaCalendar, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

export default function Profile() {
	const { user, isLoggedIn } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [userStats, setUserStats] = useState({
		totalInterviews: 0,
		totalReports: 0,
		averageScore: 0,
	});

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login");
			return;
		}

		const fetchUserStats = async () => {
			try {
				const token = localStorage.getItem("token");
				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

				const [interviewsRes, reportsRes, userRes] = await Promise.all([
					axios.get(`${apiUrl}/api/interview`, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}).catch(() => ({ data: [] })),
					axios.get(`${apiUrl}/api/report`, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}).catch(() => ({ data: [] })),
					axios.get(`${apiUrl}/api/auth/me`, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}).catch(() => ({ data: { user: null } })),
				]);

				const interviews = interviewsRes.data || [];
				const reports = reportsRes.data || [];
				const currentUser = userRes.data?.user || user;

				const totalInterviews = interviews.length;
				const totalReports = reports.length;
				const averageScore =
					reports.length > 0
						? reports.reduce((sum, report) => sum + (Number(report.finalScore) || 0), 0) / reports.length
						: 0;

				setUserStats({
					totalInterviews,
					totalReports,
					averageScore: Math.round(averageScore * 100) / 100,
				});
			} catch (error) {
				console.error("Error fetching user stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserStats();
	}, [isLoggedIn, navigate, user]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F6FA' }}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2F5DFF', borderTopColor: 'transparent' }}></div>
					<p className="text-slate-600">Loading profile...</p>
				</div>
			</div>
		);
	}

	const getInitials = (name) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const displayUser = user || {};

	return (
		<div className="min-h-screen" style={{ background: '#F5F6FA' }}>
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-slate-800 mb-2">Profile</h1>
					<p className="text-slate-600 text-lg">Manage your account and view your statistics</p>
				</div>

				<div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
					<div className="flex items-center space-x-6 mb-8">
						<div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg">
							{displayUser?.avatar ? (
								<img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
							) : (
								<span className="text-white text-3xl font-bold">{getInitials(displayUser?.name || displayUser?.email || "User")}</span>
							)}
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-slate-800 mb-1">{displayUser?.name || "User"}</h2>
							<p className="text-slate-600 mb-3">{displayUser?.email}</p>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2 text-sm">
									{displayUser?.isEmailVerified ? (
										<>
											<FaCheckCircle className="w-4 h-4 text-green-600" />
											<span className="text-green-700 font-medium">Email Verified</span>
										</>
									) : (
										<>
											<FaTimesCircle className="w-4 h-4 text-red-600" />
											<span className="text-red-700 font-medium">Email Not Verified</span>
										</>
									)}
								</div>
								<div className="flex items-center space-x-2 text-sm text-slate-500">
									<FaCalendar className="w-4 h-4" />
									<span>Member since {new Date().toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
									<FaUser className="w-5 h-5 text-blue-600" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800">Account Information</h3>
							</div>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-slate-600 font-medium">Name:</span>
									<span className="text-slate-800">{displayUser?.name || "Not set"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 font-medium">Email:</span>
									<span className="text-slate-800">{displayUser?.email || "Not set"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 font-medium">Tier:</span>
									<span className="text-slate-800 capitalize">{displayUser?.tier || "Basic"}</span>
								</div>
							</div>
						</div>

						<div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
									<FaEnvelope className="w-5 h-5 text-green-600" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800">Email Status</h3>
							</div>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-slate-600 text-sm">Verification Status:</span>
									<div className="flex items-center space-x-2">
										{displayUser?.isEmailVerified ? (
											<>
												<FaCheckCircle className="w-5 h-5 text-green-600" />
												<span className="text-green-700 font-semibold">Verified</span>
											</>
										) : (
											<>
												<FaTimesCircle className="w-5 h-5 text-red-600" />
												<span className="text-red-700 font-semibold">Not Verified</span>
											</>
										)}
									</div>
								</div>
								{!displayUser?.isEmailVerified && (
									<p className="text-xs text-slate-500 mt-2">
										Please verify your email to access all features
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
					<h2 className="text-2xl font-bold text-slate-800 mb-6">Statistics</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="text-center p-6 border border-slate-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
							<div className="text-4xl font-bold text-blue-600 mb-2">{userStats.totalInterviews}</div>
							<div className="text-slate-600 font-medium">Total Interviews</div>
						</div>
						<div className="text-center p-6 border border-slate-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
							<div className="text-4xl font-bold text-green-600 mb-2">{userStats.totalReports}</div>
							<div className="text-slate-600 font-medium">Completed Reports</div>
						</div>
						<div className="text-center p-6 border border-slate-200 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-md transition-shadow">
							<div className="text-4xl font-bold text-purple-600 mb-2">
								{userStats.averageScore > 0 ? `${userStats.averageScore}%` : "N/A"}
							</div>
							<div className="text-slate-600 font-medium">Average Score</div>
						</div>
					</div>
				</div>

				<div className="mt-8 flex justify-end">
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Back to Dashboard
					</button>
				</div>
			</main>
		</div>
	);
}
