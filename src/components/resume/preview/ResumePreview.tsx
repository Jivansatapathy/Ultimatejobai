import { Resume } from "@/types/resume";

interface ResumePreviewProps {
    data: Resume;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    return (
        <div id="resume-preview-content" className="h-full text-gray-900 font-sans text-sm leading-normal bg-white">
            <div className="resume-page-container">
                <div className="resume-page-indicator top-[297mm]" />
                {/* Header */}
                <header className="border-b-2 border-gray-900 pb-4 mb-6 resume-section">
                    <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{data.personalDetails.fullName}</h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {data.personalDetails.email && (
                            <span>{data.personalDetails.email}</span>
                        )}
                        {data.personalDetails.phone && (
                            <span>• {data.personalDetails.phone}</span>
                        )}
                        {data.personalDetails.location && (
                            <span>• {data.personalDetails.location}</span>
                        )}
                        {data.personalDetails.linkedinUrl && (
                            <span className="text-blue-700 italic">• LinkedIn</span>
                        )}
                        {data.personalDetails.portfolioUrl && (
                            <span className="text-blue-700 italic">• Portfolio</span>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {data.summary && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-800">
                            Professional Summary
                        </h2>
                        <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">
                            Experience
                        </h2>
                        <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                                <div key={exp.id || i}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-gray-900">{exp.role}</h3>
                                        <span className="text-xs font-semibold text-gray-700 uppercase">
                                            {exp.duration}
                                        </span>
                                    </div>
                                    <div className="text-gray-800 font-medium mb-1.5 italic">{exp.company}</div>
                                    <ul className="list-disc ml-5 space-y-1 text-gray-700">
                                        {(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map((bullet, idx) => (
                                            <li key={idx} className="pl-1">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills: Hard & Soft */}
                {(data.skills.length > 0 || data.softSkills.length > 0) && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-800">
                            Skills
                        </h2>
                        <div className="space-y-2">
                            {data.skills.length > 0 && (
                                <div className="text-gray-700">
                                    <span className="font-bold">Technical: </span>
                                    {data.skills.join(", ")}
                                </div>
                            )}
                            {data.softSkills && data.softSkills.length > 0 && (
                                <div className="text-gray-700">
                                    <span className="font-bold">Interpersonal: </span>
                                    {data.softSkills.join(", ")}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {data.projects.map((proj, i) => (
                                <div key={proj.id || i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">
                                            {proj.title}
                                            {proj.link && <span className="ml-2 text-blue-700 text-xs font-normal italic">(Link)</span>}
                                        </h3>
                                    </div>
                                    <ul className="list-disc ml-5 space-y-1 text-gray-700">
                                        {(Array.isArray(proj.description) ? proj.description : [proj.description]).filter(Boolean).map((bullet, idx) => (
                                            <li key={idx} className="pl-1">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">
                            Education
                        </h2>
                        <div className="space-y-3">
                            {data.education.map((edu, i) => (
                                <div key={edu.id || i} className="flex justify-between items-baseline">
                                    <div>
                                        <span className="font-bold text-gray-900">{edu.school}</span>
                                        <span className="text-gray-700 mx-1">—</span>
                                        <span className="text-gray-700">{edu.degree}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {data.certifications && data.certifications.length > 0 && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">
                            Certifications
                        </h2>
                        <div className="space-y-2">
                            {data.certifications.map((cert, i) => (
                                <div key={cert.id || i} className="flex justify-between items-baseline text-gray-700">
                                    <div>
                                        <span className="font-bold">{cert.name}</span>
                                        <span className="mx-1">by</span>
                                        <span>{cert.issuer}</span>
                                    </div>
                                    <span className="text-xs font-semibold">{cert.year}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Extracurriculars */}
                {data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
                    <section className="mb-6 resume-section">
                        <h2 className="text-base font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">
                            Activities & Leadership
                        </h2>
                        <div className="space-y-4">
                            {data.extracurricularActivities.map((act, i) => (
                                <div key={act.id || i}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-gray-900">{act.role}</h3>
                                        <span className="text-xs font-semibold text-gray-700 uppercase">
                                            {act.duration}
                                        </span>
                                    </div>
                                    <div className="text-gray-800 font-medium mb-1.5 italic">{act.organization}</div>
                                    <ul className="list-disc ml-5 space-y-1 text-gray-700">
                                        {(Array.isArray(act.description) ? act.description : [act.description]).filter(Boolean).map((bullet, idx) => (
                                            <li key={idx} className="pl-1">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
