import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Phone, Linkedin, Briefcase, BookOpen, User, Zap, X,
    ChevronDown, ChevronUp, Printer, Plus, Trash2, Award, FileText, Download
} from 'lucide-react';
import StandardHeader from '../../components/ui/StandardHeader';
import cvService from '../../services/cvService';

// --- Configuration Data ---
let idCounter = 0;
const generateId = () => `item-${idCounter++}-${Date.now()}`;
const LOCAL_STORAGE_KEY = 'cvBuilderData';

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
    certifications: []
};

// --- FORM COMPONENTS ---

const SectionWrapper = ({ title, icon: Icon, isOpen, onToggle, children }) => {
    return (
        <div className="border border-gray-200 rounded-lg bg-white mb-4 overflow-hidden shadow-sm transition-all duration-200">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-900">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

const PersonalDetailsForm = ({ data, updateField }) => {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="e.g. Jane Doe"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="jane@example.com"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="+1 234 567 890"
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                <input
                    type="url"
                    value={data.linkedin}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="linkedin.com/in/janedoe"
                />
            </div>
        </div>
    );
};

const SummaryForm = ({ data, updateField }) => {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Professional Summary</label>
            <textarea
                value={data.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                rows="6"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-y"
                placeholder="Briefly describe your professional background and key achievements..."
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{data.summary.length} characters</p>
        </div>
    );
};

const ExperienceForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ title: '', company: '', duration: '', description: '' });

    const handleAdd = () => {
        if (newItem.title && newItem.company) {
            addItem('experience', newItem);
            setNewItem({ title: '', company: '', duration: '', description: '' });
        }
    };

    return (
        <div className="space-y-6">
            {/* List Existing */}
            <div className="space-y-3">
                {data.experience.map((item) => (
                    <div key={item.id} className="group flex justify-between items-start p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.company} • {item.duration}</p>
                        </div>
                        <button
                            onClick={() => deleteItem('experience', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Experience</h4>
                <input
                    placeholder="Job Title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Company"
                        value={newItem.company}
                        onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <input
                        placeholder="Duration (e.g. 2020 - Present)"
                        value={newItem.duration}
                        onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                </div>
                <textarea
                    placeholder="Description (Bullet points recommended)"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows="3"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black resize-y"
                />
                <button
                    onClick={handleAdd}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Position
                </button>
            </div>
        </div>
    );
};

const EducationForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ institution: '', degree: '', year: '', details: '' });

    const handleAdd = () => {
        if (newItem.institution && newItem.degree) {
            addItem('education', newItem);
            setNewItem({ institution: '', degree: '', year: '', details: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {data.education.map((item) => (
                    <div key={item.id} className="group flex justify-between items-start p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <h4 className="font-semibold text-gray-900">{item.degree}</h4>
                            <p className="text-sm text-gray-600">{item.institution} • {item.year}</p>
                        </div>
                        <button
                            onClick={() => deleteItem('education', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Education</h4>
                <input
                    placeholder="School / University"
                    value={newItem.institution}
                    onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <input
                    placeholder="Degree / Major"
                    value={newItem.degree}
                    onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Year"
                        value={newItem.year}
                        onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <input
                        placeholder="Location / Honors (Optional)"
                        value={newItem.details}
                        onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Education
                </button>
            </div>
        </div>
    );
};

const SkillsForm = ({ data, setSkills }) => {
    const [input, setInput] = useState('');

    const handleAdd = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const val = input.trim();
            if (val && !data.skills.includes(val)) {
                setSkills([...data.skills, val]);
                setInput('');
            }
        }
    };

    const removeSkill = (skill) => {
        setSkills(data.skills.filter(s => s !== skill));
    };

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleAdd}
                    placeholder="Add a skill (e.g. Project Management)"
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {data.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

const CertificationsForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ name: '', issuer: '', year: '' });

    const handleAdd = () => {
        if (newItem.name) {
            addItem('certifications', newItem);
            setNewItem({ name: '', issuer: '', year: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {data.certifications?.map((item) => (
                    <div key={item.id} className="group flex justify-between items-start p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.issuer} {item.year && `• ${item.year}`}</p>
                        </div>
                        <button
                            onClick={() => deleteItem('certifications', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Certification</h4>
                <input
                    placeholder="Certification Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Issuing Organization"
                        value={newItem.issuer}
                        onChange={(e) => setNewItem({ ...newItem, issuer: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <input
                        placeholder="Year"
                        value={newItem.year}
                        onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Certification
                </button>
            </div>
        </div>
    );
};

// --- TEMPLATE RENDERER ---

const HarvardCV = ({ data }) => {
    const { name, email, phone, linkedin, summary, education, experience, skills, certifications } = data;

    const formatDescription = (text) => {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim() !== '').map(line => line.trim().replace(/^[\*\-\d\.]\s*/, ''));
    };

    const SectionTitle = ({ title }) => (
        <div className="mt-6 mb-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-900 pb-1">
                {title}
            </h2>
        </div>
    );

    const hasContent = name || email || phone || linkedin || summary || education.length > 0 || experience.length > 0 || skills.length > 0;

    if (!hasContent) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Your CV Preview</p>
                <p className="text-sm">Start editing to see changes appear here.</p>
            </div>
        );
    }

    return (
        <div className="cv-preview bg-white p-8 md:p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:mx-0 print:w-full text-gray-900 font-serif leading-relaxed">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-3">{name}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</span>}
                    {phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>}
                    {linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-6">
                    <p className="text-sm text-justify text-gray-800">{summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div>
                    <SectionTitle title="Professional Experience" />
                    <div className="space-y-5">
                        {experience.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900">{item.company}</h3>
                                    <span className="text-sm text-gray-600 font-medium">{item.duration}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-800 italic mb-2">{item.title}</div>
                                <ul className="list-disc list-outside ml-4 space-y-1">
                                    {formatDescription(item.description).map((line, i) => (
                                        <li key={i} className="text-sm text-gray-700 pl-1">{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div>
                    <SectionTitle title="Education" />
                    <div className="space-y-3">
                        {education.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.institution}</h3>
                                    <div className="text-sm text-gray-800">{item.degree}</div>
                                    {item.details && <div className="text-xs text-gray-500 mt-0.5">{item.details}</div>}
                                </div>
                                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{item.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
                <div>
                    <SectionTitle title="Certifications" />
                    <div className="space-y-2">
                        {certifications.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                    <span className="font-bold text-gray-900">{item.name}</span>
                                    <span className="text-gray-600"> — {item.issuer}</span>
                                </div>
                                <span className="text-gray-600">{item.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div>
                    <SectionTitle title="Skills" />
                    <p className="text-sm text-gray-800 leading-relaxed">
                        {skills.join(' • ')}
                    </p>
                </div>
            )}
        </div>
    );
};


const MobileCVPreviewModal = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 lg:hidden print:hidden animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
                    <h3 className="font-bold text-gray-900">CV Preview</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    <div className="cv-preview-container transform scale-[0.6] sm:scale-[0.7] origin-top-left w-[210mm] h-[297mm] bg-white shadow-sm mx-auto">
                        <HarvardCV data={data} />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-gray-700 font-semibold hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            window.print();
                            onClose();
                        }}
                        className="flex-1 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const CVPage = () => {
    const [cvData, setCvData] = useState(initialCVData);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [openSection, setOpenSection] = useState('personal');
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const cv = await cvService.getMyCv();
                if (cv) {
                    setCvData({
                        name: cv.personalInfo?.name || '',
                        email: cv.personalInfo?.email || '',
                        phone: cv.personalInfo?.phone || '',
                        linkedin: cv.personalInfo?.linkedin || '',
                        summary: cv.personalInfo?.summary || '',
                        education: cv.education || [],
                        experience: cv.experience || [],
                        skills: cv.skills || [],
                        certifications: cv.certifications || []
                    });
                }
            } catch (error) {
                console.error("Error loading CV:", error);
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (localData) setCvData(prev => ({ ...prev, ...JSON.parse(localData) }));
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save Handler
    const handleSave = useCallback(async () => {
        if (isLoading) return;
        try {
            setIsSaving(true);
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
                certifications: cvData.certifications
            };
            await cvService.updateCv(backendData);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
        } catch (error) {
            console.error("Error saving CV:", error);
        } finally {
            setIsSaving(false);
        }
    }, [cvData, isLoading]);

    // Auto-Save
    useEffect(() => {
        const timeoutId = setTimeout(handleSave, 2000);
        return () => clearTimeout(timeoutId);
    }, [handleSave]);

    // Handlers
    const updateField = useCallback((field, value) => {
        setCvData(prev => ({ ...prev, [field]: value }));
    }, []);

    const addItem = useCallback((collection, item) => {
        setCvData(prev => ({
            ...prev,
            [collection]: [...(prev[collection] || []), { ...item, id: generateId() }],
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

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white">
            <div className="print:hidden">
                <StandardHeader title="CV Builder" showBack={true} backPath="/dashboard/jobs" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">

                {/* Mobile Preview Button */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setShowMobilePreview(true)}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <FileText className="w-5 h-5" /> Preview CV
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 print:block">

                    {/* LEFT COLUMN: EDITOR */}
                    <div className="w-full lg:w-5/12 xl:w-1/3 print:hidden">
                        <div className="sticky top-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold text-gray-900">Editor</h2>
                                {isSaving && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
                            </div>

                            <SectionWrapper title="Personal Details" icon={User} isOpen={openSection === 'personal'} onToggle={() => toggleSection('personal')}>
                                <PersonalDetailsForm data={cvData} updateField={updateField} />
                            </SectionWrapper>

                            <SectionWrapper title="Summary" icon={Zap} isOpen={openSection === 'summary'} onToggle={() => toggleSection('summary')}>
                                <SummaryForm data={cvData} updateField={updateField} />
                            </SectionWrapper>

                            <SectionWrapper title="Experience" icon={Briefcase} isOpen={openSection === 'experience'} onToggle={() => toggleSection('experience')}>
                                <ExperienceForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
                            </SectionWrapper>

                            <SectionWrapper title="Education" icon={BookOpen} isOpen={openSection === 'education'} onToggle={() => toggleSection('education')}>
                                <EducationForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
                            </SectionWrapper>

                            <SectionWrapper title="Certifications" icon={Award} isOpen={openSection === 'certifications'} onToggle={() => toggleSection('certifications')}>
                                <CertificationsForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
                            </SectionWrapper>

                            <SectionWrapper title="Skills" icon={Zap} isOpen={openSection === 'skills'} onToggle={() => toggleSection('skills')}>
                                <SkillsForm data={cvData} setSkills={setSkills} />
                            </SectionWrapper>

                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-70"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Briefcase className="w-5 h-5" /> Save Information
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW (Hidden on Mobile) */}
                    <div className="hidden lg:block w-full lg:w-7/12 xl:w-2/3 print:block print:w-full">
                        <div className="sticky top-8 print:static">
                            <div className="mb-4 flex justify-between items-center print:hidden">
                                <h2 className="text-lg font-bold text-gray-900">Live Preview</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" /> Print
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> PDF
                                    </button>
                                </div>
                            </div>
                            <div className="cv-preview-container border border-gray-200 shadow-xl rounded-lg overflow-hidden bg-white print:border-none print:shadow-none">
                                <HarvardCV data={cvData} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Preview Modal */}
            {showMobilePreview && <MobileCVPreviewModal data={cvData} onClose={() => setShowMobilePreview(false)} />}
        </div>
    );
};

export default CVPage;
