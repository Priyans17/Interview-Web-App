import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaPlusCircle, FaChartLine, FaTrophy, FaBriefcase, FaCalendar, FaArrowRight, FaTrash, FaTimes } from "react-icons/fa";
import Toast from "../components/Toast";
import ScoreTrendChart from "../components/ScoreTrendChart";

export default function Dashboard() {
	const [interviews, setInterviews] = useState([]);
	const [reports, setReports] = useState([]);
	const [stats, setStats] = useState({
		totalInterviews: 0,
		bestScore: 0,
		mostCommonRole: "None",
		averageScore: 0,
		totalReports: 0,
	});
	const [loading, setLoading] = useState(true);
	const [deleteConfirm, setDeleteConfirm] = useState({ show: false, interviewId: null, type: null, step: 1 });
	const [toast, setToast] = useState({ show: false, message: "", type: "success" });
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (!user) {
				navigate("/login");
				return;
			}

			setLoading(true);
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					navigate("/login");
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
				
				const interviewsData = interviewsRes.data || [];
				const reportsData = reportsRes.data || [];

				setInterviews(interviewsData);
				setReports(reportsData);

				const totalInterviews = interviewsData.length;
				const totalReports = reportsData.length;
				
				const validScores = reportsData
					.map((r) => {
						const score = Number(r.finalScore);
						return isNaN(score) ? null : score;
					})
					.filter(score => score !== null && score >= 0 && score <= 100);
				
				const bestScore = validScores.length > 0 
					? Math.max(...validScores)
					: 0;
				const averageScore = validScores.length > 0
					? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
					: 0;

				const roleCounts = interviewsData
					.map((i) => i.role)
					.reduce((acc, role) => {
						if (role) acc[role] = (acc[role] || 0) + 1;
						return acc;
					}, {});
				const mostCommonRole =
					Object.entries(roleCounts).sort(
						(a, b) => b[1] - a[1]
					)[0]?.[0] || "None";

				setStats({
					totalInterviews,
					bestScore: Math.round(bestScore * 100) / 100,
					mostCommonRole,
					averageScore: Math.round(averageScore * 100) / 100,
					totalReports,
				});
			} catch (error) {
				console.error("Error fetching data:", error);
				setInterviews([]);
				setReports([]);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [user, navigate]);

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleDeleteClick = (interviewId, type = "interview") => {
		setDeleteConfirm({ show: true, interviewId, type, step: 1 });
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirm.step === 1) {
			setDeleteConfirm((prev) => ({ ...prev, step: 2 }));
		} else {
			try {
				const token = localStorage.getItem("token");
				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
				
				if (deleteConfirm.type === "interview") {
					await axios.delete(
						`${apiUrl}/api/interview/${deleteConfirm.interviewId}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						}
					);
					
					try {
						await axios.delete(
							`${apiUrl}/api/report/${deleteConfirm.interviewId}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
									"Content-Type": "application/json",
								},
							}
						);
					} catch (reportErr) {
						console.log("Report deletion skipped:", reportErr);
					}
				} else if (deleteConfirm.type === "report") {
					await axios.delete(
						`${apiUrl}/api/report/${deleteConfirm.interviewId}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						}
					);
				}

				if (deleteConfirm.type === "interview") {
					setInterviews((prev) => prev.filter((i) => i._id !== deleteConfirm.interviewId));
					setReports((prev) => prev.filter((r) => r.interviewId !== deleteConfirm.interviewId));
				} else {
					setReports((prev) => prev.filter((r) => r.interviewId !== deleteConfirm.interviewId));
				}

				const updatedInterviews = deleteConfirm.type === "interview" 
					? interviews.filter((i) => i._id !== deleteConfirm.interviewId)
					: interviews;
				const updatedReports = deleteConfirm.type === "interview"
					? reports.filter((r) => r.interviewId !== deleteConfirm.interviewId)
					: reports.filter((r) => r.interviewId !== deleteConfirm.interviewId);

				const totalInterviews = updatedInterviews.length;
				const totalReports = updatedReports.length;
				
				const validScores = updatedReports
					.map((r) => {
						const score = Number(r.finalScore);
						return isNaN(score) ? null : score;
					})
					.filter(score => score !== null && score >= 0 && score <= 100);
				
				const bestScore = validScores.length > 0 
					? Math.max(...validScores)
					: 0;
				const averageScore = validScores.length > 0
					? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
					: 0;
				
				setStats({
					totalInterviews,
					bestScore: Math.round(bestScore * 100) / 100,
					mostCommonRole: stats.mostCommonRole,
					averageScore: Math.round(averageScore * 100) / 100,
					totalReports,
				});

				showToast(`${deleteConfirm.type === "interview" ? "Interview" : "Report"} deleted successfully`, "success");
				setDeleteConfirm({ show: false, interviewId: null, type: null, step: 1 });
			} catch (error) {
				console.error("Error deleting:", error);
				showToast(`Failed to delete ${deleteConfirm.type}. Please try again.`, "error");
				setDeleteConfirm({ show: false, interviewId: null, type: null, step: 1 });
			}
		}
	};

	const handleDeleteCancel = () => {
		setDeleteConfirm({ show: false, interviewId: null, type: null, step: 1 });
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F6FA' }}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2F5DFF', borderTopColor: 'transparent' }}></div>
					<p className="text-[#1E1E1E]">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: '#F5F6FA' }}>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2" style={{ color: '#1E1E1E' }}>
						Welcome back, {user?.name?.split(' ')[0] || "User"}!
					</h1>
					<p className="text-lg" style={{ color: '#1E1E1E', opacity: 0.7 }}>Track your progress and continue improving your interview skills.</p>
				</div>

				{reports.length > 0 && (() => {
					const chartData = reports
						.filter(r => r.finalScore != null && !isNaN(Number(r.finalScore)))
						.map((report, index) => {
							const interview = interviews.find(i => 
								i._id === report.interviewId || 
								i._id === report.interviewId?._id
							);
							return {
								score: Number(report.finalScore),
								interviewName: interview?.interview_name || `Interview ${index + 1}`,
								date: report.createdAt 
									? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
									: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
								fullDate: report.createdAt || new Date()
							};
						})
						.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
					
					return chartData.length > 0 ? (
						<div className="mb-8">
							<ScoreTrendChart chartData={chartData} />
						</div>
					) : null;
				})()}

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm mb-1 font-medium" style={{ color: '#1E1E1E', opacity: 0.7 }}>Total Interviews</p>
								<p className="text-3xl font-bold" style={{ color: '#1E1E1E' }}>{stats.totalInterviews}</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: '#2F5DFF' }}>
								<FaBriefcase className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm mb-1 font-medium" style={{ color: '#1E1E1E', opacity: 0.7 }}>Completed Reports</p>
								<p className="text-3xl font-bold" style={{ color: '#1E1E1E' }}>{stats.totalReports}</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: '#1ABC9C' }}>
								<FaChartLine className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm mb-1 font-medium" style={{ color: '#1E1E1E', opacity: 0.7 }}>Best Score</p>
								<p className="text-3xl font-bold" style={{ color: '#1E1E1E' }}>
									{stats.bestScore > 0 ? `${stats.bestScore}%` : "N/A"}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: '#FF8C42' }}>
								<FaTrophy className="text-white text-xl" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm mb-1 font-medium" style={{ color: '#1E1E1E', opacity: 0.7 }}>Average Score</p>
								<p className="text-3xl font-bold" style={{ color: '#1E1E1E' }}>
									{stats.averageScore > 0 ? `${stats.averageScore}%` : "N/A"}
								</p>
							</div>
							<div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: '#1ABC9C' }}>
								<FaChartLine className="text-white text-xl" />
							</div>
						</div>
					</div>
				</div>

				<div className="mb-8">
					<button
						onClick={() => navigate("/interview/setup")}
						className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
						style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
					>
						<FaPlusCircle className="w-5 h-5" />
						<span>Start New Interview</span>
					</button>
				</div>

				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold" style={{ color: '#1E1E1E' }}>Your Interviews</h2>
						{stats.mostCommonRole !== "None" && (
							<span className="text-sm" style={{ color: '#1E1E1E', opacity: 0.7 }}>
								Most practiced: <span className="font-semibold" style={{ color: '#1E1E1E' }}>{stats.mostCommonRole}</span>
							</span>
						)}
					</div>

					{interviews.length === 0 ? (
						<div className="text-center py-12">
							<p className="mb-4" style={{ color: '#1E1E1E', opacity: 0.7 }}>No interviews yet. Start your first practice session!</p>
							<button
								onClick={() => navigate("/interview/setup")}
								className="px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
								style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
							>
								Start Your First Interview
							</button>
						</div>
					) : (
						<div className="space-y-4">
							{interviews.map((interview) => {
								const report = reports.find((r) => r.interviewId === interview._id || r.interviewId?._id === interview._id);
								const hasReport = !!report;
								
								return (
									<div
										key={interview._id}
										className="border border-gray-200 rounded-lg p-5 hover:border-[#2F5DFF] hover:shadow-lg transition-all bg-white"
									>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h3 className="text-lg font-semibold mb-2" style={{ color: '#1E1E1E' }}>
													{interview.interview_name}
												</h3>
												<div className="flex flex-wrap gap-2 mb-3">
													<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(47,93,255,0.1)', color: '#2F5DFF' }}>
														{interview.role}
													</span>
													<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(255,140,66,0.1)', color: '#FF8C42' }}>
														{interview.interview_type}
													</span>
													<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(26,188,156,0.1)', color: '#1ABC9C' }}>
														{interview.experience_level}
													</span>
													{hasReport && report.finalScore && (
														<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(255,140,66,0.1)', color: '#FF8C42' }}>
															Score: {report.finalScore}%
														</span>
													)}
												</div>
												<div className="flex items-center text-sm" style={{ color: '#1E1E1E', opacity: 0.6 }}>
													<FaCalendar className="mr-2" />
													{new Date(interview.created_at).toLocaleDateString('en-US', { 
														year: 'numeric', 
														month: 'long', 
														day: 'numeric' 
													})}
												</div>
											</div>
											<div className="flex space-x-2 ml-4">
												{hasReport ? (
													<>
														<button
															onClick={() => navigate(`/interview/report/${interview._id}`)}
															className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
															style={{ background: '#1ABC9C', boxShadow: '0 2px 8px rgba(26,188,156,0.3)' }}
														>
															View Report
														</button>
														<button
															onClick={() => handleDeleteClick(interview._id, "interview")}
															className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
															title="Delete Interview"
														>
															<FaTrash className="w-3 h-3" />
														</button>
													</>
												) : (
													<>
														<button
															onClick={() => navigate(`/interview/${interview._id}`)}
															className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
															style={{ background: '#2F5DFF', boxShadow: '0 2px 8px rgba(47,93,255,0.3)' }}
														>
															<span>Continue</span>
															<FaArrowRight className="w-3 h-3" />
														</button>
														<button
															onClick={() => handleDeleteClick(interview._id, "interview")}
															className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
															title="Delete Interview"
														>
															<FaTrash className="w-3 h-3" />
														</button>
													</>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{reports.length > 0 && (
					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-8">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold" style={{ color: '#1E1E1E' }}>Your Reports</h2>
						</div>
						<div className="space-y-4">
							{reports.map((report) => {
								const interview = interviews.find((i) => i._id === report.interviewId || i._id === report.interviewId?._id);
								return (
									<div key={report._id || report.interviewId} className="border border-gray-200 rounded-lg p-5 hover:border-[#1ABC9C] hover:shadow-lg transition-all bg-white">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h3 className="text-lg font-semibold mb-2" style={{ color: '#1E1E1E' }}>{interview?.interview_name || "Interview Report"}</h3>
												<div className="flex flex-wrap gap-2 mb-3">
													{report.finalScore && (
														<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(255,140,66,0.1)', color: '#FF8C42' }}>
															Score: {report.finalScore}%
														</span>
													)}
													{interview?.role && (
														<span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(47,93,255,0.1)', color: '#2F5DFF' }}>
															{interview.role}
														</span>
													)}
												</div>
												{report.createdAt && (
													<div className="flex items-center text-sm" style={{ color: '#1E1E1E', opacity: 0.6 }}>
														<FaCalendar className="mr-2" />
														{new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
													</div>
												)}
											</div>
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => navigate(`/interview/report/${report.interviewId || report.interviewId?._id}`)}
													className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
													style={{ background: '#1ABC9C', boxShadow: '0 2px 8px rgba(26,188,156,0.3)' }}
												>
													View Report
												</button>
												<button
													onClick={() => handleDeleteClick(report.interviewId || report.interviewId?._id, "report")}
													className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
													title="Delete Report"
												>
													<FaTrash className="w-3 h-3" />
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</main>

			{deleteConfirm.show && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold" style={{ color: '#1E1E1E' }}>
								{deleteConfirm.step === 1 ? "Confirm Deletion" : "Final Confirmation"}
							</h2>
							<button
								onClick={handleDeleteCancel}
								className="text-gray-500 hover:text-gray-700"
							>
								<FaTimes className="w-5 h-5" />
							</button>
						</div>
						<p className="mb-6" style={{ color: '#1E1E1E', opacity: 0.7 }}>
							{deleteConfirm.step === 1
								? `Are you sure you want to delete this ${deleteConfirm.type}?`
								: `This action cannot be undone. Type "DELETE" to confirm.`}
						</p>
						<div className="flex space-x-3">
							<button
								onClick={handleDeleteCancel}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-all hover:bg-gray-50"
								style={{ color: '#1E1E1E' }}
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteConfirm}
								className="flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
								style={{ background: deleteConfirm.step === 1 ? '#FF8C42' : '#dc2626', boxShadow: deleteConfirm.step === 1 ? '0 2px 8px rgba(255,140,66,0.3)' : '0 2px 8px rgba(220,38,38,0.3)' }}
							>
								{deleteConfirm.step === 1 ? "Yes, Delete" : "Confirm Delete"}
							</button>
						</div>
					</div>
				</div>
			)}

			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}
		</div>
	);
}
