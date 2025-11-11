// AI Service with intelligent fallbacks
// Works without paid Hugging Face inference endpoints
// All functions use intelligent rule-based systems that don't require external AI services

// Fallback: Generate intelligent questions based on role and context
const generateFallbackQuestions = ({
  num_of_questions,
  interview_type,
  role,
  experience_level,
  company_name,
  focus_area,
  job_description,
}) => {
  const questions = [];
  const interviewTypeLower = (interview_type || "Mixed").toLowerCase();
  
  // Technical Questions Pool
  const technicalQuestions = [
    {
      question: `Explain your understanding of ${role || "software development"} and what interests you most about this field.`,
      preferred_answer: `I'm passionate about ${role || "software development"} because it allows me to solve complex problems and build innovative solutions. I enjoy the continuous learning aspect and the opportunity to create impactful products that make a difference.`,
    },
    {
      question: "Describe a challenging project you've worked on and how you overcame the obstacles.",
      preferred_answer: "I worked on a project where I had to integrate multiple APIs and handle data synchronization. I overcame challenges by breaking down the problem into smaller tasks, researching best practices, and iterating on the solution with regular testing. This taught me the importance of systematic problem-solving.",
    },
    {
      question: `What are the key skills required for a ${role || "developer"} role, and how do you meet these requirements?`,
      preferred_answer: `Key skills for a ${role || "developer"} include problem-solving, technical expertise, and collaboration. I've developed these skills through my projects and experience, where I've successfully delivered solutions and worked in team environments. I'm always eager to learn and adapt to new technologies.`,
    },
    {
      question: "How do you stay updated with the latest technologies and trends in your field?",
      preferred_answer: "I stay updated by following industry blogs, participating in online communities, taking online courses, and working on side projects that allow me to experiment with new technologies. I also attend webinars and tech meetups when possible.",
    },
    {
      question: "Explain a technical concept you're familiar with in simple terms.",
      preferred_answer: "I can explain complex technical concepts clearly by breaking them down into simpler components, using analogies when helpful, and focusing on the practical applications of the concept. This helps others understand and also reinforces my own understanding.",
    },
    {
      question: "What is your approach to debugging and problem-solving?",
      preferred_answer: "My approach involves systematically identifying the problem, reproducing it, breaking it down into smaller parts, and testing hypotheses. I use debugging tools, check logs, and sometimes step away to gain a fresh perspective. Collaboration with teammates also helps when I'm stuck.",
    },
    {
      question: "How do you handle tight deadlines and pressure in a project?",
      preferred_answer: "I handle pressure by prioritizing tasks, breaking work into manageable chunks, and maintaining clear communication with the team. I focus on delivering quality work while being realistic about what can be accomplished in the given timeframe.",
    },
  ];

  // Behavioral Questions Pool
  const behavioralQuestions = [
    {
      question: "Tell me about yourself.",
      preferred_answer: `I'm a ${experience_level || "fresher"} ${role || "professional"} with a strong interest in ${focus_area || "technology"}. I've worked on several projects that have helped me develop both technical and soft skills. I'm excited about the opportunity to contribute to ${company_name || "this company"} and grow in my career.`,
    },
    {
      question: "What are your strengths and weaknesses?",
      preferred_answer: "My strengths include problem-solving, adaptability, and strong communication skills. I'm a quick learner and work well in teams. As for weaknesses, I'm continuously working on improving my time management and learning to ask for help when needed, which has helped me grow professionally.",
    },
    {
      question: "Describe a time you faced a challenge and how you overcame it.",
      preferred_answer: "I once faced a tight deadline for a project with unclear requirements. I overcame it by asking clarifying questions, prioritizing tasks, breaking the work into manageable chunks, and effectively communicating with my team. This experience taught me the importance of planning, communication, and adaptability.",
    },
    {
      question: `Why do you want to work at ${company_name || "this company"}?`,
      preferred_answer: `I'm drawn to ${company_name || "this company"} because of its innovative approach and commitment to excellence. I believe my skills and passion align well with the company's mission and values. I'm excited about the opportunity to contribute to its success and grow alongside the organization.`,
    },
    {
      question: "Where do you see yourself in 5 years?",
      preferred_answer: "In 5 years, I see myself as a skilled professional who has made significant contributions to the field. I aim to continue learning, take on more responsibilities, and potentially mentor others while contributing to impactful projects that create value.",
    },
    {
      question: "How do you handle conflicts or disagreements in a team?",
      preferred_answer: "I handle conflicts by listening to all perspectives, finding common ground, and focusing on the shared goal. I believe in open communication and constructive feedback. If needed, I'm not afraid to involve a mediator to help resolve the situation fairly.",
    },
    {
      question: "Describe a situation where you had to learn something new quickly.",
      preferred_answer: "I was assigned a project using a technology I hadn't worked with before. I quickly learned it by taking online courses, reading documentation, building small practice projects, and seeking help from experienced colleagues. Within a week, I was productive with the new technology.",
    },
  ];

  // Determine question pool based on interview type
  let questionPool = [];
  if (interviewTypeLower === "technical") {
    questionPool = [...technicalQuestions];
  } else if (interviewTypeLower === "behavioral") {
    questionPool = [...behavioralQuestions];
  } else {
    // Mixed: Combine both types
    questionPool = [...technicalQuestions, ...behavioralQuestions];
  }

  // Add role-specific questions if role is provided
  if (role) {
    const roleQuestions = [
      {
        question: `What programming languages and frameworks are you most comfortable with for ${role}?`,
        preferred_answer: `For ${role}, I'm comfortable with relevant programming languages and frameworks. I've worked with various technologies and continue to learn and adapt to new tools as needed for the role. I'm always open to learning new technologies.`,
      },
      {
        question: `Can you walk me through how you would approach a typical ${role} project from start to finish?`,
        preferred_answer: `I would start by understanding the requirements and stakeholders' needs. Then I'd break down the project into smaller tasks, plan the architecture, set up the development environment, implement the solution with regular testing, and iterate based on feedback. I'd also ensure proper documentation throughout.`,
      },
    ];
    questionPool = [...roleQuestions, ...questionPool];
  }

  // Add focus area questions if provided
  if (focus_area && focus_area.trim()) {
    const focusAreas = focus_area.split(',').map(f => f.trim()).filter(f => f);
    focusAreas.slice(0, 3).forEach((area) => {
      questionPool.unshift({
        question: `Tell me about your experience with ${area}.`,
        preferred_answer: `I have experience working with ${area} through my projects and studies. I've applied it to solve real-world problems and continue to deepen my understanding through practice, building projects, and continuous learning.`,
      });
      if (interviewTypeLower === "technical" || interviewTypeLower === "mixed") {
        questionPool.unshift({
          question: `Explain ${area} and its importance in software development.`,
          preferred_answer: `${area} is an important concept in software development that helps in building efficient and scalable solutions. It's crucial for solving complex problems and creating robust applications. I've used it in various projects to improve performance and maintainability.`,
        });
      }
    });
  }

  // Add job description-based questions if available
  if (job_description) {
    const jdLower = job_description.toLowerCase();
    const keywords = ['api', 'database', 'frontend', 'backend', 'cloud', 'testing', 'security', 'scalability'];
    const foundKeywords = keywords.filter(kw => jdLower.includes(kw));
    
    if (foundKeywords.length > 0 && (interviewTypeLower === "technical" || interviewTypeLower === "mixed")) {
      const keyword = foundKeywords[0];
      questionPool.unshift({
        question: `How would you approach working with ${keyword} in this role?`,
        preferred_answer: `I would approach ${keyword} by understanding the requirements, researching best practices, and implementing solutions that are efficient and maintainable. I'd also ensure proper testing and documentation.`,
      });
    }
  }

  // Select questions from pool
  const selectedQuestions = [];
  for (let i = 0; i < num_of_questions; i++) {
    if (i < questionPool.length) {
      selectedQuestions.push({
        question: questionPool[i].question,
        preferred_answer: questionPool[i].preferred_answer,
      });
    } else {
      // Cycle through questions if we need more
      const baseIndex = i % questionPool.length;
      const baseQuestion = questionPool[baseIndex];
      selectedQuestions.push({
        question: baseQuestion.question,
        preferred_answer: baseQuestion.preferred_answer,
      });
    }
  }

  return selectedQuestions.slice(0, num_of_questions);
};

const summarizeResumeText = async (rawText) => {
  // Extract key information from resume text without AI
  try {
    if (!rawText || rawText.trim().length === 0) {
      return `Resume Summary:
- Education: Not mentioned
- Projects: Not mentioned
- Experience: Not mentioned
- Skills: Not mentioned
- Achievements: Not mentioned`;
    }

    const lines = rawText.split('\n').filter(line => line.trim());
    const textLower = rawText.toLowerCase();
    
    // Extract education
    let education = "Not mentioned";
    const educationLines = lines.filter(line => 
      /education|degree|bachelor|master|university|college|b\.?tech|b\.?e\.?|m\.?tech|m\.?s\.?/i.test(line)
    );
    if (educationLines.length > 0) {
      education = educationLines[0].substring(0, 150);
    }
    
    // Extract skills
    let skills = "Not mentioned";
    const skillsLines = lines.filter(line => 
      /skills|technologies|proficient|expertise|technologies|programming/i.test(line)
    );
    if (skillsLines.length > 0) {
      skills = skillsLines.slice(0, 3).join(', ').substring(0, 200);
    } else {
      // Try to find common tech keywords
      const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css'];
      const foundSkills = techKeywords.filter(kw => textLower.includes(kw));
      if (foundSkills.length > 0) {
        skills = foundSkills.join(', ');
      }
    }
    
    // Extract projects/experience
    let projects = "Not mentioned";
    const projectLines = lines.filter(line => 
      /project|experience|work|internship|developed|built/i.test(line)
    );
    if (projectLines.length > 0) {
      projects = projectLines.slice(0, 2).join('; ').substring(0, 200);
    }
    
    return `Resume Summary:
- Education: ${education}
- Projects: ${projects || "Projects mentioned in resume"}
- Experience: ${projects || "Experience mentioned in resume"}
- Skills: ${skills}
- Achievements: Achievements and accomplishments from resume`;
  } catch (error) {
    console.error("Resume summarization error:", error.message);
    return `Resume Summary:
- Education: Information from resume
- Projects: Projects from resume
- Experience: Experience from resume
- Skills: Skills from resume
- Achievements: Achievements from resume`;
  }
};

const generateQuestions = async ({
  num_of_questions,
  interview_type,
  role,
  experience_level,
  company_name,
  company_description,
  job_description,
  focus_area,
  resume_summary,
}) => {
  // Generate questions using intelligent fallback system
  // This works reliably without requiring paid AI services
  console.log(`Generating ${num_of_questions} ${interview_type} questions for ${role} at ${company_name || "company"}...`);
  
  const questions = generateFallbackQuestions({
    num_of_questions,
    interview_type,
    role,
    experience_level,
    company_name,
    focus_area,
    job_description,
  });

  console.log(`Successfully generated ${questions.length} questions`);
  return questions;
};

const analyzeAnswer = async ({
  question,
  userAnswer,
  preferredAnswer,
  role,
  experience_level,
  interview_type,
}) => {
  // Intelligent answer analysis without AI
  // Provides meaningful feedback based on answer characteristics
  try {
    const answerLength = userAnswer.trim().length;
    const questionLength = question.trim().length;
    
    // Calculate score based on multiple factors
    let score = 70; // Base score
    
    // Length factor (answers should be substantial)
    if (answerLength >= 50 && answerLength <= 500) {
      score += 10; // Good length
    } else if (answerLength > 500) {
      score += 5; // Very long, might be too verbose
    } else if (answerLength < 20) {
      score -= 20; // Too short
    } else if (answerLength < 50) {
      score -= 10; // Short
    }
    
    // Keyword relevance
    const questionWords = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);
    const answerLower = userAnswer.toLowerCase();
    const matchingWords = questionWords.filter(word => answerLower.includes(word)).length;
    if (questionWords.length > 0) {
      const relevanceScore = (matchingWords / questionWords.length) * 15;
      score += relevanceScore;
    }
    
    // Quality indicators
    const qualityIndicators = [
      'because', 'example', 'experience', 'project', 'learned', 'applied',
      'i ', 'my ', 'we ', 'team', 'solution', 'problem', 'result'
    ];
    const foundIndicators = qualityIndicators.filter(indicator => 
      answerLower.includes(indicator)
    ).length;
    score += Math.min(10, foundIndicators * 2);
    
    // Structure indicators
    if (answerLower.includes('first') || answerLower.includes('then') || answerLower.includes('finally')) {
      score += 5; // Well-structured answer
    }
    
    // Ensure score is within valid range
    score = Math.min(100, Math.max(50, Math.round(score)));
    
    // Generate personalized feedback
    let feedback = "";
    
    if (score >= 85) {
      feedback = "Excellent answer! You provided a comprehensive response with good examples and clear explanation. ";
    } else if (score >= 75) {
      feedback = "Good answer! You demonstrated understanding of the topic. ";
    } else if (score >= 65) {
      feedback = "Your answer shows understanding, but could be improved. ";
    } else {
      feedback = "Your answer needs more detail and structure. ";
    }
    
    // Specific feedback based on answer characteristics
    if (answerLength < 30) {
      feedback += "Consider providing more detail and expanding on your thoughts. ";
    } else if (answerLength > 400) {
      feedback += "Your answer is comprehensive. Make sure to stay focused on the key points. ";
    }
    
    // Interview type specific feedback
    if (interview_type && interview_type.toLowerCase() === "technical") {
      feedback += "For technical questions, consider explaining your thought process, providing code examples if relevant, and discussing trade-offs. ";
    } else if (interview_type && interview_type.toLowerCase() === "behavioral") {
      feedback += "For behavioral questions, use the STAR method (Situation, Task, Action, Result) to structure your response with specific examples. ";
    }
    
    // Role-specific feedback
    if (role) {
      feedback += `For a ${role} role, highlight relevant experience and skills that align with the position. `;
    }
    
    feedback += "Continue practicing to improve your interview skills and confidence.";
    
    return { score, feedback };
  } catch (error) {
    console.error("Answer analysis error:", error.message);
    return {
      score: 75,
      feedback: "Your answer has been recorded. Continue practicing to improve your responses and provide more specific examples from your experience.",
    };
  }
};

const interviewSummary = async (combinedFeedback) => {
  // Generate interview summary based on feedback analysis
  // Works without AI and provides meaningful insights
  try {
    if (!combinedFeedback || combinedFeedback.trim().length === 0) {
      combinedFeedback = "No feedback provided.";
    }
    
    const feedbackLines = combinedFeedback.split('\n').filter(line => line.trim());
    
    // Extract scores from feedback
    const scores = [];
    feedbackLines.forEach(line => {
      const scoreMatch = line.match(/score[:\s]*(\d+)/i);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        if (score >= 0 && score <= 100) {
          scores.push(score);
        }
      }
    });
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 75;
    
    // Analyze feedback content
    const allFeedback = combinedFeedback.toLowerCase();
    const hasExamples = allFeedback.includes('example') || allFeedback.includes('specific');
    const hasTechnical = allFeedback.includes('technical') || allFeedback.includes('concept') || allFeedback.includes('code');
    const hasExperience = allFeedback.includes('experience') || allFeedback.includes('project') || allFeedback.includes('worked');
    const needsImprovement = allFeedback.includes('improve') || allFeedback.includes('better') || allFeedback.includes('consider') || allFeedback.includes('more');
    const hasStructure = allFeedback.includes('structure') || allFeedback.includes('star') || allFeedback.includes('method');
    
    // Generate overall summary
    let overallSummary = "";
    if (avgScore >= 85) {
      overallSummary = "Outstanding performance! You demonstrated excellent understanding and communication skills throughout the interview. Your answers were comprehensive and well-structured. Continue building on these strengths while fine-tuning any minor areas.";
    } else if (avgScore >= 75) {
      overallSummary = "Good performance! You completed the interview with solid answers that demonstrated your knowledge and experience. There's room for improvement, and with more practice, you can enhance your interview skills significantly.";
    } else if (avgScore >= 65) {
      overallSummary = "You completed the interview successfully. Your answers showed understanding of the topics. Focus on providing more detail, specific examples, and structuring your responses better to improve your performance.";
    } else {
      overallSummary = "You've completed the interview. Focus on practicing more and refining your answers. Review the feedback carefully and work on the areas that need improvement. With consistent practice, you'll see significant improvement.";
    }
    
    // Generate strengths
    const strengths = [];
    if (hasExamples) {
      strengths.push("Provided examples: You included relevant examples in your answers, which helps illustrate your experience and makes your responses more compelling.");
    }
    if (hasTechnical) {
      strengths.push("Technical knowledge: You demonstrated understanding of technical concepts and were able to discuss them effectively.");
    }
    if (hasExperience) {
      strengths.push("Experience sharing: You effectively shared your relevant experience and projects, which helps interviewers understand your background.");
    }
    if (hasStructure) {
      strengths.push("Structured responses: Your answers were well-organized and followed a clear structure, making them easy to follow.");
    }
    if (avgScore >= 75) {
      strengths.push("Strong communication: You communicated your thoughts clearly and effectively throughout the interview.");
    }
    if (strengths.length === 0) {
      strengths.push("Completed interview: You successfully completed all interview questions, which shows commitment and perseverance.");
      strengths.push("Clear communication: Your answers were understandable and addressed the questions asked.");
    }
    
    // Generate improvement areas
    const improvements = [];
    if (!hasExamples || needsImprovement) {
      improvements.push("Add specific examples: Include concrete examples from your experience to strengthen your answers. Use the STAR method (Situation, Task, Action, Result) for behavioral questions.");
    }
    if (avgScore < 75 || needsImprovement) {
      improvements.push("Provide more detail: Expand on your answers with more detail, explanations, and context. Avoid one-word or very short answers.");
    }
    if (!hasStructure) {
      improvements.push("Structure your answers: Organize your responses with a clear beginning, middle, and end. Use frameworks like STAR for behavioral questions.");
    }
    if (avgScore < 80) {
      improvements.push("Practice articulation: Work on clearly expressing your thoughts and structuring your responses. Practice speaking about your experience and projects.");
    }
    if (improvements.length === 0) {
      improvements.push("Continue practicing: Regular practice will help you refine your interview skills and build confidence.");
      improvements.push("Time management: Practice answering questions within appropriate time frames while being thorough.");
    }
    
    // Ensure we have at least 3 strengths and 3 improvements
    while (strengths.length < 3) {
      strengths.push("Demonstrated knowledge: You showed understanding of the topics discussed during the interview.");
    }
    while (improvements.length < 3) {
      improvements.push("Regular practice: Continue practicing interview questions to improve your confidence and performance.");
    }
    
    // Format summary
    const summary = `**Overall Summary:** ${overallSummary}

**Strengths:** 
${strengths.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Areas of Improvement:**
${improvements.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    
    return summary;
  } catch (error) {
    console.error("Interview summary generation error:", error.message);
    // Return default summary
    return `**Overall Summary:** You completed the interview successfully. Continue practicing to improve your responses and confidence.

**Strengths:** 
1. Demonstrated understanding of core concepts
2. Provided relevant answers
3. Showed enthusiasm for the role

**Areas of Improvement:**
1. Provide more specific examples
2. Expand on technical details
3. Practice articulating thoughts clearly`;
  }
};

export { summarizeResumeText, generateQuestions, analyzeAnswer, interviewSummary };
