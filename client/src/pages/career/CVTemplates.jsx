import React from 'react';
import { Mail, Phone, Linkedin, MapPin, Globe, ExternalLink } from 'lucide-react';

// --- HELPER FUNCTIONS ---
const formatDescription = (text) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim() !== '').map(line => line.trim().replace(/^[\*\-\d\.]\s*/, ''));
};

// --- TEMPLATE 1: HARVARD (Classic) ---
export const HarvardCV = ({ data }) => {
    const { name, email, phone, linkedin, location, website, github, summary, education, experience, skills, certifications, projects, languages, awards } = data;

    const SectionTitle = ({ title }) => (
        <div className="mt-6 mb-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-900 pb-1">
                {title}
            </h2>
        </div>
    );

    return (
        <div className="cv-preview bg-white p-8 md:p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:mx-0 print:w-full text-gray-900 font-serif leading-relaxed">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-3">{name}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</span>}
                    {phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>}
                    {location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>}
                    {linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {github && <span className="flex items-center gap-1"><Github className="w-3 h-3" /> {github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
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

            {/* Projects */}
            {projects && projects.length > 0 && (
                <div>
                    <SectionTitle title="Projects" />
                    <div className="space-y-4">
                        {projects.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900">
                                        {item.name}
                                        {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-500 hover:text-black"><ExternalLink className="w-3 h-3 inline" /></a>}
                                    </h3>
                                    <span className="text-sm text-gray-600 font-medium">{item.duration}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-800 italic mb-2">{item.role}</div>
                                <p className="text-sm text-gray-700">{item.description}</p>
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

            {/* Skills & Languages */}
            <div className="grid grid-cols-2 gap-8">
                {skills.length > 0 && (
                    <div>
                        <SectionTitle title="Skills" />
                        <p className="text-sm text-gray-800 leading-relaxed">
                            {skills.join(' • ')}
                        </p>
                    </div>
                )}

                {languages && languages.length > 0 && (
                    <div>
                        <SectionTitle title="Languages" />
                        <div className="space-y-1">
                            {languages.map(lang => (
                                <div key={lang.id} className="text-sm text-gray-800">
                                    <span className="font-semibold">{lang.language}:</span> {lang.proficiency}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Awards */}
            {awards && awards.length > 0 && (
                <div>
                    <SectionTitle title="Awards" />
                    <div className="space-y-2">
                        {awards.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                    <span className="font-bold text-gray-900">{item.title}</span>
                                    <span className="text-gray-600"> — {item.issuer}</span>
                                </div>
                                <span className="text-gray-600">{item.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- TEMPLATE 2: MODERN (Sidebar Layout) ---
export const ModernCV = ({ data }) => {
    const { name, email, phone, linkedin, location, website, github, summary, education, experience, skills, certifications, projects, languages, awards } = data;

    return (
        <div className="cv-preview bg-white max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:mx-0 print:w-full flex text-gray-800 font-sans">
            {/* Left Sidebar */}
            <div className="w-1/3 bg-gray-900 text-white p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold leading-tight mb-2">{name}</h1>
                    <p className="text-gray-400 text-sm">Professional</p>
                </div>

                <div className="space-y-6 text-sm">
                    <div>
                        <h3 className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-3">Contact</h3>
                        <div className="space-y-2">
                            {email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> <span className="break-all">{email}</span></div>}
                            {phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> <span>{phone}</span></div>}
                            {location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> <span>{location}</span></div>}
                            {linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3 h-3" /> <span className="break-all">{linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span></div>}
                            {github && <div className="flex items-center gap-2"><Github className="w-3 h-3" /> <span className="break-all">{github.replace(/^https?:\/\/(www\.)?/, '')}</span></div>}
                            {website && <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> <span className="break-all">{website.replace(/^https?:\/\/(www\.)?/, '')}</span></div>}
                        </div>
                    </div>

                    {education.length > 0 && (
                        <div>
                            <h3 className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-3">Education</h3>
                            <div className="space-y-4">
                                {education.map((item) => (
                                    <div key={item.id}>
                                        <div className="font-bold">{item.degree}</div>
                                        <div className="text-gray-400">{item.institution}</div>
                                        <div className="text-gray-500 text-xs">{item.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {skills.length > 0 && (
                        <div>
                            <h3 className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {languages && languages.length > 0 && (
                        <div>
                            <h3 className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-3">Languages</h3>
                            <div className="space-y-2">
                                {languages.map(lang => (
                                    <div key={lang.id} className="flex justify-between text-xs">
                                        <span className="text-gray-300">{lang.language}</span>
                                        <span className="text-gray-500">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8 bg-white">
                {summary && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 pb-2">Profile</h2>
                        <p className="text-gray-600 leading-relaxed text-sm">{summary}</p>
                    </div>
                )}

                {experience.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 pb-2">Experience</h2>
                        <div className="space-y-6">
                            {experience.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">{item.duration}</span>
                                    </div>
                                    <div className="text-gray-700 font-medium mb-2">{item.company}</div>
                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                        {formatDescription(item.description).map((line, i) => (
                                            <li key={i} className="text-sm text-gray-600 pl-1">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects && projects.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 pb-2">Projects</h2>
                        <div className="space-y-6">
                            {projects.map((item) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {item.name}
                                            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-black"><ExternalLink className="w-3 h-3 inline" /></a>}
                                        </h3>
                                        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">{item.duration}</span>
                                    </div>
                                    <div className="text-gray-700 font-medium mb-2">{item.role}</div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {certifications && certifications.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 pb-2">Certifications</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {certifications.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="font-bold text-gray-900 block text-sm">{item.name}</span>
                                        <span className="text-gray-500 text-xs">{item.issuer}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs font-medium">{item.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {awards && awards.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 border-b-2 border-gray-100 pb-2">Awards</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {awards.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="font-bold text-gray-900 block text-sm">{item.title}</span>
                                        <span className="text-gray-500 text-xs">{item.issuer}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs font-medium">{item.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- TEMPLATE 3: MINIMAL (Clean Sans-Serif) ---
export const MinimalCV = ({ data }) => {
    const { name, email, phone, linkedin, location, website, github, summary, education, experience, skills, certifications, projects, languages, awards } = data;

    return (
        <div className="cv-preview bg-white p-8 md:p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:mx-0 print:w-full text-gray-900 font-sans">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-light text-gray-900 mb-2">{name}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    {email && <span>{email}</span>}
                    {phone && <span>{phone}</span>}
                    {location && <span>{location}</span>}
                    {linkedin && <span>{linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {github && <span>{github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {website && <span>{website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-8">
                {summary && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">About</h3>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                )}

                {experience.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Experience</h3>
                        <div className="space-y-6 border-l-2 border-gray-100 pl-6">
                            {experience.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-white"></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <span className="text-xs text-gray-400 font-mono">{item.duration}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">{item.company}</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {formatDescription(item.description).map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects && projects.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Projects</h3>
                        <div className="space-y-6 border-l-2 border-gray-100 pl-6">
                            {projects.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-white"></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900">
                                            {item.name}
                                            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-black"><ExternalLink className="w-3 h-3 inline" /></a>}
                                        </h4>
                                        <span className="text-xs text-gray-400 font-mono">{item.duration}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">{item.role}</div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                    {education.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Education</h3>
                            <div className="space-y-4">
                                {education.map((item) => (
                                    <div key={item.id}>
                                        <div className="font-bold text-gray-900">{item.institution}</div>
                                        <div className="text-sm text-gray-600">{item.degree}</div>
                                        <div className="text-xs text-gray-400 mt-1">{item.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {languages && languages.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Languages</h3>
                            <div className="space-y-2">
                                {languages.map(lang => (
                                    <div key={lang.id} className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{lang.language}</span> <span className="text-xs text-gray-400">({lang.proficiency})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {certifications && certifications.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Certifications</h3>
                        <div className="flex flex-wrap gap-4">
                            {certifications.map((item) => (
                                <div key={item.id} className="flex-1 min-w-[200px] border border-gray-100 p-3 rounded bg-gray-50/50">
                                    <div className="font-bold text-sm text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.issuer} • {item.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {awards && awards.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Awards</h3>
                        <div className="flex flex-wrap gap-4">
                            {awards.map((item) => (
                                <div key={item.id} className="flex-1 min-w-[200px] border border-gray-100 p-3 rounded bg-gray-50/50">
                                    <div className="font-bold text-sm text-gray-900">{item.title}</div>
                                    <div className="text-xs text-gray-500">{item.issuer} • {item.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
