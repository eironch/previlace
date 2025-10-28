import Resume from "../models/Resume.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import fs from "fs/promises";
import path from "path";

class ResumeBuilderService {
  constructor() {
    this.templates = {
      government_standard: {
        name: "Government Standard",
        description: "Official format for government applications",
        sections: [
          "personalInfo", "objective", "education", "workExperience", 
          "civilServiceExam", "skills", "certifications", "references"
        ],
      },
      professional: {
        name: "Professional",
        description: "Modern professional layout",
        sections: [
          "personalInfo", "professionalSummary", "workExperience", 
          "education", "skills", "certifications", "projects"
        ],
      },
      modern: {
        name: "Modern",
        description: "Contemporary design with visual elements",
        sections: [
          "personalInfo", "professionalSummary", "skills", "workExperience", 
          "education", "certifications", "projects", "awards"
        ],
      },
      classic: {
        name: "Classic",
        description: "Traditional resume format", 
        sections: [
          "personalInfo", "objective", "education", "workExperience", 
          "skills", "references"
        ],
      },
    };

    this.skillSuggestions = {
      "Administrative Officer": [
        "Document Management", "Data Entry", "Microsoft Office", "Communication",
        "Organization", "Time Management", "Customer Service", "Filing Systems"
      ],
      "Legal Officer": [
        "Legal Research", "Contract Review", "Legal Writing", "Case Management",
        "Regulatory Compliance", "Litigation Support", "Legal Analysis"
      ],
      "Human Resource Officer": [
        "Recruitment", "Employee Relations", "HR Policies", "Performance Management",
        "Training and Development", "Payroll", "Benefits Administration"
      ],
      "Information Officer": [
        "Public Relations", "Media Relations", "Content Creation", "Social Media",
        "Event Management", "Communications Strategy", "Press Release Writing"
      ],
    };
  }

  async createResume(userId, resumeData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const defaultPersonalInfo = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: "",
          city: "",
          province: "",
          postalCode: "",
          country: "Philippines",
        },
        nationality: "Filipino",
      };

      const resumePayload = {
        userId,
        title: resumeData.title || "My Resume",
        targetPosition: resumeData.targetPosition || "",
        template: resumeData.template || "government_standard",
        personalInfo: { ...defaultPersonalInfo, ...(resumeData.personalInfo || {}) },
        professionalSummary: resumeData.professionalSummary || "",
        objective: resumeData.objective || "",
        workExperience: resumeData.workExperience || [],
        education: resumeData.education || [],
        skills: {
          technical: resumeData.skills?.technical || [],
          soft: resumeData.skills?.soft || [],
          languages: resumeData.skills?.languages || [{
            language: "Filipino",
            proficiency: "Native",
          }, {
            language: "English",
            proficiency: "Advanced",
          }],
        },
        certifications: resumeData.certifications || [],
        civilServiceExam: resumeData.civilServiceExam || {},
        projects: resumeData.projects || [],
        awards: resumeData.awards || [],
        volunteerWork: resumeData.volunteerWork || [],
        references: resumeData.references || [],
        settings: {
          includePhoto: false,
          includeReferences: true,
          includeSalaryHistory: false,
          dateFormat: "MM/YYYY",
          sectionOrder: this.getDefaultSectionOrder(resumeData.template || "government_standard"),
        },
      };

      const resume = await Resume.create(resumePayload);
      return resume;
    } catch (error) {
      console.error("Error creating resume:", error);
      throw error;
    }
  }

  async updateResume(resumeId, userId, updateData) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });
      if (!resume) throw new Error("Resume not found");

      await resume.createVersion("Update before modifications");

      Object.assign(resume, updateData);
      await resume.save();

      return resume;
    } catch (error) {
      console.error("Error updating resume:", error);
      throw error;
    }
  }

  async optimizeResumeForJob(resumeId, jobPosting) {
    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) throw new Error("Resume not found");

      await resume.createVersion("Before job optimization");

      const optimization = await this.analyzeJobRequirements(jobPosting);
      const suggestions = await this.generateOptimizationSuggestions(resume, optimization);

      resume.aiOptimizations.targetKeywords = optimization.keywords;
      resume.aiOptimizations.optimizedFor.push(jobPosting._id.toString());
      resume.aiOptimizations.lastOptimizedAt = new Date();
      resume.aiOptimizations.suggestions = suggestions;

      await this.applyAutoOptimizations(resume, optimization);

      await resume.save();
      return { resume, suggestions };
    } catch (error) {
      console.error("Error optimizing resume:", error);
      throw error;
    }
  }

  async analyzeJobRequirements(jobPosting) {
    const text = `${jobPosting.title} ${jobPosting.description} ${jobPosting.qualifications?.join(" ") || ""}`;
    const keywords = this.extractKeywords(text);
    const requiredSkills = this.extractSkills(text);
    const experienceLevel = this.inferExperienceLevel(text);
    const educationRequirement = this.inferEducationRequirement(text);

    return {
      keywords: keywords.slice(0, 20),
      requiredSkills: requiredSkills.slice(0, 15),
      experienceLevel,
      educationRequirement,
      jobTitle: jobPosting.title,
      department: jobPosting.department,
    };
  }

  async generateOptimizationSuggestions(resume, jobAnalysis) {
    const suggestions = [];

    const resumeKeywords = this.extractKeywords(
      `${resume.professionalSummary} ${resume.objective} ${JSON.stringify(resume.workExperience)}`
    );

    const missingKeywords = jobAnalysis.keywords.filter(keyword => 
      !resumeKeywords.some(rKeyword => rKeyword.includes(keyword) || keyword.includes(rKeyword))
    );

    if (missingKeywords.length > 0) {
      suggestions.push({
        type: "keywords",
        suggestion: `Consider including these relevant keywords: ${missingKeywords.slice(0, 5).join(", ")}`,
        priority: "high",
        applied: false,
      });
    }

    const resumeSkills = [
      ...resume.skills.technical,
      ...resume.skills.soft,
    ].map(skill => skill.toLowerCase());

    const missingSkills = jobAnalysis.requiredSkills.filter(skill =>
      !resumeSkills.some(rSkill => rSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rSkill))
    );

    if (missingSkills.length > 0) {
      suggestions.push({
        type: "content",
        suggestion: `Consider highlighting these relevant skills: ${missingSkills.slice(0, 5).join(", ")}`,
        priority: "medium",
        applied: false,
      });
    }

    if (!resume.professionalSummary && !resume.objective) {
      suggestions.push({
        type: "structure",
        suggestion: `Add a professional summary or objective targeting ${jobAnalysis.jobTitle} position`,
        priority: "high",
        applied: false,
      });
    }

    if (resume.workExperience.length === 0) {
      suggestions.push({
        type: "content",
        suggestion: "Add relevant work experience, including internships, volunteer work, or projects",
        priority: "high",
        applied: false,
      });
    }

    const hasRelevantEducation = resume.education.some(edu => 
      edu.degree && (
        jobAnalysis.educationRequirement.toLowerCase().includes("college") && 
        edu.degree.toLowerCase().includes("bachelor")
      )
    );

    if (jobAnalysis.educationRequirement.includes("College") && !hasRelevantEducation) {
      suggestions.push({
        type: "content",
        suggestion: "Ensure your educational background meets the job requirements",
        priority: "medium",
        applied: false,
      });
    }

    return suggestions;
  }

  async applyAutoOptimizations(resume, jobAnalysis) {
    if (!resume.professionalSummary && !resume.objective) {
      const suggestedObjective = this.generateObjective(jobAnalysis.jobTitle, jobAnalysis.department);
      resume.objective = suggestedObjective;
    }

    if (jobAnalysis.requiredSkills.length > 0) {
      const existingSkills = resume.skills.technical.map(skill => skill.toLowerCase());
      const newSkills = jobAnalysis.requiredSkills.filter(skill => 
        !existingSkills.includes(skill.toLowerCase())
      );

      resume.skills.technical.push(...newSkills.slice(0, 3));
    }
  }

  generateObjective(jobTitle, department) {
    const objectives = [
      `Dedicated professional seeking to contribute to ${department} as a ${jobTitle}, leveraging strong analytical skills and commitment to public service.`,
      `Motivated individual with excellent communication skills aiming to serve in ${department} as a ${jobTitle} to support organizational goals and community development.`,
      `Results-oriented professional seeking a ${jobTitle} position in ${department} to apply expertise in government operations and public administration.`,
    ];

    return objectives[Math.floor(Math.random() * objectives.length)];
  }

  async generateResumePreview(resumeId, format = "html") {
    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) throw new Error("Resume not found");

      switch (format) {
        case "pdf":
          return this.generatePDF(resume);
        case "html":
          return this.generateHTML(resume);
        case "docx":
          return this.generateDOCX(resume);
        default:
          throw new Error("Unsupported format");
      }
    } catch (error) {
      console.error("Error generating resume preview:", error);
      throw error;
    }
  }

  async generatePDF(resume) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on("data", chunk => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        this.renderPDFContent(doc, resume);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  renderPDFContent(doc, resume) {
    const { personalInfo, template } = resume;
    
    doc.font("Helvetica-Bold", 20);
    doc.text(`${personalInfo.firstName} ${personalInfo.lastName}`, 50, 50);
    
    doc.font("Helvetica", 12);
    doc.text(`${personalInfo.email} | ${personalInfo.phone}`, 50, 80);
    
    if (personalInfo.address.city) {
      doc.text(`${personalInfo.address.city}, ${personalInfo.address.province}`, 50, 95);
    }

    let yPosition = 130;

    const sections = this.templates[template]?.sections || this.templates.government_standard.sections;

    for (const sectionName of sections) {
      const sectionData = resume[sectionName];
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) continue;

      yPosition = this.renderPDFSection(doc, sectionName, sectionData, yPosition);
      yPosition += 20;

      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    }
  }

  renderPDFSection(doc, sectionName, sectionData, yPosition) {
    const sectionTitles = {
      professionalSummary: "Professional Summary",
      objective: "Objective",
      workExperience: "Work Experience", 
      education: "Education",
      skills: "Skills",
      certifications: "Certifications",
      civilServiceExam: "Civil Service Exam",
      projects: "Projects",
      awards: "Awards",
      volunteerWork: "Volunteer Work",
      references: "References",
    };

    doc.font("Helvetica-Bold", 14);
    doc.text(sectionTitles[sectionName] || sectionName, 50, yPosition);
    yPosition += 20;

    doc.font("Helvetica", 11);

    switch (sectionName) {
      case "professionalSummary":
      case "objective":
        doc.text(sectionData, 50, yPosition, { width: 500, align: "justify" });
        yPosition += doc.heightOfString(sectionData, { width: 500 }) + 10;
        break;

      case "workExperience":
        for (const job of sectionData) {
          doc.font("Helvetica-Bold", 11);
          doc.text(`${job.jobTitle} - ${job.company}`, 50, yPosition);
          yPosition += 15;
          
          doc.font("Helvetica", 10);
          const dates = this.formatDateRange(job.startDate, job.endDate, job.isCurrentJob);
          doc.text(dates, 50, yPosition);
          yPosition += 15;

          if (job.responsibilities && job.responsibilities.length > 0) {
            for (const responsibility of job.responsibilities.slice(0, 3)) {
              doc.text(`• ${responsibility}`, 60, yPosition);
              yPosition += 12;
            }
          }
          yPosition += 10;
        }
        break;

      case "education":
        for (const edu of sectionData) {
          doc.font("Helvetica-Bold", 11);
          doc.text(`${edu.degree} - ${edu.institution}`, 50, yPosition);
          yPosition += 15;
          
          if (edu.endDate || edu.isCurrentlyEnrolled) {
            doc.font("Helvetica", 10);
            const dates = this.formatDateRange(edu.startDate, edu.endDate, edu.isCurrentlyEnrolled);
            doc.text(dates, 50, yPosition);
            yPosition += 15;
          }
          yPosition += 5;
        }
        break;

      case "skills":
        if (sectionData.technical && sectionData.technical.length > 0) {
          doc.font("Helvetica-Bold", 11);
          doc.text("Technical Skills:", 50, yPosition);
          yPosition += 15;
          doc.font("Helvetica", 10);
          doc.text(sectionData.technical.join(", "), 60, yPosition, { width: 480 });
          yPosition += doc.heightOfString(sectionData.technical.join(", "), { width: 480 }) + 10;
        }

        if (sectionData.soft && sectionData.soft.length > 0) {
          doc.font("Helvetica-Bold", 11);
          doc.text("Soft Skills:", 50, yPosition);
          yPosition += 15;
          doc.font("Helvetica", 10);
          doc.text(sectionData.soft.join(", "), 60, yPosition, { width: 480 });
          yPosition += doc.heightOfString(sectionData.soft.join(", "), { width: 480 }) + 10;
        }
        break;

      case "certifications":
        for (const cert of sectionData) {
          doc.font("Helvetica-Bold", 11);
          doc.text(cert.name, 50, yPosition);
          yPosition += 15;
          
          if (cert.issuingOrganization) {
            doc.font("Helvetica", 10);
            doc.text(cert.issuingOrganization, 60, yPosition);
            yPosition += 12;
          }
          
          if (cert.issueDate) {
            doc.text(this.formatDate(cert.issueDate), 60, yPosition);
            yPosition += 12;
          }
          yPosition += 5;
        }
        break;

      case "civilServiceExam":
        if (sectionData.level && sectionData.rating) {
          doc.text(`${sectionData.level} Level - Rating: ${sectionData.rating}%`, 50, yPosition);
          yPosition += 15;
          if (sectionData.dateOfExam) {
            doc.text(`Date of Exam: ${this.formatDate(sectionData.dateOfExam)}`, 50, yPosition);
            yPosition += 15;
          }
        }
        break;

      default:
        if (typeof sectionData === "string") {
          doc.text(sectionData, 50, yPosition, { width: 500 });
          yPosition += doc.heightOfString(sectionData, { width: 500 }) + 10;
        }
        break;
    }

    return yPosition;
  }

  generateHTML(resume) {
    const { personalInfo, template } = resume;
    const sections = this.templates[template]?.sections || this.templates.government_standard.sections;

    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${personalInfo.firstName} ${personalInfo.lastName} - Resume</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .contact { font-size: 14px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
            .job-title { font-weight: bold; font-size: 16px; }
            .company { color: #666; }
            .date-range { font-size: 12px; color: #888; font-style: italic; }
            .responsibility { margin-left: 20px; margin-bottom: 5px; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${personalInfo.firstName} ${personalInfo.lastName}</div>
            <div class="contact">
              ${personalInfo.email} | ${personalInfo.phone}
              ${personalInfo.address.city ? `<br>${personalInfo.address.city}, ${personalInfo.address.province}` : ""}
            </div>
          </div>
    `;

    for (const sectionName of sections) {
      const sectionData = resume[sectionName];
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) continue;

      html += this.renderHTMLSection(sectionName, sectionData);
    }

    html += `
        </body>
      </html>
    `;

    return html;
  }

  renderHTMLSection(sectionName, sectionData) {
    const sectionTitles = {
      professionalSummary: "Professional Summary",
      objective: "Objective", 
      workExperience: "Work Experience",
      education: "Education",
      skills: "Skills",
      certifications: "Certifications",
      civilServiceExam: "Civil Service Exam",
      projects: "Projects",
      awards: "Awards",
      volunteerWork: "Volunteer Work",
      references: "References",
    };

    let html = `<div class="section"><div class="section-title">${sectionTitles[sectionName] || sectionName}</div>`;

    switch (sectionName) {
      case "professionalSummary":
      case "objective":
        html += `<p>${sectionData}</p>`;
        break;

      case "workExperience":
        for (const job of sectionData) {
          html += `
            <div style="margin-bottom: 20px;">
              <div class="job-title">${job.jobTitle}</div>
              <div class="company">${job.company}</div>
              <div class="date-range">${this.formatDateRange(job.startDate, job.endDate, job.isCurrentJob)}</div>
              ${job.responsibilities && job.responsibilities.length > 0 ? 
                job.responsibilities.slice(0, 4).map(resp => `<div class="responsibility">• ${resp}</div>`).join("") : ""}
            </div>
          `;
        }
        break;

      case "education":
        for (const edu of sectionData) {
          html += `
            <div style="margin-bottom: 15px;">
              <div class="job-title">${edu.degree}</div>
              <div class="company">${edu.institution}</div>
              ${edu.endDate || edu.isCurrentlyEnrolled ? 
                `<div class="date-range">${this.formatDateRange(edu.startDate, edu.endDate, edu.isCurrentlyEnrolled)}</div>` : ""}
            </div>
          `;
        }
        break;

      case "skills":
        if (sectionData.technical && sectionData.technical.length > 0) {
          html += `<div><strong>Technical Skills:</strong></div><div class="skills-list">`;
          sectionData.technical.forEach(skill => {
            html += `<span class="skill">${skill}</span>`;
          });
          html += `</div><br>`;
        }

        if (sectionData.soft && sectionData.soft.length > 0) {
          html += `<div><strong>Soft Skills:</strong></div><div class="skills-list">`;
          sectionData.soft.forEach(skill => {
            html += `<span class="skill">${skill}</span>`;
          });
          html += `</div>`;
        }
        break;

      case "certifications":
        for (const cert of sectionData) {
          html += `
            <div style="margin-bottom: 10px;">
              <div class="job-title">${cert.name}</div>
              ${cert.issuingOrganization ? `<div class="company">${cert.issuingOrganization}</div>` : ""}
              ${cert.issueDate ? `<div class="date-range">${this.formatDate(cert.issueDate)}</div>` : ""}
            </div>
          `;
        }
        break;

      case "civilServiceExam":
        if (sectionData.level && sectionData.rating) {
          html += `
            <div>
              <strong>${sectionData.level} Level</strong> - Rating: ${sectionData.rating}%
              ${sectionData.dateOfExam ? `<br>Date of Exam: ${this.formatDate(sectionData.dateOfExam)}` : ""}
            </div>
          `;
        }
        break;

      default:
        if (typeof sectionData === "string") {
          html += `<p>${sectionData}</p>`;
        }
        break;
    }

    html += `</div>`;
    return html;
  }

  getDefaultSectionOrder(template) {
    const sections = this.templates[template]?.sections || this.templates.government_standard.sections;
    return sections.map((section, index) => ({
      section,
      order: index + 1,
      visible: true,
    }));
  }

  extractKeywords(text) {
    const stopWords = [
      "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had"
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
      .slice(0, 15);
  }

  extractSkills(text) {
    const skillPatterns = [
      "microsoft office", "excel", "powerpoint", "word", "communication", "leadership",
      "teamwork", "problem solving", "analytical", "research", "data analysis",
      "project management", "customer service", "time management", "organization"
    ];

    const foundSkills = [];
    const textLower = text.toLowerCase();

    skillPatterns.forEach(skill => {
      if (textLower.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  inferExperienceLevel(text) {
    if (text.includes("senior") || text.includes("manager") || text.includes("director")) {
      return "Senior Level";
    } else if (text.includes("associate") || text.includes("specialist")) {
      return "Mid Level";
    }
    return "Entry Level";
  }

  inferEducationRequirement(text) {
    if (text.toLowerCase().includes("bachelor") || text.toLowerCase().includes("college")) {
      return "College Graduate";
    }
    return "High School Graduate";
  }

  formatDate(date, format = "MM/YYYY") {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    
    switch (format) {
      case "MM/DD/YYYY":
        return `${month}/${String(d.getDate()).padStart(2, "0")}/${year}`;
      case "Month YYYY":
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        return `${monthNames[d.getMonth()]} ${year}`;
      default:
        return `${month}/${year}`;
    }
  }

  formatDateRange(startDate, endDate, isCurrent = false) {
    const start = this.formatDate(startDate);
    const end = isCurrent ? "Present" : this.formatDate(endDate);
    return `${start} - ${end}`;
  }

  async getUserResumes(userId) {
    try {
      return Resume.getUserResumes(userId);
    } catch (error) {
      console.error("Error fetching user resumes:", error);
      throw error;
    }
  }

  async deleteResume(resumeId, userId) {
    try {
      const result = await Resume.deleteOne({ _id: resumeId, userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting resume:", error);
      throw error;
    }
  }

  async cloneResume(resumeId, userId, newTitle) {
    try {
      const originalResume = await Resume.findOne({ _id: resumeId, userId });
      if (!originalResume) throw new Error("Resume not found");

      const cloneData = originalResume.toObject();
      delete cloneData._id;
      delete cloneData.createdAt;
      delete cloneData.updatedAt;
      delete cloneData.versions;
      delete cloneData.shareUrl;
      delete cloneData.isDefault;

      cloneData.title = newTitle || `${cloneData.title} (Copy)`;
      cloneData.viewCount = 0;
      cloneData.downloadCount = 0;

      const clonedResume = await Resume.create(cloneData);
      return clonedResume;
    } catch (error) {
      console.error("Error cloning resume:", error);
      throw error;
    }
  }

  getSkillSuggestions(targetPosition) {
    return this.skillSuggestions[targetPosition] || this.skillSuggestions["Administrative Officer"];
  }

  getTemplates() {
    return this.templates;
  }
}

export default new ResumeBuilderService();
