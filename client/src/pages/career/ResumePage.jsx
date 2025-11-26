import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Briefcase, BookOpen, User, Zap, X, ChevronRight, ChevronLeft, Download, Printer } from 'lucide-react';
import StandardHeader from '../../components/ui/StandardHeader';
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

// --- INITIAL DATA STRUCTURE ---
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

const PersonalDetailsForm = ({ data, updateField }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2"/> Personal Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
            <input
            type="text"
            placeholder="Full Name (e.g., Jane M. Doe)"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black transition duration-150"
            required
            />
            <input
            type="email"
            placeholder="Email Address"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black transition duration-150"
            required
            />
            <input
            type="tel"
            placeholder="Phone Number"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black transition duration-150"
            />
            <input
            type="url"
            placeholder="LinkedIn Profile URL (Optional)"
            value={data.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black transition duration-150"
            />
        </div>
      </div>
    );
};

const SummaryForm = ({ data, updateField }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2"/> Professional Summary
        </h3>
        <p className="text-sm text-gray-500">A concise, powerful paragraph (3-4 sentences) highlighting your key achievements and career goals.</p>
        <textarea
          placeholder="E.g., Highly motivated civil engineer with 5+ years of experience in structural design..."
          value={data.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          rows="6"
          className="p-3 border border-gray-300 rounded-lg w-full focus:ring-black focus:border-black transition duration-150 resize-y"
          required
        />
      </div>
    );
};

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
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <BookOpen className="w-5 h-5 mr-2"/> Education History
      </h3>

      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3">
        <input
          placeholder="Degree/Qualification (e.g., B.S. Civil Engineering)"
          value={newItem.degree}
          onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-black focus:border-black"
        />
        <input
          placeholder="Institution Name (e.g., University of the Philippines)"
          value={newItem.institution}
          onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-black focus:border-black"
        />
        <div className='flex space-x-2'>
            <input
            placeholder="Year (e.g., 2020)"
            value={newItem.year}
            onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg w-1/3 text-sm focus:ring-black focus:border-black"
            />
            <input
            placeholder="City, Country"
            value={newItem.details}
            onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg w-2/3 text-sm focus:ring-black focus:border-black"
            />
        </div>
        <button
          onClick={handleAdd}
          className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg w-full transition duration-150 shadow-sm"
        >
          Add Education
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {data.education.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <p className="font-medium text-sm text-gray-900">{item.degree}</p>
              <p className="text-xs text-gray-500">{item.institution} ({item.year})</p>
            </div>
            <button
              onClick={() => deleteItem('education', item.id)}
              className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded transition duration-150"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Briefcase className="w-5 h-5 mr-2"/> Work Experience
      </h3>

      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3">
        <input
          placeholder="Job Title (e.g., Project Engineer)"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-black focus:border-black"
        />
        <input
          placeholder="Company Name"
          value={newItem.company}
          onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-black focus:border-black"
        />
        <input
          placeholder="Duration & Location (e.g., 2020 - Present, Manila)"
          value={newItem.duration}
          onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-black focus:border-black"
        />
        <textarea
          placeholder="Key Achievements (use bullet points)"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          rows="3"
          className="p-2 border border-gray-300 rounded-lg w-full text-sm resize-y focus:ring-black focus:border-black"
        />
        <button
          onClick={handleAdd}
          className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg w-full transition duration-150 shadow-sm"
        >
          Add Experience
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {data.experience.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <p className="font-medium text-sm text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.company} ({item.duration})</p>
            </div>
            <button
              onClick={() => deleteItem('experience', item.id)}
              className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded transition duration-150"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Zap className="w-5 h-5 mr-2"/> Key Skills
      </h3>
      <p className="text-sm text-gray-500">Add 3-5 key skills or technologies.</p>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="E.g., AutoCAD, Project Management, Structural Analysis"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-black focus:border-black transition duration-150"
        />
        <button
          onClick={handleAdd}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-150 shadow-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
        {data.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center bg-gray-100 text-gray-900 text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition duration-150 border border-gray-200"
            onClick={() => handleDelete(skill)}
            title="Click to remove"
          >
            {skill}
            <X className="ml-2 w-3 h-3 text-gray-500" />
          </span>
        ))}
      </div>
    </div>
  );
};


// --- Harvard CV Template Renderer ---

const HarvardCV = ({ data }) => {
  const { name, email, phone, linkedin, summary, education, experience, skills } = data;

  const formatDescription = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
      // Remove common bullet point characters like *, -, or digits with a dot/space at the start
      return line.trim().replace(/^[\*\-\d\.]\s*/, '');
    });
  };

  const SectionTitle = ({ title }) => (
    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mt-6 mb-3 uppercase tracking-wide text-gray-900">
      {title}
    </h2>
  );

  const ContactInfo = ({ icon, text, href }) => {
    if (!text) return null;
    const displayLink = text.includes('linkedin.com/in/') ? text.split('/').pop() : text;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-sm text-gray-700 hover:text-black transition duration-150 mx-3"
      >
        {icon}
        <span className="ml-1.5">{displayLink}</span>
      </a>
    );
  };

  const hasContent = name || email || phone || linkedin || summary || education.length > 0 || experience.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-gray-50 p-12 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500 h-full flex flex-col justify-center items-center">
        <Briefcase className="w-12 h-12 mb-4 text-gray-300" />
        <p className="font-semibold text-lg text-gray-700">Live Resume Preview</p>
        <p className="text-sm mt-2 max-w-xs mx-auto">Start filling out the form on the left to see your professional resume take shape here.</p>
      </div>
    );
  }


  return (
    <div className="bg-white p-8 shadow-lg max-w-full mx-auto rounded-none print:shadow-none print:p-0 min-h-[800px] sticky top-4">
        {/* Header - Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center uppercase tracking-wider mb-2">
          {name || '[Your Full Name]'}
        </h1>

        {/* Contact Details */}
        <div className="flex flex-wrap justify-center items-center mb-6 text-sm text-gray-600">
          <ContactInfo icon={<Mail className="w-3 h-3" />} text={email} href={`mailto:${email}`} />
          <ContactInfo icon={<Phone className="w-3 h-3" />} text={phone} href={`tel:${phone}`} />
          <ContactInfo icon={<Linkedin className="w-3 h-3" />} text={linkedin} href={linkedin} />
        </div>

        {/* Summary */}
        {summary && (
          <>
            <SectionTitle title="Profile" />
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800 text-justify">
              {summary}
            </p>
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <SectionTitle title="Education" />
            {education.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-2">
                <div className="flex-1 pr-4">
                  <span className="font-bold text-gray-900">{item.institution}</span>
                  <div className="text-gray-800">{item.degree}</div>
                </div>
                <div className="text-right whitespace-nowrap text-gray-700">
                  <span className="font-medium">{item.year}</span>
                  {item.details && <div className="text-xs text-gray-500">{item.details}</div>}
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
              <div key={item.id} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-900">{item.company}</span>
                  <span className="text-gray-700 font-medium">{item.duration}</span>
                </div>
                <div className="text-sm italic text-gray-800 mb-1">{item.title}</div>
                {formatDescription(item.description).length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
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
            <p className="text-sm text-gray-800">
              {skills.join(' • ')}
            </p>
          </>
        )}
    </div>
  );
};

const MobileCVPreviewModal = ({ data, onClose }) => { 
    return (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden overflow-y-auto p-4 sm:p-8">
            <div className="sticky top-0 bg-white z-50 pt-2 pb-4 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Resume Preview</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition"
                    aria-label="Close Preview"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4">
                <HarvardCV data={data} />
            </div>
        </div>
    );
};


// --- Main Application Component ---

const ResumePage = () => {
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

  const canProceed = useCallback(() => {
    if (step === STEPS.length - 1) return false; 

    switch(step) {
      case 0: 
        return cvData.name.trim() !== '' && cvData.email.trim() !== '';
      case 1: 
        return cvData.summary.trim() !== '';
      default:
        return true;
    }
  }, [step, cvData.name, cvData.email, cvData.summary]);


  const handleNext = () => {
    if (canProceed()) {
        setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const formProps = { data: cvData, updateField, addItem, deleteItem, setSkills };

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return <PersonalDetailsForm {...formProps} />;
      case 1: return <SummaryForm {...formProps} />;
      case 2: return <EducationForm {...formProps} />;
      case 3: return <ExperienceForm {...formProps} />;
      case 4: return <SkillsForm {...formProps} />;
      case 5:
        return (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Ready to Export!</h3>
            <p className="text-gray-600 mt-2 mb-6">Your resume is ready. Review the preview on the right and click below to print or save as PDF.</p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-150 shadow-lg w-full sm:w-auto"
            >
              <Printer className="w-5 h-5 mr-2"/> Print / Save as PDF
            </button>
          </div>
        );
      default: return null;
    }
  };

  const proceedAllowed = canProceed();
  const atLastStep = step === STEPS.length - 1;


  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        title="Resume Builder" 
        showBack={true}
        backPath="/dashboard/jobs"
      >
      </StandardHeader>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Header Actions */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">Step {step + 1} of {STEPS.length}</div>
            <button
                onClick={() => setShowMobilePreview(true)}
                className="bg-white border border-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center"
            >
                Preview <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
            
            {/* Left Column: Form */}
            <div className="w-full lg:w-5/12 xl:w-1/3 mb-8 lg:mb-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                    {/* Progress Bar */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                            ></div>
                        </div>
                        <div className="mt-3 text-lg font-bold text-gray-900">{STEPS[step]}</div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        ) : (
                          renderCurrentStep()
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === 0}
                            className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg transition ${
                                step === 0 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={atLastStep || !proceedAllowed} 
                            className={`flex items-center justify-center px-6 py-2 rounded-lg text-sm font-bold transition shadow-sm ${
                                atLastStep || !proceedAllowed 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            {atLastStep ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden lg:block w-full lg:w-7/12 xl:w-2/3">
                <div className="sticky top-8">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Live Preview</h2>
                        <button 
                            onClick={() => window.print()}
                            className="text-sm font-medium text-gray-600 hover:text-black flex items-center"
                        >
                            <Printer className="w-4 h-4 mr-1"/> Print
                        </button>
                    </div>
                    <div className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <HarvardCV data={cvData} />
                    </div>
                </div>
            </div>
        </div>
        
        {showMobilePreview && <MobileCVPreviewModal data={cvData} onClose={() => setShowMobilePreview(false)} />}
      </div>
    </div>
  );
};

export default ResumePage;
