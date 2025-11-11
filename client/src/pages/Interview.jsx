import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import LoadingScreen from "../components/LoadingScreen";
import { FaMicrophone, FaArrowRight, FaArrowLeft, FaClock } from "react-icons/fa";
import { analyzeSpeech } from "../utils/speechAnalysis";
import ConfidenceHeatmap from "../components/ConfidenceHeatmap";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const QUESTION_TIME_LIMIT = 300;

export default function Interview() {
	const { interviewId } = useParams();
	const [questions, setQuestions] = useState([]);
	const [answers, setAnswers] = useState({});
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [totalTime, setTotalTime] = useState(0);
	const [questionTime, setQuestionTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [toast, setToast] = useState({ show: false, message: "", type: "success" });
	const [transcriptWords, setTranscriptWords] = useState([]);
	const [analyzedWords, setAnalyzedWords] = useState([]);
	const [stats, setStats] = useState(null);
	const [isPageReady, setIsPageReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [timeWarning, setTimeWarning] = useState(false);
	const answerRef = useRef(null);
	const pasteCountRef = useRef(0);
	const recognitionRef = useRef(null);
	const isRecordingRef = useRef(false);

	const navigate = useNavigate();

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const speakQuestion = (text) => {
		try {
			if (!text || typeof text !== 'string') return;
			if (!window.speechSynthesis) return;
			
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.cancel();
			}
			
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.volume = 1;
			utterance.onerror = () => {};
			window.speechSynthesis.speak(utterance);
		} catch (error) {
		}
	};

	useEffect(() => {
		if (!interviewId) {
			setIsLoading(false);
			setIsPageReady(false);
			return;
		}

		const fetchQuestions = async () => {
			const startTime = Date.now();
			const minimumLoadTime = 5000;
			
			try {
				setIsLoading(true);
				setIsPageReady(false);
				const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
				const token = localStorage.getItem("token");
				
				const res = await axios.get(`${apiUrl}/api/interview/${interviewId}`, {
					headers: {
						"Content-Type": "application/json",
						...(token && { Authorization: `Bearer ${token}` }),
					},
				});
				
				if (res.data?.questions && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
					setQuestions(res.data.questions);
					
					const elapsedTime = Date.now() - startTime;
					const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
					
					setTimeout(() => {
						setIsPageReady(true);
						setIsLoading(false);
						if (res.data.questions[0]?.question) {
							setTimeout(() => speakQuestion(res.data.questions[0].question), 500);
						}
					}, remainingTime);
				} else {
					showToast("Invalid interview data received", "error");
					setIsPageReady(false);
					setIsLoading(false);
					setTimeout(() => navigate("/dashboard"), 2000);
				}
			} catch (err) {
				showToast(err.response?.data?.error || err.message || "Failed to load questions.", "error");
				setIsPageReady(false);
				setIsLoading(false);
				setTimeout(() => navigate("/dashboard"), 2000);
			}
		};
		
		fetchQuestions();
	}, [interviewId, navigate]);

	useEffect(() => {
		if (!SpeechRecognition) {
			return;
		}

		recognitionRef.current = new SpeechRecognition();
		const recognition = recognitionRef.current;

		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		let lastResultIndex = 0;

		recognition.onstart = () => {
			isRecordingRef.current = true;
			setIsRecording(true);
			lastResultIndex = 0;
		};

		recognition.onerror = (event) => {
			const error = event.error;
			
			if (error === 'aborted' || error === 'no-speech') {
				if (isRecordingRef.current) {
					setTimeout(() => {
						if (isRecordingRef.current && recognition.state === 'stopped') {
							try {
								recognition.start();
							} catch (e) {
								isRecordingRef.current = false;
								setIsRecording(false);
							}
						}
					}, 500);
				}
				return;
			}

			if (error === 'audio-capture' || error === 'not-allowed') {
				isRecordingRef.current = false;
				setIsRecording(false);
				showToast("Microphone access denied. Please enable microphone permissions.", "error");
				return;
			}

			if (error === 'network') {
				if (isRecordingRef.current) {
					setTimeout(() => {
						if (isRecordingRef.current && recognition.state === 'stopped') {
							try {
								recognition.start();
							} catch (e) {
								isRecordingRef.current = false;
								setIsRecording(false);
							}
						}
					}, 1000);
				}
				return;
			}

			isRecordingRef.current = false;
			setIsRecording(false);
		};

		recognition.onend = () => {
			if (isRecordingRef.current) {
				setTimeout(() => {
					if (isRecordingRef.current && recognition.state === 'stopped') {
						try {
							recognition.start();
						} catch (e) {
							isRecordingRef.current = false;
							setIsRecording(false);
						}
					}
				}, 100);
			} else {
				setIsRecording(false);
			}
		};

		recognition.onresult = (event) => {
			let newWords = [];
			let hasNewFinalResults = false;

			for (let i = Math.max(event.resultIndex, lastResultIndex); i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					hasNewFinalResults = true;
					const transcript = result[0].transcript;
					const confidence = result[0].confidence || 0.8;
					const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
					const baseTime = Date.now() / 1000;

					words.forEach((word, idx) => {
						newWords.push({
							word,
							confidence,
							time: baseTime + idx * 0.4,
						});
					});
				}
			}

			lastResultIndex = event.results.length;

			if (hasNewFinalResults && newWords.length > 0) {
				setTranscriptWords((prev) => {
					const combined = [...prev, ...newWords];
					const { analyzedWords, stats } = analyzeSpeech(combined);
					setAnalyzedWords(analyzedWords);
					setStats(stats);
					return combined;
				});

				setAnswer((prev) => {
					const newText = newWords.map(w => w.word).join(" ");
					if (prev.trim().endsWith(newText.trim())) {
						return prev;
					}
					return prev ? prev + " " + newText : newText;
				});
			}
		};

		return () => {
			if (recognition && recognition.state !== 'inactive') {
				isRecordingRef.current = false;
				try {
					recognition.stop();
				} catch (e) {
				}
			}
		};
	}, []);

	useEffect(() => {
		const totalTimer = setInterval(() => {
			setTotalTime((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(totalTimer);
	}, []);

	useEffect(() => {
		setQuestionTime(0);
		setTimeWarning(false);
		const questionTimer = setInterval(() => {
			setQuestionTime((prev) => {
				const newTime = prev + 1;
				if (newTime >= QUESTION_TIME_LIMIT - 60) {
					setTimeWarning(true);
				}
				if (newTime >= QUESTION_TIME_LIMIT) {
					showToast("Time's up! Please submit your answer.", "error");
					return QUESTION_TIME_LIMIT;
				}
				return newTime;
			});
		}, 1000);
		return () => clearInterval(questionTimer);
	}, [currentQuestionIndex]);

	useEffect(() => {
		if (answers[currentQuestionIndex]) {
			setAnswer(answers[currentQuestionIndex]);
		} else {
			setAnswer("");
		}
		setTranscriptWords([]);
		setAnalyzedWords([]);
		setStats(null);
	}, [currentQuestionIndex, answers]);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

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

	const handlePaste = (e) => {
		e.preventDefault();
		pasteCountRef.current += 1;
		if (pasteCountRef.current > 2) {
			showToast("Copy-paste is disabled. Please type your answer.", "error");
			return;
		}
		showToast("Copy-paste detected. Please provide original answers.", "error");
	};

	const handleCopy = (e) => {
		e.preventDefault();
		showToast("Copying is disabled during the interview.", "error");
	};

	const stopRecording = () => {
		if (recognitionRef.current) {
			isRecordingRef.current = false;
			try {
				if (recognitionRef.current.state !== 'inactive') {
					recognitionRef.current.stop();
				}
			} catch (e) {
			}
			setIsRecording(false);
		}
	};

	const startRecording = () => {
		if (!SpeechRecognition) {
			showToast("Speech Recognition not supported in this browser.", "error");
			return;
		}

		if (!recognitionRef.current) {
			showToast("Speech Recognition not initialized. Please refresh the page.", "error");
			return;
		}

		const recognition = recognitionRef.current;

		if (recognition.state === 'running' || recognition.state === 'starting') {
			stopRecording();
			return;
		}

		try {
			isRecordingRef.current = true;
			recognition.start();
		} catch (e) {
			isRecordingRef.current = false;
			setIsRecording(false);
			if (e.name === 'InvalidStateError') {
				setTimeout(() => {
					if (isRecordingRef.current) {
						try {
							recognition.start();
						} catch (err) {
							isRecordingRef.current = false;
							setIsRecording(false);
							showToast("Could not start speech recognition. Please try again.", "error");
						}
					}
				}, 500);
			} else {
				showToast("Could not start speech recognition. Please check microphone permissions.", "error");
			}
		}
	};

	const goToPreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
			setCurrentQuestionIndex(currentQuestionIndex - 1);
			if (isRecording) {
				stopRecording();
			}
		}
	};

	const submitAnswer = async () => {
		if (!answer.trim()) {
			showToast("Please provide an answer before submitting", "error");
			return;
		}

		try {
			setIsLoading(true);
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

			setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));

			if (currentQuestionIndex < questions.length - 1) {
				const nextIndex = currentQuestionIndex + 1;
				setCurrentQuestionIndex(nextIndex);
				setAnswer(answers[nextIndex] || "");
				setTranscriptWords([]);
				setAnalyzedWords([]);
				setStats(null);
				
				if (isRecording) {
					stopRecording();
				}
				
				if (questions[nextIndex]?.question) {
					setTimeout(() => speakQuestion(questions[nextIndex].question), 300);
				}
				
				showToast("Answer submitted successfully", "success");
			} else {
				showToast("Interview completed! Generating report...", "success");
				setTimeout(() => {
					navigate(`/interview/report/${interviewId}`);
				}, 2000);
			}
		} catch (err) {
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
			setIsLoading(false);
		}
	};

	const totalTimeFormatted = formatTotalTime(totalTime);
	const currentQuestion = questions[currentQuestionIndex];
	const remainingTime = QUESTION_TIME_LIMIT - questionTime;
	const timePercentage = (questionTime / QUESTION_TIME_LIMIT) * 100;

	if (isLoading || !isPageReady) {
		return <LoadingScreen message="Loading interview questions..." />;
	}

	if (questions.length === 0 || !currentQuestion) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F6FA' }}>
				<div className="text-center bg-white rounded-2xl p-8 shadow-xl">
					<p className="text-slate-600 mb-4">No questions found for this interview.</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
						style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: '#F5F6FA' }}>
			{toast.show && (
				<Toast message={toast.message} type={toast.type} onClose={hideToast} />
			)}

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-slate-800 mb-2">Interview Session</h1>
					<p className="text-slate-700">Practice answering interview questions</p>
				</div>

				{currentQuestion && (
					<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 animate-fade-in-up">
						<div className="flex justify-between items-center mb-6">
							<div className="text-sm font-semibold" style={{ color: '#1E1E1E' }}>
								Question {currentQuestionIndex + 1} of {questions.length}
							</div>
							<div className="flex items-center space-x-4">
								<div className={`flex items-center space-x-2 ${timeWarning ? 'text-red-600' : ''}`} style={!timeWarning ? { color: '#1E1E1E' } : {}}>
									<FaClock className="w-4 h-4" />
									<span className="text-sm font-medium">{formatTime(remainingTime)}</span>
								</div>
								<div className="text-sm" style={{ color: '#1E1E1E', opacity: 0.7 }}>
									{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
								</div>
							</div>
						</div>

						<div className="mb-4">
							<div className="w-full bg-slate-200 rounded-full h-2">
								<div 
									className={`h-2 rounded-full transition-all ${timeWarning ? 'bg-red-500' : ''}`}
									style={{ 
										width: `${timePercentage}%`,
										background: timeWarning ? '#ef4444' : '#2F5DFF'
									}}
								></div>
							</div>
						</div>

						<div className="mb-6">
							<h2 className="text-xl font-semibold leading-relaxed mb-6" style={{ color: '#1E1E1E' }}>
								{currentQuestion.question}
							</h2>
						</div>

						<div className="mb-6">
							<textarea
								ref={answerRef}
								disabled={isRecording}
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
								onPaste={handlePaste}
								onCopy={handleCopy}
								placeholder="Type your answer here or use the microphone to record..."
								className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5DFF] focus:border-[#2F5DFF] resize-none text-[#1E1E1E] placeholder-gray-400 bg-white transition-all"
								style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
							/>

							{!isRecording && analyzedWords.length > 0 && (
								<ConfidenceHeatmap analyzedWords={analyzedWords} />
							)}

							{!isRecording && stats && (
								<div className="mt-4 p-4 border border-gray-200 rounded-lg text-sm" style={{ background: '#F5F6FA', color: '#1E1E1E' }}>
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
							<div className="flex space-x-3">
								{currentQuestionIndex > 0 && (
									<button
										onClick={goToPreviousQuestion}
										className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
									>
										<FaArrowLeft className="w-4 h-4" />
										<span>Previous</span>
									</button>
								)}
								<button
									onClick={() => {
										if (isRecording) {
											stopRecording();
										} else {
											startRecording();
										}
									}}
									className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
										isRecording
											? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
											: "bg-white border-gray-300 text-[#1E1E1E] hover:bg-[#F5F6FA]"
									}`}
								>
									<FaMicrophone className={`w-4 h-4 ${isRecording ? "text-red-600 animate-pulse" : ""}`} style={{ color: isRecording ? '' : '#2F5DFF' }} />
									<span>{isRecording ? "Stop Recording" : "Record Answer"}</span>
								</button>
							</div>

							<button
								onClick={submitAnswer}
								disabled={!answer.trim() || isLoading || questionTime >= QUESTION_TIME_LIMIT}
								className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 disabled:transform-none"
								style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
							>
								<span>
									{isLoading 
										? "Submitting..."
										: currentQuestionIndex >= questions.length - 1
										? "Finish Interview"
										: "Next Question"}
								</span>
								{!isLoading && <FaArrowRight className="w-4 h-4" />}
							</button>
						</div>
					</div>
				)}

				<div className="flex justify-center space-x-4">
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-lg border border-gray-200">
						<div className="text-2xl font-bold" style={{ color: '#1E1E1E' }}>{totalTimeFormatted.hours}</div>
						<div className="text-sm" style={{ color: '#1E1E1E', opacity: 0.7 }}>Hours</div>
					</div>
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-lg border border-gray-200">
						<div className="text-2xl font-bold text-slate-800">{totalTimeFormatted.minutes}</div>
						<div className="text-sm text-slate-600">Minutes</div>
					</div>
					<div className="bg-white rounded-lg px-6 py-4 text-center shadow-lg border border-gray-200">
						<div className="text-2xl font-bold text-slate-800">{totalTimeFormatted.seconds}</div>
						<div className="text-sm text-slate-600">Seconds</div>
					</div>
				</div>
			</main>

			<style>{`
				@keyframes fade-in-up {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in-up {
					animation: fade-in-up 0.5s ease-out;
				}
			`}</style>
		</div>
	);
}

