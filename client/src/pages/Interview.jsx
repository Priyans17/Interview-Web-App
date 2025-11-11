import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

import { FaMicrophone, FaArrowRight } from "react-icons/fa";

import { analyzeSpeech } from "../utils/speechAnalysis";
import ConfidenceHeatmap from "../components/ConfidenceHeatmap";

const SpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function Interview() {
	const { interviewId } = useParams();
	const [questions, setQuestions] = useState([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [totalTime, setTotalTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});

	const [transcriptWords, setTranscriptWords] = useState([]);
	const [analyzedWords, setAnalyzedWords] = useState([]);
	const [stats, setStats] = useState(null);

	const { loading, setLoading } = useAuth();
	const navigate = useNavigate();

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const speakQuestion = (text) => {
		const utterance = new SpeechSynthesisUtterance(text);
		window.speechSynthesis.speak(utterance);
	};

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				setLoading(true);
				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
				
				const res = await axios.get(
					`${apiUrl}/api/interview/${interviewId}`,
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				
				if (res.data && res.data.questions && Array.isArray(res.data.questions)) {
					setQuestions(res.data.questions);
					if (res.data.questions.length > 0) {
						speakQuestion(res.data.questions[0].question);
					}
				} else {
					showToast("Invalid interview data received", "error");
					setTimeout(() => navigate("/dashboard"), 2000);
				}
			} catch (err) {
				console.error("Error fetching interview:", err);
				const errorMessage = err.response?.data?.error || err.message || "Failed to load questions.";
				showToast(errorMessage, "error");
				setTimeout(() => navigate("/dashboard"), 2000);
			} finally {
				setLoading(false);
			}
		};
		fetchQuestions();
	}, [interviewId, navigate, setLoading]);

	useEffect(() => {
		const totalTimer = setInterval(() => {
			setTotalTime((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(totalTimer);
	}, []);

	const formatTotalTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return {
			hours: hours.toString().padStart(2, "0"),
			minutes: minutes.toString().padStart(2, "0"),
			seconds: remainingSeconds.toString().padStart(2, "0"),
		};
	};

	const startRecording = () => {
		if (!recognition) {
			showToast(
				"Speech Recognition not supported in this browser.",
				"error"
			);
			return;
		}

		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onstart = () => {
			setIsRecording(true);
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setIsRecording(false);
			showToast("Error during speech recognition", "error");
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognition.onresult = (event) => {
			let newWords = [];

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
    
				if (!result.isFinal) continue;

				const transcript = result[0].transcript;
				const confidence = result[0].confidence;

				const words = transcript.trim().split(/\s+/);
				const baseTime = Date.now() / 1000;

				words.forEach((word, idx) => {
					newWords.push({
						word,
						confidence,
						time: baseTime + idx * 0.4,
					});
				});
			}

			if (newWords.length === 0) return;

			setTranscriptWords((prev) => {
				const combined = [...prev, ...newWords];
				const { analyzedWords, stats } = analyzeSpeech(combined);
				setAnalyzedWords(analyzedWords);
				setStats(stats);
				return combined;
			});

			setAnswer((prev) => prev + " " + newWords.map(w => w.word).join(" "));
		};

		recognition.start();
	};

	const submitAnswer = async () => {
		if (!answer.trim()) {
			showToast("Please provide an answer before submitting", "error");
			return;
		}

		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
			
			const response = await axios.post(
				`${apiUrl}/api/interview/${interviewId}/answer`,
				{
					questionId: currentQuestionIndex,
					answer: answer.trim(),
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (currentQuestionIndex < questions.length - 1) {
				const nextIndex = currentQuestionIndex + 1;
				setCurrentQuestionIndex(nextIndex);
				setAnswer("");
				setTranscriptWords([]);
				setAnalyzedWords([]);
				setStats(null);
				
				if (isRecording && recognition) {
					recognition.stop();
					setIsRecording(false);
				}
				
				speakQuestion(questions[nextIndex].question);
				showToast("Answer submitted successfully", "success");
			} else {
				showToast("Interview completed! Generating report...", "success");
				setTimeout(() => {
					navigate(`/interview/report/${interviewId}`);
				}, 2000);
			}
		} catch (err) {
			console.error("Error submitting answer:", err);
			
			let errorMessage = "Failed to submit answer. Please try again.";
			
			if (err.response?.status === 401) {
				errorMessage = "Please login again to continue.";
				setTimeout(() => navigate("/login"), 2000);
			} else if (err.response?.data?.error) {
				errorMessage = err.response.data.error;
			} else if (err.message) {
				errorMessage = err.message;
			}
			
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	const totalTimeFormatted = formatTotalTime(totalTime);
	const currentQuestion = questions[currentQuestionIndex];

	if (loading && questions.length === 0) {
		return <LoadingScreen message="Loading interview questions..." showProgress />;
	}

	if (questions.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-slate-600 mb-4">No questions found for this interview.</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-slate-800 mb-2">
						Interview Session
					</h1>
					<p className="text-slate-600">
						Practice answering interview questions in a simulated environment
					</p>
				</div>

				{currentQuestion && (
					<div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
						<div className="flex justify-between items-center mb-6">
							<div className="text-sm font-semibold text-slate-600">
								Question {currentQuestionIndex + 1} of {questions.length}
							</div>
							<div className="text-sm text-slate-500">
								Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
							</div>
						</div>

						<div className="mb-6">
							<h2 className="text-xl font-semibold text-slate-800 leading-relaxed">
								{currentQuestion.question}
							</h2>
						</div>

						<div className="mb-6">
							<textarea
								disabled={isRecording}
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
								placeholder="Type your answer here or use the microphone to record..."
								className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-800 placeholder-slate-400 bg-white"
							/>

							{!isRecording && analyzedWords.length > 0 && (
								<ConfidenceHeatmap analyzedWords={analyzedWords} />
							)}

							{!isRecording && stats && (
								<div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div>
											<span className="font-semibold">Filler Words:</span> {stats.fillerCount}
										</div>
										<div>
											<span className="font-semibold">Long Pauses:</span> {stats.pauseCount}
										</div>
										<div>
											<span className="font-semibold">Low Confidence:</span> {stats.lowConfidenceCount}
										</div>
										<div>
											<span className="font-semibold">Confidence:</span> {stats.confidenceLevel}
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="flex justify-between items-center">
							<button
								onClick={() => {
									if (isRecording) {
										recognition.stop();
									} else {
										startRecording();
									}
								}}
								className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
									isRecording
										? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
										: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
								}`}
							>
								<FaMicrophone
									className={`w-4 h-4 ${
										isRecording
											? "text-red-600"
											: "text-slate-500"
									}`}
								/>
								<span>
									{isRecording
										? "Stop Recording"
										: "Record Answer"}
								</span>
							</button>

							<button
								onClick={submitAnswer}
								disabled={!answer.trim() || loading}
								className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span>
									{loading 
										? "Submitting..."
										: currentQuestionIndex >= questions.length - 1
										? "Finish Interview"
										: "Next Question"}
								</span>
								{!loading && <FaArrowRight className="w-4 h-4" />}
							</button>
						</div>
					</div>
				)}

				<div className="flex justify-center space-x-4">
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-md border border-slate-200">
						<div className="text-2xl font-bold text-slate-800">
							{totalTimeFormatted.hours}
						</div>
						<div className="text-sm text-slate-600">Hours</div>
					</div>
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-md border border-slate-200">
						<div className="text-2xl font-bold text-slate-800">
							{totalTimeFormatted.minutes}
						</div>
						<div className="text-sm text-slate-600">Minutes</div>
					</div>
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-md border border-slate-200">
						<div className="text-2xl font-bold text-slate-800">
							{totalTimeFormatted.seconds}
						</div>
						<div className="text-sm text-slate-600">Seconds</div>
					</div>
				</div>
			</main>
		</div>
	);
}
