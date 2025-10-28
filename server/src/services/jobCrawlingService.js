import JobPosting from "../models/JobPosting.js";
import User from "../models/User.js";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

class JobCrawlingService {
  constructor() {
    this.sources = [
      {
        name: "CSC Job Portal",
        url: "https://csc.gov.ph/career-opportunities/",
        selector: ".job-posting",
        enabled: true,
      },
      {
        name: "DBM Job Opportunities", 
        url: "https://dbm.gov.ph/career-opportunities/",
        selector: ".career-item",
        enabled: true,
      },
      {
        name: "Government Jobs Portal",
        url: "https://governmentjobs.ph/jobs",
        selector: ".job-card",
        enabled: true,
      },
    ];
    
    this.crawlInterval = 6 * 60 * 60 * 1000;
    this.isCrawling = false;
  }

  async startPeriodicCrawling() {
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
    }

    this.crawlInterval = setInterval(async () => {
      await this.crawlAllSources();
    }, this.crawlInterval);

    await this.crawlAllSources();
  }

  async crawlAllSources() {
    if (this.isCrawling) {
      return;
    }

    this.isCrawling = true;

    try {
      for (const source of this.sources) {
        if (source.enabled) {
          await this.crawlSource(source);
          await this.delay(5000);
        }
      }
    } finally {
      this.isCrawling = false;
    }
  }

  async crawlSource(source) {
    try {
      let browser = null;

      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox", 
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
          ],
        });

        const page = await browser.newPage();
        
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        );
        
        await page.goto(source.url, { 
          waitUntil: "networkidle2", 
          timeout: 30000 
        });

        const content = await page.content();
        const jobs = await this.parseJobListings(content, source);

        for (const jobData of jobs) {
          await this.saveOrUpdateJob(jobData);
        }

        await page.close();
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error.message);
    }
  }

  async parseJobListings(html, source) {
    const $ = cheerio.load(html);
    const jobs = [];

    $(source.selector).each((index, element) => {
      try {
        const jobData = this.extractJobData($, element, source);
        if (this.validateJobData(jobData)) {
          jobs.push(jobData);
        }
      } catch (error) {
        console.error("Error parsing job listing:", error.message);
      }
    });

    return jobs;
  }

  extractJobData($, element, source) {
    const $job = $(element);
    
    const title = this.cleanText($job.find(".job-title, .position-title, h3, h4").first().text());
    const department = this.cleanText($job.find(".department, .agency, .org").first().text()) || 
                      this.inferDepartmentFromText(title);
    const agency = this.cleanText($job.find(".agency, .office").first().text()) || department;
    const location = this.cleanText($job.find(".location, .place, .address").first().text()) || "Philippines";
    const description = this.cleanText($job.find(".description, .summary, .details").first().text());
    
    let deadlineText = this.cleanText($job.find(".deadline, .closing-date, .apply-by").first().text());
    let applicationDeadline = this.parseDeadline(deadlineText);
    
    if (!applicationDeadline || applicationDeadline < new Date()) {
      applicationDeadline = new Date();
      applicationDeadline.setDate(applicationDeadline.getDate() + 30);
    }

    const salaryText = this.cleanText($job.find(".salary, .compensation, .sg").first().text());
    const salaryInfo = this.parseSalary(salaryText);
    
    const examLevel = this.inferExamLevel(title, description);
    const jobLevel = this.inferJobLevel(title, description);
    
    const applicationUrl = $job.find("a").first().attr("href") || source.url;
    const fullUrl = applicationUrl.startsWith("http") ? applicationUrl : `${new URL(source.url).origin}${applicationUrl}`;

    return {
      title: title || "Government Position",
      department,
      agency,
      location,
      description: description || "Government position available",
      salaryGrade: salaryInfo.grade,
      salaryRange: salaryInfo.range,
      jobLevel,
      examLevel,
      applicationDeadline,
      applicationMethod: "Online",
      applicationUrl: fullUrl,
      sourceUrl: fullUrl,
      sourceWebsite: source.name,
      postedDate: new Date(),
      status: "active",
      qualifications: this.extractQualifications(description),
      requirements: {
        education: this.inferEducationRequirement(examLevel),
        experience: this.inferExperienceRequirement(jobLevel),
        skills: this.extractSkills(description),
      },
      matchingKeywords: this.extractKeywords(title + " " + description),
    };
  }

  validateJobData(jobData) {
    return jobData.title && 
           jobData.title.length > 3 && 
           jobData.department && 
           jobData.applicationDeadline && 
           jobData.applicationDeadline > new Date();
  }

  async saveOrUpdateJob(jobData) {
    try {
      const existingJob = await JobPosting.findOne({
        title: jobData.title,
        department: jobData.department,
        sourceWebsite: jobData.sourceWebsite,
      });

      if (existingJob) {
        if (existingJob.status === "expired" || existingJob.lastUpdated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          await JobPosting.findByIdAndUpdate(existingJob._id, {
            ...jobData,
            lastUpdated: new Date(),
            crawledAt: new Date(),
          });
        }
      } else {
        await JobPosting.create({
          ...jobData,
          crawledAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error saving job:", error.message);
    }
  }

  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, " ").replace(/\n+/g, " ") : "";
  }

  parseDeadline(deadlineText) {
    if (!deadlineText) return null;
    
    const datePatterns = [
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
      /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    ];
    
    for (const pattern of datePatterns) {
      const match = deadlineText.match(pattern);
      if (match) {
        try {
          let date;
          if (pattern === datePatterns[0]) {
            date = new Date(match[3], match[1] - 1, match[2]);
          } else if (pattern === datePatterns[1]) {
            date = new Date(match[1], match[2] - 1, match[3]);
          } else if (pattern === datePatterns[2]) {
            const months = {
              january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
              july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
            };
            date = new Date(match[3], months[match[1].toLowerCase()], match[2]);
          }
          
          if (date && !isNaN(date.getTime())) {
            return date;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }

  parseSalary(salaryText) {
    if (!salaryText) return { grade: null, range: {} };
    
    const sgMatch = salaryText.match(/SG[-\s]*(\d+)/i);
    const salaryGrade = sgMatch ? `SG ${sgMatch[1]}` : null;
    
    const rangeMatch = salaryText.match(/(\d{1,3}(?:,\d{3})*)\s*-?\s*(?:to)?\s*(\d{1,3}(?:,\d{3})*)/);
    let range = {};
    
    if (rangeMatch) {
      range.min = parseInt(rangeMatch[1].replace(/,/g, ""));
      range.max = parseInt(rangeMatch[2].replace(/,/g, ""));
    }
    
    return { grade: salaryGrade, range };
  }

  inferExamLevel(title, description) {
    const professionalKeywords = [
      "officer", "specialist", "analyst", "manager", "director", 
      "supervisor", "coordinator", "professional", "expert"
    ];
    
    const text = (title + " " + description).toLowerCase();
    
    for (const keyword of professionalKeywords) {
      if (text.includes(keyword)) {
        return "Professional";
      }
    }
    
    return "Sub-Professional";
  }

  inferJobLevel(title, description) {
    const text = (title + " " + description).toLowerCase();
    
    if (text.includes("director") || text.includes("executive") || text.includes("chief")) {
      return "Executive";
    } else if (text.includes("senior") || text.includes("supervisor") || text.includes("manager")) {
      return "Senior Level";
    } else if (text.includes("associate") || text.includes("specialist") || text.includes("analyst")) {
      return "Mid Level";
    }
    
    return "Entry Level";
  }

  inferDepartmentFromText(title) {
    const departmentMappings = {
      "health": "Department of Health",
      "education": "Department of Education", 
      "finance": "Department of Finance",
      "justice": "Department of Justice",
      "agriculture": "Department of Agriculture",
      "transportation": "Department of Transportation",
      "tourism": "Department of Tourism",
      "labor": "Department of Labor and Employment",
      "social": "Department of Social Welfare and Development",
      "environment": "Department of Environment and Natural Resources",
    };
    
    const titleLower = title.toLowerCase();
    for (const [keyword, department] of Object.entries(departmentMappings)) {
      if (titleLower.includes(keyword)) {
        return department;
      }
    }
    
    return "Government Agency";
  }

  inferEducationRequirement(examLevel) {
    return examLevel === "Professional" ? "College Graduate" : "High School Graduate";
  }

  inferExperienceRequirement(jobLevel) {
    switch (jobLevel) {
      case "Executive": return "10+ years";
      case "Senior Level": return "5-10 years";
      case "Mid Level": return "2-5 years";
      default: return "0-2 years";
    }
  }

  extractQualifications(text) {
    const qualifications = [];
    const qualificationKeywords = [
      "bachelor", "master", "degree", "graduate", "certification", 
      "license", "experience", "years", "knowledge", "skill"
    ];
    
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      for (const keyword of qualificationKeywords) {
        if (sentenceLower.includes(keyword) && sentence.trim().length > 20) {
          qualifications.push(sentence.trim());
          break;
        }
      }
    }
    
    return qualifications.slice(0, 5);
  }

  extractSkills(text) {
    const commonSkills = [
      "communication", "leadership", "teamwork", "problem solving", "analytical",
      "computer", "microsoft office", "excel", "data analysis", "project management",
      "customer service", "research", "writing", "presentation", "time management"
    ];
    
    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    for (const skill of commonSkills) {
      if (textLower.includes(skill)) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  extractKeywords(text) {
    const stopWords = [
      "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "a", "an",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
    ];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.keys(wordFreq)
      .sort((a, b) => wordFreq[b] - wordFreq[a])
      .slice(0, 10);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanupExpiredJobs() {
    try {
      const result = await JobPosting.cleanupExpiredJobs();
      return result;
    } catch (error) {
      console.error("Error cleaning up expired jobs:", error);
      throw error;
    }
  }
}

class JobMatchingService {
  async findMatchingJobs(userId, limit = 20) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const matchingJobs = await JobPosting.findMatchingJobs(user);
      
      const scoredJobs = matchingJobs.map(job => ({
        job: job.toObject(),
        matchScore: this.calculateMatchScore(user, job),
        matchReasons: this.getMatchReasons(user, job),
      }));

      return scoredJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      console.error("Error finding matching jobs:", error);
      throw error;
    }
  }

  calculateMatchScore(user, job) {
    let score = 0;
    const maxScore = 100;

    if (user.examType === job.examLevel) score += 25;
    
    if (user.preferredWorkLocations?.some(loc => 
      job.location.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 20;
    }

    if (user.preferredDepartments?.some(dept => 
      job.department.toLowerCase().includes(dept.toLowerCase())
    )) {
      score += 20;
    }

    if (user.targetPositions?.some(pos => 
      job.title.toLowerCase().includes(pos.toLowerCase())
    )) {
      score += 25;
    }

    const jobLevelMatch = this.matchJobLevel(user.workExperience, job.jobLevel);
    score += jobLevelMatch * 10;

    return Math.min(score, maxScore);
  }

  getMatchReasons(user, job) {
    const reasons = [];

    if (user.examType === job.examLevel) {
      reasons.push(`Matches your ${user.examType} level qualification`);
    }

    if (user.preferredWorkLocations?.some(loc => 
      job.location.toLowerCase().includes(loc.toLowerCase())
    )) {
      reasons.push("Location matches your preferences");
    }

    if (user.preferredDepartments?.some(dept => 
      job.department.toLowerCase().includes(dept.toLowerCase())
    )) {
      reasons.push("Department matches your preferences");
    }

    if (user.targetPositions?.some(pos => 
      job.title.toLowerCase().includes(pos.toLowerCase())
    )) {
      reasons.push("Position matches your target roles");
    }

    return reasons;
  }

  matchJobLevel(experience, jobLevel) {
    const experienceMapping = {
      "0-1 years": ["Entry Level"],
      "2-5 years": ["Entry Level", "Mid Level"],
      "6-10 years": ["Mid Level", "Senior Level"],
      "10+ years": ["Senior Level", "Executive"],
    };

    if (!experience || !experienceMapping[experience]) return 0.5;
    
    return experienceMapping[experience].includes(jobLevel) ? 1 : 0.3;
  }

  async getJobRecommendations(userId, category = "all", limit = 10) {
    const user = await User.findById(userId);
    let jobs = [];

    switch (category) {
      case "urgent":
        jobs = await JobPosting.getUrgentJobs();
        break;
      case "popular":
        jobs = await JobPosting.getPopularJobs(limit);
        break;
      case "recent":
        jobs = await JobPosting.findActiveJobs();
        jobs = jobs.slice(0, limit);
        break;
      default:
        const matchingJobs = await this.findMatchingJobs(userId, limit);
        return matchingJobs;
    }

    return jobs.map(job => ({
      job: job.toObject ? job.toObject() : job,
      matchScore: user ? this.calculateMatchScore(user, job) : 50,
      matchReasons: user ? this.getMatchReasons(user, job) : [],
    }));
  }

  async notifyUsersOfNewJobs(jobIds) {
    try {
      const users = await User.find({
        enableJobMatching: true,
        jobAlerts: true,
        isProfileComplete: true,
      });

      for (const user of users) {
        const matchingJobs = await this.findMatchingJobs(user._id, 5);
        const newMatchingJobs = matchingJobs.filter(mJob => 
          jobIds.includes(mJob.job._id.toString()) && mJob.matchScore >= 70
        );

        if (newMatchingJobs.length > 0) {
          // Here you would integrate with email service
          console.log(`Would notify user ${user._id} about ${newMatchingJobs.length} new matching jobs`);
        }
      }
    } catch (error) {
      console.error("Error notifying users of new jobs:", error);
    }
  }
}

export { JobCrawlingService, JobMatchingService };
