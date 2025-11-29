import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Phone, Linkedin, Briefcase, BookOpen, User, Zap, X,
    ChevronDown, ChevronUp, Printer, Plus, Trash2, Award, FileText, Download,
    Globe, Github, MapPin, FolderGit, Languages, Star
} from 'lucide-react';
import StandardHeader from '../../components/ui/StandardHeader';
import cvService from '../../services/cvService';
import apiClient from '../../services/apiClient';
import { HarvardCV, ModernCV, MinimalCV } from './CVTemplates';

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
    location: '',
    website: '',
    github: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    awards: []
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <input
                    type="text"
                    value={data.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="City, Country"
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
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">GitHub URL</label>
                <input
                    type="url"
                    value={data.github}
                    onChange={(e) => updateField('github', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="github.com/janedoe"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Portfolio / Website</label>
                <input
                    type="url"
                    value={data.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="janedoe.com"
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

const ProjectsForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ name: '', role: '', duration: '', description: '', link: '' });

    const handleAdd = () => {
        if (newItem.name) {
            addItem('projects', newItem);
            setNewItem({ name: '', role: '', duration: '', description: '', link: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {data.projects?.map((item) => (
                    <div key={item.id} className="group flex justify-between items-start p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.role} {item.duration && `• ${item.duration}`}</p>
                        </div>
                        <button
                            onClick={() => deleteItem('projects', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Project</h4>
                <input
                    placeholder="Project Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Role"
                        value={newItem.role}
                        onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <input
                        placeholder="Duration"
                        value={newItem.duration}
                        onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                </div>
                <input
                    placeholder="Project Link (Optional)"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows="2"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black resize-y"
                />
                <button
                    onClick={handleAdd}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>
        </div>
    );
};

const LanguagesForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ language: '', proficiency: '' });

    const handleAdd = () => {
        if (newItem.language) {
            addItem('languages', newItem);
            setNewItem({ language: '', proficiency: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {data.languages?.map((item) => (
                    <div key={item.id} className="group flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <span className="font-semibold text-gray-900">{item.language}</span>
                            <span className="text-sm text-gray-600 ml-2">({item.proficiency})</span>
                        </div>
                        <button
                            onClick={() => deleteItem('languages', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Language</h4>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Language"
                        value={newItem.language}
                        onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    />
                    <select
                        value={newItem.proficiency}
                        onChange={(e) => setNewItem({ ...newItem, proficiency: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                    >
                        <option value="">Select Proficiency</option>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                    </select>
                </div>
                <button
                    onClick={handleAdd}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Language
                </button>
            </div>
        </div>
    );
};

const AwardsForm = ({ data, addItem, deleteItem }) => {
    const [newItem, setNewItem] = useState({ title: '', issuer: '', year: '' });

    const handleAdd = () => {
        if (newItem.title) {
            addItem('awards', newItem);
            setNewItem({ title: '', issuer: '', year: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {data.awards?.map((item) => (
                    <div key={item.id} className="group flex justify-between items-start p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                        <div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.issuer} {item.year && `• ${item.year}`}</p>
                        </div>
                        <button
                            onClick={() => deleteItem('awards', item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Award</h4>
                <input
                    placeholder="Award Title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Issuer"
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
                    <Plus className="w-4 h-4" /> Add Award
                </button>
            </div>
        </div>
    );
};

// --- TEMPLATE RENDERER ---

// --- TEMPLATE RENDERER ---

const TemplateRenderer = ({ template, data }) => {
    const hasContent = data.name || data.email || data.phone || data.linkedin || data.summary || data.education.length > 0 || data.experience.length > 0 || data.skills.length > 0;

    if (!hasContent) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Your CV Preview</p>
                <p className="text-sm">Start editing to see changes appear here.</p>
            </div>
        );
    }

    switch (template) {
        case 'modern':
            return <ModernCV data={data} />;
        case 'minimal':
            return <MinimalCV data={data} />;
        case 'harvard':
        default:
            return <HarvardCV data={data} />;
    }
};


const MobileCVPreviewModal = ({ data, template, onClose }) => {
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
                        <TemplateRenderer template={template} data={data} />
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
    const [selectedTemplate, setSelectedTemplate] = useState('harvard');
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // 1. Fetch existing CV
                const cvPromise = cvService.getMyCv();

                // 2. Fetch Registration Data (Profile)
                const regPromise = apiClient.get("/users/my-registration").catch(() => null);

                const [cv, regRes] = await Promise.all([cvPromise, regPromise]);
                const regData = regRes?.data?.data;

                // Map Registration to CV format
                const regCV = {
                    name: regData ? `${regData.personalInfo?.firstName || ''} ${regData.personalInfo?.lastName || ''}`.trim() : '',
                    email: regData?.personalInfo?.email || '',
                    phone: regData?.personalInfo?.mobile || '',
                    location: regData?.personalInfo?.address || '',
                    // Education mapping - Registration only has one entry usually
                    education: (regData?.education?.school) ? [{
                        id: generateId(),
                        institution: regData.education.school,
                        degree: regData.education.degree || '',
                        year: regData.education.dateAttended || '',
                        details: regData.education.highestAttainment || ''
                    }] : [],
                    // Experience mapping
                    experience: (regData?.professional?.company) ? [{
                        id: generateId(),
                        title: regData.professional.position || '',
                        company: regData.professional.company,
                        duration: regData.professional.dateEmployment || '',
                        description: ''
                    }] : []
                };

                if (cv) {
                    setCvData({
                        name: cv.personalInfo?.name || regCV.name || '',
                        email: cv.personalInfo?.email || regCV.email || '',
                        phone: cv.personalInfo?.phone || regCV.phone || '',
                        linkedin: cv.personalInfo?.linkedin || '',
                        location: cv.personalInfo?.location || regCV.location || '',
                        website: cv.personalInfo?.website || '',
                        github: cv.personalInfo?.github || '',
                        summary: cv.personalInfo?.summary || '',
                        education: (cv.education && cv.education.length > 0) ? cv.education : regCV.education,
                        experience: (cv.experience && cv.experience.length > 0) ? cv.experience : regCV.experience,
                        skills: cv.skills || [],
                        certifications: cv.certifications || [],
                        projects: cv.projects || [],
                        languages: cv.languages || [],
                        awards: cv.awards || []
                    });
                } else {
                    // No CV found, use Reg Data
                    setCvData({
                        ...initialCVData,
                        ...regCV,
                        education: regCV.education,
                        experience: regCV.experience
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
                    location: cvData.location,
                    website: cvData.website,
                    github: cvData.github,
                    summary: cvData.summary,
                },
                education: cvData.education,
                experience: cvData.experience,
                skills: cvData.skills,
                certifications: cvData.certifications,
                projects: cvData.projects,
                languages: cvData.languages,
                awards: cvData.awards
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

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:max-w-none">

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

                            {/* Template Selector */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Template</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'harvard', name: 'Classic', color: 'bg-gray-100' },
                                        { id: 'modern', name: 'Modern', color: 'bg-gray-900' },
                                        { id: 'minimal', name: 'Minimal', color: 'bg-white border border-gray-200' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`p-2 rounded-lg text-xs font-medium transition-all ${selectedTemplate === t.id
                                                ? 'ring-2 ring-black ring-offset-1'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-full h-12 rounded mb-2 ${t.color} flex items-center justify-center border border-gray-200`}>
                                                <div className="w-1/2 h-1 bg-current opacity-20 rounded"></div>
                                            </div>
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
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

                            <SectionWrapper title="Projects" icon={FolderGit} isOpen={openSection === 'projects'} onToggle={() => toggleSection('projects')}>
                                <ProjectsForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
                            </SectionWrapper>

                            <SectionWrapper title="Languages" icon={Languages} isOpen={openSection === 'languages'} onToggle={() => toggleSection('languages')}>
                                <LanguagesForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
                            </SectionWrapper>

                            <SectionWrapper title="Awards" icon={Star} isOpen={openSection === 'awards'} onToggle={() => toggleSection('awards')}>
                                <AwardsForm data={cvData} addItem={addItem} deleteItem={deleteItem} />
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
                                <TemplateRenderer template={selectedTemplate} data={cvData} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Preview Modal */}
            {showMobilePreview && <MobileCVPreviewModal data={cvData} template={selectedTemplate} onClose={() => setShowMobilePreview(false)} />}
        </div>
    );
};

export default CVPage;
