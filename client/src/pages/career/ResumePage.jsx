import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Briefcase, BookOpen, User, Zap, X, ChevronRight, ChevronLeft } from 'lucide-react';
import resumeService from '../../services/resumeService';

// --- Configuration Data ---
let idCounter = 0;
const generateId = () => `item-${idCounter++}-${Date.now()}`;
const LOCAL_STORAGE_KEY = 'cvBuilderData';

const STEPS = [
  'Personal Details',
  'Professional Summary',
  'Education History',
  'Work Experience',
  'Key Skills',
  'Review & Finalize'
];

// --- INITIAL DATA STRUCTURE (Empty for blank slate) ---
const initialCVData = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  summary: '',
  education: [],
  experience: [],
  skills: [],
};

// --- FORM COMPONENTS ---

// Step 1: Personal Details Form
const PersonalDetailsForm = ({ data, updateField }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <User className="w-5 h-5 mr-2 text-gray-900" /> Personal Details
      </h3>
      <input
        type="text"
        placeholder="Full Name (e.g., Jane M. Doe)"
        value={data.name}
        onChange={(e) => updateField('name', e.target.value)}
        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-gray-900 focus:border-gray-900 transition duration-150"
        required
      />
      <input
        type="email"
        placeholder="Email Address"
        value={data.email}
        onChange={(e) => updateField('email', e.target.value)}
        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-gray-900 focus:border-gray-900 transition duration-150"
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={data.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-gray-900 focus:border-gray-900 transition duration-150"
      />
      <input
        type="url"
        placeholder="LinkedIn Profile URL (Optional)"
        value={data.linkedin}
        onChange={(e) => updateField('linkedin', e.target.value)}
        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-gray-900 focus:border-gray-900 transition duration-150"
      />
    </div>
  );
};

// Step 2: Professional Summary Form
const SummaryForm = ({ data, updateField }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-gray-900" /> Professional Summary
      </h3>
      <p className="text-sm text-gray-500">A concise, powerful paragraph (3-4 sentences) highlighting your key achievements and career goals.</p>
      <textarea
        placeholder="E.g., Highly motivated marketing professional with 5+ years of experience in B2B SaaS, specializing in demand generation and SEO..."
        value={data.summary}
        onChange={(e) => updateField('summary', e.target.value)}
        rows="6"
        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-gray-900 focus:border-gray-900 transition duration-150 resize-y"
        required
      />
    </div>
  );
};

// Step 3: Education Form
const EducationForm = ({ data, addItem, deleteItem }) => {
  const [newItem, setNewItem] = useState({ institution: '', degree: '', year: '', details: '' });

  const handleAdd = () => {
    if (newItem.institution && newItem.degree && newItem.year) {
      addItem('education', newItem);
      setNewItem({ institution: '', degree: '', year: '', details: '' });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-gray-900" /> Education History
      </h3>

      <div className="bg-white p-4 border border-gray-400 rounded-lg space-y-3">
        <input
          placeholder="Degree/Qualification (e.g., M.Sc. Computer Science)"
          value={newItem.degree}
          onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm"
        />
        <input
          placeholder="Institution Name (e.g., Harvard University)"
          value={newItem.institution}
          onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm"
        />
        <div className='flex space-x-2'>
          <input
            placeholder="Graduation Year (e.g., 2020)"
            value={newItem.year}
            onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg w-1/3 text-sm"
          />
          <input
            placeholder="City, Country"
            value={newItem.details}
            onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg w-2/3 text-sm"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-gray-900 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg w-full transition duration-150 shadow-md"
        >
          Add Education
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {data.education.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-sm text-gray-700">{item.degree}</p>
              <p className="text-xs text-gray-500">{item.institution} ({item.year})</p>
            </div>
            <button
              onClick={() => deleteItem('education', item.id)}
              className="text-gray-700 hover:text-gray-900 text-xs font-semibold px-2 py-1 rounded transition duration-150"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 4: Experience Form
const ExperienceForm = ({ data, addItem, deleteItem }) => {
  const [newItem, setNewItem] = useState({ title: '', company: '', duration: '', description: '' });

  const handleAdd = () => {
    if (newItem.title && newItem.company && newItem.duration) {
      addItem('experience', newItem);
      setNewItem({ title: '', company: '', duration: '', description: '' });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-gray-900" /> Work Experience
      </h3>

      <div className="bg-white p-4 border border-gray-400 rounded-lg space-y-3">
        <input
          placeholder="Job Title (e.g., Senior Software Engineer)"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm"
        />
        <input
          placeholder="Company Name"
          value={newItem.company}
          onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm"
        />
        <input
          placeholder="Duration & Location (e.g., 2020 - Present, London)"
          value={newItem.duration}
          onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm"
        />
        <textarea
          placeholder="Key Achievements (use bullet points in the final CV)"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          rows="3"
          className="p-2 border border-gray-300 rounded-lg w-full text-sm resize-y"
        />
        <button
          onClick={handleAdd}
          className="bg-gray-900 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg w-full transition duration-150 shadow-md"
        >
          Add Experience
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {data.experience.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-sm text-gray-700">{item.title}</p>
              <p className="text-xs text-gray-500">{item.company} ({item.duration})</p>
            </div>
            <button
              onClick={() => deleteItem('experience', item.id)}
              className="text-gray-700 hover:text-gray-900 text-xs font-semibold px-2 py-1 rounded transition duration-150"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 5: Skills Form
const SkillsForm = ({ data, setSkills }) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAdd = () => {
    const newSkill = skillInput.trim();
    if (newSkill && !data.skills.includes(newSkill)) {
      setSkills([...data.skills, newSkill]);
      setSkillInput('');
    }
  };

  const handleDelete = (skillToRemove) => {
    setSkills(data.skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-gray-900" /> Key Skills
      </h3>
      <p className="text-sm text-gray-500">Add 3-5 key skills or technologies, separated by categories if helpful.</p>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="E.g., Python, React, Data Analysis"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-gray-900 focus:border-gray-900 transition duration-150"
        />
        <button
          onClick={handleAdd}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-150 shadow-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {data.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center bg-gray-200 text-gray-900 text-xs font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300 transition duration-150"
            onClick={() => handleDelete(skill)}
            title="Click to remove"
          >
            {skill}
            <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </span>
        ))}
      </div>
    </div>
  );
};


// --- Harvard CV Template Renderer ---

const HarvardCV = ({ data }) => {
  const { name, email, phone, linkedin, summary, education, experience, skills } = data;

  // Function to safely split description text into bullet points
  const formatDescription = (text) => {
    if (!text) return [];
    // Split by newline and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
      // Remove common bullet point characters like *, -, or digits with a dot/space at the start
      return line.trim().replace(/^[\*\-\d\.]\s*/, '');
    });
  };

  const SectionTitle = ({ title }) => (
    <h2 className="text-xl font-bold border-b-2 border-gray-900 pb-0.5 mt-4 mb-2 uppercase tracking-wide">
      {title}
    </h2>
  );

  const ContactInfo = ({ icon, text, href }) => {
    if (!text) return null;
    // Special handling for LinkedIn URL to just show the username part
    const displayLink = text.includes('linkedin.com/in/') ? text.split('/').pop() : text;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition duration-150 mx-2"
      >
        {icon}
        <span className="ml-1.5">{displayLink}</span>
      </a>
    );
  };

  // Check if enough data is present to render the CV structure
  const hasContent = name || email || phone || linkedin || summary || education.length > 0 || experience.length > 0 || skills.length > 0;

  // Render a helpful placeholder if no data is available
  if (!hasContent) {
    return (
      <div className="bg-gray-100 p-8 border-dashed border-2 border-gray-400 rounded-lg text-center text-gray-600 sticky top-4">
        <p className="font-semibold text-lg">Live CV Preview</p>
        <p className="text-sm mt-2">Start filling out the questionnaire to see your CV instantly generate here.</p>
        <div className="mt-4 text-xs text-gray-400">
          [Layout: Full Name, Contact Info, Sections...]
        </div>
      </div>
    );
  }


  return (
    <div className="resume-preview bg-white p-6 shadow-xl max-w-full lg:max-w-4xl mx-auto my-0 rounded-lg overflow-x-auto print:shadow-none print:border-none sticky top-4">
      <div className="p-4 border border-gray-300 rounded-md print:border-none">
        {/* Header - Name */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center uppercase tracking-wider">
          {name || '[Your Full Name]'}
        </h1>

        {/* Contact Details */}
        <div className="flex flex-wrap justify-center items-center mt-2 text-sm text-gray-600">
          <ContactInfo icon={<Mail className="w-3 h-3" />} text={email} href={`mailto:${email}`} />
          <ContactInfo icon={<Phone className="w-3 h-3" />} text={phone} href={`tel:${phone}`} />
          <ContactInfo icon={<Linkedin className="w-3 h-3" />} text={linkedin} href={linkedin} />
        </div>

        {/* Summary */}
        {summary && (
          <>
            <SectionTitle title="Profile" />
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">
              {summary}
            </p>
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <SectionTitle title="Education" />
            {education.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-1.5">
                <div className="flex-1 pr-4">
                  <span className="font-semibold">{item.degree}</span>, {item.institution}
                </div>
                <div className="text-right whitespace-nowrap italic text-gray-700">
                  {item.year}{item.details && `, ${item.details}`}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <>
            <SectionTitle title="Professional Experience" />
            {experience.map((item) => (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">{item.title}</span>
                  <span className="italic text-gray-700">{item.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-800">{item.company}</span>
                  <span></span> {/* Placeholder for alignment */}
                </div>
                {formatDescription(item.description).length > 0 && (
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-700 space-y-0.5">
                    {formatDescription(item.description).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <>
            <SectionTitle title="Key Skills" />
            <p className="text-sm">
              <span className="font-semibold text-gray-800">Skills:</span> {skills.join(' • ')}
            </p>
          </>
        )}

        <p className="text-xs text-center text-gray-500 mt-6">References available upon request.</p>
      </div>
    </div>
  );
};

// Mobile Preview Modal Component
const MobileCVPreviewModal = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-white lg:hidden overflow-y-auto p-4 sm:p-8">
      <div className="sticky top-0 bg-white z-50 pt-2 pb-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">CV Preview</h2>
        <button
          onClick={onClose}
          className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Render the full CV inside the modal */}
      <div className="mt-4">
        <HarvardCV data={data} />
      </div>
    </div>
  );
};


// --- Main Application Component ---

const App = () => {
  // 1. Initialize state
  const [cvData, setCvData] = useState(initialCVData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resume = await resumeService.getMyResume();

        if (resume) {
          // Map backend data to frontend structure
          setCvData({
            name: resume.personalInfo?.name || '',
            email: resume.personalInfo?.email || '',
            phone: resume.personalInfo?.phone || '',
            linkedin: resume.personalInfo?.linkedin || '',
            summary: resume.personalInfo?.summary || '',
            education: resume.education || [],
            experience: resume.experience || [],
            skills: resume.skills || [],
          });
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
        // Fallback to localStorage if API fails
        try {
          const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localData) {
            const parsedData = JSON.parse(localData);
            if (parsedData) {
              setCvData(prev => ({ ...prev, ...parsedData }));
            }
          }
        } catch (e) {
          console.error("Error loading from local storage", e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Debounced save to API
  useEffect(() => {
    // Skip initial load or empty data if we want
    if (isLoading) return;

    const saveData = async () => {
      try {
        setIsSaving(true);

        // Map frontend structure to backend structure
        const backendData = {
          personalInfo: {
            name: cvData.name,
            email: cvData.email,
            phone: cvData.phone,
            linkedin: cvData.linkedin,
            summary: cvData.summary,
          },
          education: cvData.education,
          experience: cvData.experience,
          skills: cvData.skills,
        };

        await resumeService.updateResume(backendData);

        // Also save to localStorage as backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
      } catch (error) {
        console.error("Error saving resume data:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveData, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [cvData, isLoading]);

  // Local UI state (steps, modal visibility)
  const [step, setStep] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // 3. Data update handlers (pass these down)
  const updateField = useCallback((field, value) => {
    setCvData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addItem = useCallback((collection, item) => {
    setCvData(prev => ({
      ...prev,
      [collection]: [...prev[collection], { ...item, id: generateId() }],
    }));
  }, []);

  const deleteItem = useCallback((collection, id) => {
    setCvData(prev => ({
      ...prev,
      [collection]: prev[collection].filter(item => item.id !== id),
    }));
  }, []);

  const setSkills = useCallback((skillsArray) => {
    setCvData(prev => ({ ...prev, skills: skillsArray }));
  }, []);

  // --- Check to determine if user can proceed to the next step ---
  const canProceed = useCallback(() => {
    // Cannot proceed if already on the final step
    if (step === STEPS.length - 1) return false;

    switch (step) {
      case 0: // Personal Details: Requires Name and Email
        return cvData.name.trim() !== '' && cvData.email.trim() !== '';
      case 1: // Professional Summary: Requires Summary
        return cvData.summary.trim() !== '';
      // Steps 2, 3, 4 (Education, Experience, Skills) are additive/optional, so always allow progression
      case 2:
      case 3:
      case 4:
      default:
        return true;
    }
  }, [step, cvData.name, cvData.email, cvData.summary]);
  // -----------------------------------------------------------------------


  const handleNext = () => {
    // Only move forward if canProceed is true (this is checked by the button's disabled state)
    if (canProceed()) {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    } else {
      console.warn("Required fields are empty. Cannot proceed.");
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const formProps = { data: cvData, updateField, addItem, deleteItem, setSkills };

  const renderCurrentStep = () => {
    switch (step) {
      // Components now receive the necessary data and handlers as props
      case 0:
        return <PersonalDetailsForm {...formProps} />;
      case 1:
        return <SummaryForm {...formProps} />;
      case 2:
        return <EducationForm {...formProps} />;
      case 3:
        return <ExperienceForm {...formProps} />;
      case 4:
        return <SkillsForm {...formProps} />;
      case 5:
        return (
          <div className="text-left p-8 bg-gray-100 rounded-xl border border-gray-300">
            <h3 className="text-2xl font-bold text-gray-900">Review Complete!</h3>
            <p className="text-gray-600 mt-2">Your live resume preview is on the right. If it looks correct, you are ready to export or print.</p>
            <button
              onClick={() => window.print()}
              className="mt-4 bg-gray-900 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center"
            >
              <Briefcase className="w-4 h-4 mr-2" /> Print/Export to PDF
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const proceedAllowed = canProceed();
  const atLastStep = step === STEPS.length - 1;


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter'] pt-20 lg:pt-8">

      {/* 1. New Fixed Mobile Header (Always visible on small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
        {/* Back Button / Navigation */}
        <Link
          to="/dashboard/career"
          className="flex items-center text-gray-700 hover:text-gray-900 transition mr-2"
          aria-label="Return to Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-grow">Resume Builder</h1>

        {/* Mobile Preview Button */}
        <button
          onClick={() => setShowMobilePreview(true)}
          className="bg-gray-900 text-white text-sm font-semibold p-2 px-3 rounded-lg shadow-xl hover:bg-gray-700 transition duration-150 flex items-center ml-auto"
          aria-label="View CV Preview"
        >
          Preview <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* 2. Desktop Header (Hidden on mobile) */}
      <header className="text-center mb-8 hidden lg:block relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <Link
            to="/dashboard/career"
            className="flex items-center text-gray-600 hover:text-gray-900 transition font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Career
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
        <p className="text-gray-500">Data is automatically saved to your browser's local storage.</p>
        {isSaving && <p className="text-xs text-green-600 mt-1">Saving...</p>}
      </header>

      {/* Main Two-Column Layout (stacked on mobile) */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto lg:space-x-8">

        {/* Left Column: Form and Navigation */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-2xl p-6 mb-8 lg:mb-0 h-fit sticky lg:top-4">

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
              <span>Step {step + 1} of {STEPS.length}</span>
              <span>{STEPS[step]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gray-900 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Form */}
          <div className="p-4 border border-gray-100 rounded-lg">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>

          {/* Navigation Buttons */}
          <div className={`mt-6 flex ${step === 0 ? 'justify-end' : 'justify-between'}`}>

            {/* Previous Button (Hidden on step 0) */}
            {step > 0 && (
              <button
                onClick={handleBack}
                className={`py-2 px-4 rounded-lg transition duration-150 font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300`}
              >
                &larr; Previous
              </button>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              // Disable if at the last step OR if the current step is incomplete
              disabled={atLastStep || !proceedAllowed}
              className={`py-2 px-4 rounded-lg transition duration-150 font-semibold shadow-md ${
                // Apply grey style if at last step OR if proceeding is NOT allowed
                atLastStep || !proceedAllowed
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
            >
              {atLastStep ? 'Complete' : 'Next Step'} &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Live CV Preview (Visible on Large Screens) */}
        <div className="resume-preview-container w-full lg:w-1/2 hidden lg:block">
          <HarvardCV data={cvData} />
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && <MobileCVPreviewModal data={cvData} onClose={() => setShowMobilePreview(false)} />}

    </div>
  );
};

export default App;