import express from "express";
import Report from "../models/ReportModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/UserModel.js";

const router = express.Router();

router.get("/:interviewId", async (req, res) => {
  try {
    const interviewId = req.params.interviewId;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID format" });
    }

    const report = await Report.findOne({ interviewId });
    if (!report) {
      return res.status(404).json({ error: "Report not found. The interview may still be in progress." });
    }
    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

router.get("/", authMiddleware, async(req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Find reports by userId (can be string or ObjectId)
  const reports = await Report.find({ 
    $or: [
      { userId: user._id.toString() },
      { userId: user._id },
    ]
  })
    .populate("interviewId")
    .sort({ createdAt: -1 });
  res.json(reports);
});

export default router;
