import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaPlusCircle, FaChartLine, FaTrophy, FaBriefcase, FaCalendar, FaArrowRight } from "react-icons/fa";

export default function Dashboard() {
	const [interviews, setInterviews] = useState([]);
	const [stats, setStats] = useState({
		totalInterviews: 0,
		bestScore: 0,
		mostCommonRole: "None",
		averageScore: 0,
		totalReports: 0,
	});
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (!user) {
				setLoading(false);
				return;
			}
			
			setLoading(true);
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setLoading(false);
					return;
				}

				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

				const [interviewsRes, reportsRes] = await Promise.all([
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
				]);
				
				const interviews = interviewsRes.data || [];
				const reports = reportsRes.data || [];

				const totalInterviews = interviews.length;
				const totalReports = reports.length;
				const bestScore = reports.length > 0 
					? Math.max(...reports.map((r) => Number(r.finalScore) || 0))
					: 0;
				const averageScore = reports.length > 0
					? reports.reduce((sum, r) => sum + (Number(r.finalScore) || 0), 0) / reports.length
					: 0;

				const roleCounts = interviews
					.map((i) => i.role)
					.reduce((acc, role) => {
						if (role) acc[role] = (acc[role] || 0) + 1;
						return acc;
					}, {});
				const mostCommonRole =
					Object.entries(roleCounts).sort(
						(a, b) => b[1] - a[1]
					)[0]?.[0] || "None";

				setInterviews(interviews);
				setStats({
					totalInterviews,
					bestScore: Math.round(bestScore * 100) / 100,
					mostCommonRole,
					averageScore: Math.round(averageScore * 100) / 100,
					totalReports,
				});
			} catch (error) {
				console.error("Failed to fetch data:", error);
				setInterviews([]);
				setStats({
					totalInterviews: 0,
					bestScore: 0,
					mostCommonRole: "None",
					averageScore: 0,
					totalReports: 0,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-slate-800 mb-2">
						Welcome back, {user?.name?.split(' ')[0] || "User"}!
					</h1>
					<p className="text-slate-600 text-lg">Track your progress and continue improving your interview skills.</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600 mb-1 font-medium">Total Interviews</p>
								<p className="text-3xl font-bold text-slate-800">{stats.totalInterviews}</p>
							</div>
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
								<FaBriefcase className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600 mb-1 font-medium">Completed Reports</p>
								<p className="text-3xl font-bold text-slate-800">{stats.totalReports}</p>
							</div>
							<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
								<FaChartLine className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600 mb-1 font-medium">Best Score</p>
								<p className="text-3xl font-bold text-slate-800">
									{stats.bestScore > 0 ? `${stats.bestScore}%` : "N/A"}
								</p>
							</div>
							<div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
								<FaTrophy className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600 mb-1 font-medium">Average Score</p>
								<p className="text-3xl font-bold text-slate-800">
									{stats.averageScore > 0 ? `${stats.averageScore}%` : "N/A"}
								</p>
							</div>
							<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
								<FaChartLine className="text-white text-xl" />
							</div>
						</div>
					</div>
				</div>

				{/* Action Button */}
				<div className="mb-8">
					<button
						onClick={() => navigate("/interview/setup")}
						className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
					>
						<FaPlusCircle className="w-5 h-5" />
						<span>Start New Interview</span>
					</button>
				</div>

				{/* Interviews List */}
				<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-slate-800">Your Interviews</h2>
						{stats.mostCommonRole !== "None" && (
							<span className="text-sm text-slate-600">
								Most practiced: <span className="font-semibold text-slate-800">{stats.mostCommonRole}</span>
							</span>
						)}
					</div>

					{interviews.length === 0 ? (
						<div className="text-center py-16">
							<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaBriefcase className="text-3xl text-slate-400" />
							</div>
							<h3 className="text-xl font-semibold text-slate-800 mb-2">No interviews yet</h3>
							<p className="text-slate-600 mb-6 max-w-md mx-auto">
								Start your first practice session to see your interviews here. Practice makes perfect!
							</p>
							<button
								onClick={() => navigate("/interview/setup")}
								className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
							>
								Start Your First Interview
							</button>
						</div>
					) : (
						<div className="space-y-4">
							{interviews.map((interview) => {
								// Check if report exists for this interview
								const hasReport = stats.totalReports > 0;
								
								return (
									<div
										key={interview._id}
										className="border border-slate-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all bg-slate-50 hover:bg-white"
									>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-slate-800 mb-2">
													{interview.interview_name}
												</h3>
												<div className="flex flex-wrap gap-2 mb-3">
													<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
														{interview.role}
													</span>
													<span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
														{interview.interview_type}
													</span>
													<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
														{interview.experience_level}
													</span>
												</div>
												<div className="flex items-center text-sm text-slate-500">
													<FaCalendar className="mr-2" />
													{new Date(interview.created_at).toLocaleDateString('en-US', { 
														year: 'numeric', 
														month: 'long', 
														day: 'numeric' 
													})}
												</div>
											</div>
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => navigate(`/interview/${interview._id}`)}
													className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center space-x-2"
												>
													<span>Continue</span>
													<FaArrowRight className="w-3 h-3" />
												</button>
												<button
													onClick={() => navigate(`/interview/report/${interview._id}`)}
													className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
													disabled={!hasReport}
												>
													Report
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
