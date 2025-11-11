import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ContentSection from "../components/ContentSection";
import ReviewQuestion from "../components/QuestionReview";
import downloadPDF from "../utils/pdfDownload";

export default function InterviewReport() {
	const navigate = useNavigate();
	const { interviewId } = useParams();
	const [report, setReport] = useState(null);
	const [interview, setInterview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchReport = async () => {
			setLoading(true);
			setError(null);
			
			try {
				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
				
				const interviewResponse = await axios.get(
					`${apiUrl}/api/interview/${interviewId}`,
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				setInterview(interviewResponse.data);

				const fetchReportData = async (retryCount = 0) => {
					const maxRetries = 8;
					const baseDelay = 1500;
					
					try {
						const response = await axios.get(
							`${apiUrl}/api/report/${interviewId}`,
							{
								headers: {
									"Content-Type": "application/json",
								},
							}
						);
						setReport(response.data);
						setLoading(false);
					} catch (reportError) {
						if (retryCount < maxRetries) {
							setTimeout(() => {
								fetchReportData(retryCount + 1);
							}, baseDelay * (retryCount + 1));
						} else {
							setError("Report is taking longer than expected to generate. Please try refreshing the page.");
							setLoading(false);
						}
					}
				};
				
				fetchReportData();
			} catch (error) {
				console.error("Error fetching interview:", error);
				setError("Failed to load interview data");
				setLoading(false);
			}
		};

		fetchReport();
	}, [interviewId]);

	const finalScore = report ? report.finalScore : 0;
	const summary = report ? report.summary : "";
	const improvementAreas = report ? report.areaOfImprovement : [];
	const strengths = report ? report.strengths : [];
	const reviewQuestions = report ? report.answers : [];

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600">Generating your report...</p>
					<p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center max-w-md">
					<div className="text-red-600 text-4xl mb-4">!</div>
					<h2 className="text-2xl font-bold text-slate-800 mb-2">Report Generation Error</h2>
					<p className="text-slate-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Refresh Page
					</button>
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-slate-600 mb-4">No report found for this interview.</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-slate-800 mb-2">
						Interview Report
					</h1>
					<p className="text-slate-600">
						Review your performance and identify areas for improvement
					</p>
				</div>

				<div className="mb-8">
					<h2 className="text-lg font-semibold text-slate-800 mb-4">
						Summary Metrics
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white rounded-lg border border-slate-200 p-6 shadow-md">
							<div className="text-md font-semibold text-slate-600 mb-2">
								Final Score
							</div>
							<div className={`text-3xl font-bold ${
								finalScore >= 80 ? "text-green-600" : 
								finalScore >= 60 ? "text-yellow-600" : 
								"text-red-600"
							}`}>
								{finalScore}%
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 mb-8">
					<ContentSection title="Summary" items={summary} />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<ContentSection
						title="Areas for Improvement"
						items={improvementAreas}
					/>
					<ContentSection
						title="Strengths"
						items={strengths}
					/>
				</div>

				<div className="mb-8">
					<h2 className="text-lg font-semibold text-slate-800 mb-4">
						Review Answers
					</h2>
					<div className="bg-white rounded-lg border border-slate-200 p-6 shadow-md">
						<div className="space-y-4">
							{reviewQuestions.map((question, index) => (
								<ReviewQuestion
									key={index}
									questionNumber={index + 1}
									question={question.question}
									userAnswer={question.userAnswer}
									preferredAnswer={question.preferredAnswer}
									score={question.score}
									feedback={question.feedback}
									defaultExpanded={false}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						onClick={() => downloadPDF({ report, interview })}
						className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Download Report
					</button>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Back to Dashboard
					</button>
					<button
						onClick={() => navigate("/interview/setup")}
						className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
					>
						Start New Interview
					</button>
				</div>
			</main>
		</div>
	);
}
