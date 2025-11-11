import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import {
	FaArrowRight,
	FaArrowLeft,
	FaUpload,
	FaFileAlt,
	FaTimes,
} from "react-icons/fa";
import Toast from "../components/Toast";

export default function SetupForm() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [drag, setDrag] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const fileInputRef = useRef(null);

	const [formData, setFormData] = useState({
		interviewName: "",
		numOfQuestions: 3,
		interviewType: "Technical",
		role: "",
		experienceLevel: "Fresher",
		companyName: "",
		companyDescription: "",
		jobDescription: "",
		resume: null,
		focusAt: "",
	});

	useEffect(() => {
		if (!user) {
			navigate("/login");
		}
	}, [user, navigate]);

	const totalSteps = 3;
	const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

	const handleNext = () => {
		if (currentStep < totalSteps) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(currentStep + 1);
				setIsTransitioning(false);
			}, 150);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(currentStep - 1);
				setIsTransitioning(false);
			}, 150);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDrag(true);
		} else if (e.type === "dragleave") {
			setDrag(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDrag(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			if (file.type === "application/pdf") {
				handleInputChange("resume", file);
			}
		}
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (file.type === "application/pdf") {
				handleInputChange("resume", file);
			}
		}
	};

	const removeFile = () => {
		handleInputChange("resume", null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!formData.interviewName.trim()) {
			showToast("Interview name is required", "error");
			return;
		}
		if (!formData.role.trim()) {
			showToast("Role is required", "error");
			return;
		}
		if (!formData.companyName.trim()) {
			showToast("Company name is required", "error");
			return;
		}
		if (!formData.jobDescription.trim()) {
			showToast("Job description is required", "error");
			return;
		}
		if (!formData.focusAt.trim()) {
			showToast("Focus area is required", "error");
			return;
		}

		if (!user) {
			console.error("User is null in CreateInterview.jsx");
			showToast("Please login to continue", "error");
			setTimeout(() => navigate("/login"), 1000);
			return;
		}

		setIsSubmitting(true);
		const token = localStorage.getItem("token");
		
		if (!token) {
			showToast("Authentication required. Please login again.", "error");
			setTimeout(() => navigate("/login"), 1000);
			setIsSubmitting(false);
			return;
		}

		const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

		const data = new FormData();
		data.append("interviewName", formData.interviewName.trim());
		data.append("numOfQuestions", formData.numOfQuestions);
		data.append("interviewType", formData.interviewType);
		data.append("role", formData.role.trim());
		data.append("experienceLevel", formData.experienceLevel);
		data.append("companyName", formData.companyName.trim());
		data.append("jobDescription", formData.jobDescription.trim());
		data.append("focusAt", formData.focusAt.trim());
		
		if (formData.companyDescription) {
			data.append("companyDescription", formData.companyDescription.trim());
		}
		if (formData.resume) {
			data.append("resume", formData.resume);
		}

		try {
			const res = await axios.post(
				`${apiUrl}/api/interview/setup`,
				data,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (res.data && res.data.interview && res.data.interview._id) {
				const interviewId = res.data.interview._id;
				showToast("Interview setup complete! Loading questions...", "success");
				
				setTimeout(() => {
					setIsSubmitting(false);
					window.location.replace(`/interview/${interviewId}`);
				}, 5000);
			} else {
				showToast("Invalid response from server", "error");
				setIsSubmitting(false);
			}
		} catch (err) {
			console.error("Error in interview setup:", err);
			
			let errorMessage = "Something went wrong. Please try again.";
			
			if (err.response?.status === 401) {
				errorMessage = "Please login again to continue.";
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} else if (err.response?.status === 403) {
				errorMessage = "Please verify your email address first.";
				setTimeout(() => {
					navigate("/verify-otp");
				}, 2000);
			} else if (err.response?.status === 400) {
				errorMessage = err.response?.data?.error || "Please check all required fields.";
			} else if (err.response?.status === 404) {
				errorMessage = "Service not found. Please check your connection.";
			} else if (err.response?.status === 500) {
				errorMessage = err.response?.data?.error || "Server error. Please try again later.";
			} else if (err.request) {
				errorMessage = "Cannot connect to server. Please check if the server is running.";
			} else if (err.response?.data?.error) {
				errorMessage = err.response.data.error;
			}
			
			showToast(errorMessage, "error");
			setIsSubmitting(false);
		}
	};

	if (isSubmitting) {
		return (
			<LoadingScreen
				message="Setting up your interview..."
			/>
		);
	}

	return (
		<>
			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}
			<div className="min-h-screen py-12 px-4" style={{ background: '#F5F6FA' }}>
				<div className="max-w-3xl mx-auto">
					<div className="flex items-center justify-between mb-6 text-sm text-slate-600">
						<span className="font-medium">Step {currentStep} of {totalSteps}</span>
						<span className="text-slate-500">{Math.round(progressPercentage)}% Complete</span>
					</div>

					<div className="mb-8">
						<div className="w-full bg-slate-200 rounded-full h-2.5">
							<div
								className="h-2.5 rounded-full transition-all duration-500 ease-out"
								style={{ background: '#2F5DFF', width: `${progressPercentage}%` }}
							></div>
						</div>
					</div>

					<div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
						<div
							className={`transition-all duration-300 ${
								isTransitioning
									? "opacity-0 transform translate-x-4"
									: "opacity-100 transform translate-x-0"
							}`}
						>
							{currentStep === 1 && (
								<div className="p-8">
									<div className="text-center mb-8">
										<h2 className="text-3xl font-bold text-slate-800 mb-2">
											Interview Setup
										</h2>
										<p className="text-slate-600">Let's get started with your interview preparation</p>
									</div>

									<div className="space-y-6">
										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Interview Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={formData.interviewName}
												onChange={(e) =>
													handleInputChange(
														"interviewName",
														e.target.value
													)
												}
												placeholder="e.g. Frontend Role at Google"
												className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all bg-white placeholder-gray-400 ${
													formData.interviewName !== "" 
														? "border-slate-300" 
														: "border-red-300"
												}`}
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Number of Questions
											</label>
											<select
												value={formData.numOfQuestions}
												onChange={(e) =>
													handleInputChange(
														"numOfQuestions",
														Number.parseInt(
															e.target.value
														)
													)
												}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all bg-white"
												style={{ color: '#1E1E1E' }}
												onFocus={(e) => { e.target.style.borderColor = '#2F5DFF'; e.target.style.boxShadow = '0 0 0 3px rgba(47,93,255,0.1)'; }}
												onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = ''; }}
											>
												{[3, 4, 5, 6, 7, 8, 9, 10].map(
													(num) => (
														<option
															key={num}
															value={num}
														>
															{num} Questions
														</option>
													)
												)}
											</select>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-4">
												Interview Type
											</label>
											<div className="grid grid-cols-3 gap-4">
												{[
													"Technical",
													"Behavioral",
													"Mixed",
												].map((type) => (
													<button
														key={type}
														type="button"
														onClick={() =>
															handleInputChange(
																"interviewType",
																type
															)
														}
														className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
															formData.interviewType === type
																? "border-[#2F5DFF] bg-[#F5F6FA] shadow-sm"
																: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
														}`}
													>
														{type}
													</button>
												))}
											</div>
										</div>
									</div>

									<div className="flex justify-end mt-8">
										<button
											onClick={handleNext}
											disabled={formData.interviewName === ""}
											className={`px-8 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 disabled:transform-none ${
												formData.interviewName === "" 
													? "cursor-not-allowed opacity-50" 
													: ""
											}`}
											style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
										>
											<span>Next</span>
											<FaArrowRight className="w-4 h-4" />
										</button>
									</div>
								</div>
							)}

							{currentStep === 2 && (
								<div className="p-8">
									<div className="text-center mb-8">
										<h2 className="text-3xl font-bold text-slate-800 mb-2">
											Job Details
										</h2>
										<p className="text-slate-600">
											Help us understand the context of the role
										</p>
									</div>

									<div className="space-y-6">
										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Role <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={formData.role}
												onChange={(e) =>
													handleInputChange(
														"role",
														e.target.value
													)
												}
												placeholder="e.g. Software Engineer"
												className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all bg-white placeholder-gray-400 ${
													formData.role !== "" 
														? "border-slate-300" 
														: "border-red-300"
												}`}
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Experience Level
											</label>
											<div className="grid grid-cols-4 gap-3">
												{[
													"Fresher",
													"Junior",
													"Mid",
													"Senior",
												].map((type) => (
													<button
														key={type}
														type="button"
														onClick={() =>
															handleInputChange(
																"experienceLevel",
																type
															)
														}
														className={`px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
															formData.experienceLevel === type
																? "border-[#2F5DFF] bg-[#F5F6FA] shadow-sm"
																: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
														}`}
													>
														{type}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Company Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={formData.companyName}
												onChange={(e) =>
													handleInputChange(
														"companyName",
														e.target.value
													)
												}
												placeholder="e.g. Tech Innovations Inc"
												className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all bg-white placeholder-gray-400 ${
													formData.companyName !== "" 
														? "border-slate-300" 
														: "border-red-300"
												}`}
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Company Description
											</label>
											<textarea
												value={formData.companyDescription}
												onChange={(e) =>
													handleInputChange(
														"companyDescription",
														e.target.value
													)
												}
												placeholder="Describe the company's mission, values, and culture (Optional)"
												rows={4}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 transition-all resize-none bg-white placeholder-gray-400"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Job Description <span className="text-red-500">*</span>
											</label>
											<textarea
												value={formData.jobDescription}
												onChange={(e) =>
													handleInputChange(
														"jobDescription",
														e.target.value
													)
												}
												placeholder="Paste or describe the role, responsibilities, and requirements"
												rows={6}
												className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none bg-white placeholder-gray-400 ${
													formData.jobDescription !== "" 
														? "border-slate-300" 
														: "border-red-300"
												}`}
											/>
										</div>
									</div>

									<div className="flex justify-between mt-8">
										<button
											onClick={handleBack}
											className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
										>
											<FaArrowLeft className="w-4 h-4" />
											<span>Back</span>
										</button>
										<button
											onClick={handleNext}
											disabled={(formData.jobDescription === "") || (formData.companyName === "") || (formData.role === "")}
											className={`px-8 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 disabled:transform-none ${
												((formData.jobDescription === "") || (formData.companyName === "") || (formData.role === ""))
													? "cursor-not-allowed opacity-50" 
													: ""
											}`}
											style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
										>
											<span>Next</span>
											<FaArrowRight className="w-4 h-4" />
										</button>
									</div>
								</div>
							)}

							{currentStep === 3 && (
								<div className="p-8">
									<div className="text-center mb-8">
										<h2 className="text-3xl font-bold text-slate-800 mb-2">
											Almost There
										</h2>
										<p className="text-slate-600">
											Just a few finishing touches
										</p>
									</div>

									<div className="space-y-8">
										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-4">
												Resume (Optional)
											</label>

											{!formData.resume ? (
												<div
													className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
														drag
															? "border-[#2F5DFF] bg-[#F5F6FA]"
															: "border-slate-300 hover:border-slate-400 bg-slate-50"
													}`}
													onDragEnter={handleDrag}
													onDragLeave={handleDrag}
													onDragOver={handleDrag}
													onDrop={handleDrop}
												>
													<FaUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
													<div className="space-y-2">
														<button
															type="button"
															onClick={() =>
																fileInputRef.current?.click()
															}
															className="font-semibold"
															style={{ color: '#2F5DFF' }}
														>
															Upload a file
														</button>
														<span className="text-slate-500">
															{" "}or drag and drop
														</span>
													</div>
													<p className="text-sm text-slate-400 mt-2">
														PDF only, up to 5MB
													</p>
													<input
														ref={fileInputRef}
														type="file"
														accept=".pdf"
														onChange={handleFileSelect}
														className="hidden"
													/>
												</div>
											) : (
												<div className="border border-slate-300 rounded-lg p-4 flex items-center justify-between bg-white">
													<div className="flex items-center space-x-3">
														<FaFileAlt className="w-8 h-8" style={{ color: '#2F5DFF' }} />
														<div>
															<p className="font-semibold text-slate-900">
																{formData.resume.name}
															</p>
															<p className="text-sm text-slate-500">
																{(formData.resume.size / 1024 / 1024).toFixed(2)} MB
															</p>
														</div>
													</div>
													<button
														onClick={removeFile}
														className="text-slate-400 hover:text-slate-600 transition-colors"
													>
														<FaTimes className="w-5 h-5" />
													</button>
												</div>
											)}
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Focus Areas <span className="text-red-500">*</span>
											</label>
											<textarea
												value={formData.focusAt}
												onChange={(e) =>
													handleInputChange(
														"focusAt",
														e.target.value
													)
												}
												placeholder="e.g. Data Structures, System Design, Leadership"
												rows={4}
												className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none bg-white placeholder-gray-400 ${
													formData.focusAt !== "" 
														? "border-slate-300" 
														: "border-red-300"
												}`}
											/>
										</div>
									</div>

									<div className="flex justify-between mt-8">
										<button
											onClick={handleBack}
											className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
										>
											<FaArrowLeft className="w-4 h-4" />
											<span>Back</span>
										</button>
										<button
											onClick={handleSubmit}
											disabled={formData.focusAt === ""}
											className={`px-8 py-3 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none ${
												formData.focusAt === "" 
													? "cursor-not-allowed opacity-50" 
													: ""
											}`}
											style={{ background: '#2F5DFF', boxShadow: '0 4px 15px rgba(47,93,255,0.4)' }}
										>
											Start Interview
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
