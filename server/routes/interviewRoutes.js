import express from "express";
import Interview from "../models/InterviewModel.js";
import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import pdfParse from "pdf-parse";
import {
  summarizeResumeText,
  generateQuestions,
  analyzeAnswer,
  interviewSummary,
} from "../services/aiService.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

/**
 * POST /setup
 * Create a new interview (authenticated)
 */
router.post(
  "/setup",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("Interview setup request received");
      console.log("Request body keys:", Object.keys(req.body));
      console.log("Request file:", req.file ? "File present" : "No file");

      // Parse FormData fields (they come as strings)
      const interviewName = req.body.interviewName || "";
      const numOfQuestions = parseInt(req.body.numOfQuestions, 10) || 3;
      const interviewType = req.body.interviewType || "Technical";
      const role = req.body.role || "";
      const experienceLevel = req.body.experienceLevel || "Fresher";
      const companyName = req.body.companyName || "";
      const companyDescription = req.body.companyDescription || "";
      const jobDescription = req.body.jobDescription || "";
      const focusAt = req.body.focusAt || "";

      // Trim and validate required fields
      const trimmedInterviewName = interviewName.trim();
      const trimmedRole = role.trim();
      const trimmedCompanyName = companyName.trim();
      const trimmedJobDescription = jobDescription.trim();
      const trimmedFocusAt = focusAt.trim();
      const trimmedCompanyDescription = (companyDescription || "").trim();

      if (!trimmedInterviewName) {
        return res.status(400).json({ error: "Interview Name is required" });
      }
      if (!trimmedRole) {
        return res.status(400).json({ error: "Role is required" });
      }
      if (!trimmedCompanyName) {
        return res.status(400).json({ error: "Company Name is required" });
      }
      if (!trimmedJobDescription) {
        return res.status(400).json({ error: "Job Description is required" });
      }
      if (!trimmedFocusAt) {
        return res.status(400).json({ error: "Focus Area is required" });
      }

      const user = req.user;
      if (!user) {
        console.error("User not found in request");
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Handle resume upload (optional)
      let resume_link = "";
      let resume_text = null;
      if (req.file && req.file.buffer) {
        const streamUpload = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                folder: "prepwise/resumes",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  return reject(error);
                }
                resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });

        try {
          const result = await streamUpload();
          if (result && result.secure_url) resume_link = result.secure_url;
        } catch (uploadErr) {
          console.error("Cloudinary upload failed:", uploadErr);
          return res.status(500).json({ error: "Cloudinary upload failed" });
        }

		try {
			const pdfData = await pdfParse(req.file.buffer);
			resume_text = pdfData.text ? pdfData.text.slice(0, 4000) : "";
		  } catch (pdfError) {
			console.warn("PDF parse warning:", pdfError.message);
			resume_text = "";
        }
      }

      // Summarize resume if present
      let resumeSummary = null;
      if (resume_text) {
        try {
          resumeSummary = await summarizeResumeText(resume_text);
        } catch (err) {
          console.error("Resume summarization failed:", err);
          // don't block creation entirely — log and continue
          resumeSummary = null;
        }
      }

      // Generate questions using intelligent fallback system
      // This works without requiring paid AI services
      let questions;
      try {
        questions = await generateQuestions({
          num_of_questions: numOfQuestions,
          interview_type: interviewType,
          role: trimmedRole,
          experience_level: experienceLevel,
          company_name: trimmedCompanyName,
          company_description: trimmedCompanyDescription,
          job_description: trimmedJobDescription,
          focus_area: trimmedFocusAt,
          resume_summary: resumeSummary,
        });
      } catch (err) {
        console.error("Question generation error:", err);
        return res.status(500).json({ 
          error: "Unable to generate questions. Please try again." 
        });
      }

      // Validate questions
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error("No questions generated");
        return res.status(500).json({ 
          error: "Failed to generate questions. Please try again." 
        });
      }

      // Validate each question has required fields
      const validQuestions = questions.filter(q => 
        q && q.question && q.preferred_answer && 
        q.question.trim().length > 0 && 
        q.preferred_answer.trim().length > 0
      );

      if (validQuestions.length === 0) {
        console.error("No valid questions generated");
        return res.status(500).json({ 
          error: "Generated questions are invalid. Please try again." 
        });
      }

      if (validQuestions.length < numOfQuestions) {
        console.warn(`Generated ${validQuestions.length} questions, expected ${numOfQuestions}`);
      }

      console.log(`Successfully generated ${validQuestions.length} valid questions for interview`);
      questions = validQuestions.slice(0, numOfQuestions);

      const interview = new Interview({
        user_id: user._id,
        interview_name: trimmedInterviewName,
        num_of_questions: numOfQuestions,
        interview_type: interviewType.toLowerCase(),
        role: trimmedRole,
        experience_level: experienceLevel.toLowerCase(),
        company_name: trimmedCompanyName,
        company_description: trimmedCompanyDescription,
        job_description: trimmedJobDescription,
        resume_link,
        focus_area: trimmedFocusAt,
        questions,
      });

      await interview.save();

      console.log("Interview created successfully:", interview._id);
      return res.status(201).json({
        message: "Interview setup successfully",
        interview,
      });
    } catch (err) {
      console.error("Interview setup error:", err);
      console.error("Error stack:", err.stack);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        code: err.code,
      });

      let errorMessage = "Failed to set up interview. Please try again.";
      if (err.message && err.message.includes("Hugging Face")) {
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      } else if (err.message && err.message.includes("Cloudinary")) {
        errorMessage = "File upload failed. Please check your file and try again.";
      } else if (
        (err.message && err.message.includes("MongoDB")) ||
        (err.message && err.message.toLowerCase().includes("database"))
      ) {
        errorMessage = "Database error. Please try again later.";
      }

      return res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

/**
 * GET /
 * Get all interviews for authenticated user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const interviews = await Interview.find({ user_id: user._id }).sort({ created_at: -1 });
    return res.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

/**
 * GET /:interviewId
 * Get a specific interview (no auth required here, but you can add authMiddleware if needed)
 */
router.get("/:interviewId", async (req, res) => {
  try {
    const interviewId = req.params.interviewId;

    // Validate MongoDB ObjectId format (24 hex chars)
    if (!/^[0-9a-fA-F]{24}$/.test(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID format" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    return res.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid interview ID format" });
    }
    return res.status(500).json({ error: "Failed to fetch interview" });
  }
});

/**
 * POST /:interviewId/answer
 * Submit an answer to a question and analyze it (authenticated recommended)
 */
router.post("/:interviewId/answer", authMiddleware, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    if (questionId === undefined || questionId === null || !answer) {
      return res.status(400).json({ error: "Question ID and answer are required" });
    }

    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // questionId may be an index (0-based) or an id; attempt numeric index first
    let question = null;
    if (!isNaN(Number(questionId))) {
      const idx = Number(questionId);
      question = interview.questions[idx];
    } else {
      // if questions are objects with ids, find by id
      question = interview.questions.find((q) => q._id && q._id.toString() === questionId);
    }

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Analyze user's answer using AI (with fallback)
    let analysis;
    try {
      analysis = await analyzeAnswer({
        question: question.question,
        userAnswer: answer,
        preferredAnswer: question.preferred_answer,
        role: interview.role,
        experience_level: interview.experience_level,
        interview_type: interview.interview_type,
      });
    } catch (aiErr) {
      console.error("AI analysis failed, using fallback:", aiErr.message);
      // Use fallback analysis - the analyzeAnswer function has fallback built in
      // But if it throws, we still need to provide a default
      analysis = {
        score: 75,
        feedback: "Your answer has been recorded. Continue practicing to improve your responses.",
      };
    }

    // Ensure we have valid analysis
    if (!analysis || typeof analysis.score !== 'number') {
      analysis = {
        score: 75,
        feedback: "Your answer has been recorded. Continue practicing to improve your responses.",
      };
    }

    const { score = 0, feedback = "" } = analysis;

    // create or update the report
    let report = await Report.findOne({ interviewId: req.params.interviewId });
    if (!report) {
      report = new Report({
        interviewId: req.params.interviewId,
        userId: interview.user_id.toString(), // Ensure userId is a string
        answers: [],
      });
    }

    // Add the answer's analysis to the report
    report.answers.push({
      question: question.question,
      userAnswer: answer,
      preferredAnswer: question.preferred_answer,
      score,
      feedback,
    });

    // If all answers are analyzed, calculate final score and summary
    const totalQuestions = interview.num_of_questions || interview.questions.length;
    const totalAnswered = report.answers.length;
    if (totalAnswered === totalQuestions) {
      // Final Score (average)
      const avgScore =
        report.answers.reduce((sum, ans) => sum + (Number(ans.score) || 0), 0) /
        report.answers.length;

      // Generate overall summary, strengths, and areas of improvement
      const combinedFeedback = report.answers.map((a) => a.feedback || "").join("\n");

      let summaryText = "";
      try {
        summaryText = await interviewSummary(combinedFeedback);
      } catch (summaryErr) {
        console.error("Interview summary generation failed:", summaryErr);
        summaryText = "";
      }

      // Extract sections from summary text with multiple pattern matching
      const extractSection = (label) => {
        if (!summaryText) return "";
        
        // Try multiple patterns
        const patterns = [
          new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, "i"),
          new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\*\\*|$)`, "i"),
          new RegExp(`${label}\\s*([\\s\\S]*?)(?=\\n\\n|$)`, "i"),
        ];
        
        for (const pattern of patterns) {
          const match = summaryText.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
        
        // Fallback: extract by finding label and taking following lines
        const lines = summaryText.split('\n');
        const labelIndex = lines.findIndex(line => 
          line.toLowerCase().includes(label.toLowerCase())
        );
        if (labelIndex >= 0) {
          const sectionLines = [];
          for (let i = labelIndex + 1; i < lines.length && i < labelIndex + 10; i++) {
            if (lines[i].trim().startsWith('**') && i > labelIndex + 1) {
              break;
            }
            if (lines[i].trim() && !lines[i].trim().match(/^\*\*/)) {
              sectionLines.push(lines[i].trim());
            }
          }
          return sectionLines.join('\n');
        }
        
        return "";
      };

      let overall = extractSection("Overall Summary");
      let strengths = extractSection("Strengths");
      let areas = extractSection("Areas of Improvement");

      // Provide defaults if extraction failed
      if (!overall || overall.trim().length === 0) {
        overall = "Interview completed successfully. Review your performance and continue practicing to improve your skills.";
      }
      if (!strengths || strengths.trim().length === 0) {
        strengths = "1. Completed all questions successfully\n2. Demonstrated knowledge and understanding\n3. Showed commitment and effort";
      }
      if (!areas || areas.trim().length === 0) {
        areas = "1. Add more detail and specific examples to answers\n2. Practice structuring responses clearly\n3. Continue practicing to build confidence";
      }

      report.finalScore = Number(avgScore.toFixed(2));
      report.strengths = strengths;
      report.areaOfImprovement = areas;
      report.summary = overall;
    }

    await report.save();
    return res.status(201).json({ success: true, reportId: report._id });
  } catch (error) {
    console.error("Error processing answer:", error);
    return res.status(500).json({ error: "Failed to process answer" });
  }
});

/**
 * DELETE /:interviewId
 * Delete an interview and its associated report (authenticated)
 */
router.delete("/:interviewId", authMiddleware, async (req, res) => {
  try {
    const interviewId = req.params.interviewId;
    const user = req.user;

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID format" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Check if user owns this interview
    if (interview.user_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this interview" });
    }

    // Delete associated report if exists
    await Report.deleteOne({ interviewId });

    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);

    return res.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return res.status(500).json({ error: "Failed to delete interview" });
  }
});

export default router;
