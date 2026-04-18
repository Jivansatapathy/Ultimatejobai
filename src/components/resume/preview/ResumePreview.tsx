import { Resume } from "@/types/resume";

export type Page2StartSection =
    | "experience" | "skills" | "projects" | "education" | "certifications";

interface ResumePreviewProps {
    data: Resume;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    if (!data) return null;

    return (
        <div id="resume-preview-content">
            <div className="resume-a4-page">

                {/* Name & Contact */}
                <header style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h1 style={{
                        fontSize: "24px", fontWeight: 900, letterSpacing: "0.08em",
                        textTransform: "uppercase", color: "#0f0f0f",
                        margin: "0 0 8px 0", lineHeight: 1.1,
                    }}>
                        {data.personalDetails.fullName}
                    </h1>
                    <div style={{
                        display: "flex", flexWrap: "wrap", justifyContent: "center",
                        gap: "4px 12px", fontSize: "11.5px", color: "#444", fontWeight: 500,
                    }}>
                        {data.personalDetails.email && <span>{data.personalDetails.email}</span>}
                        {data.personalDetails.phone && <><Dot /><span>{data.personalDetails.phone}</span></>}
                        {data.personalDetails.location && <><Dot /><span>{data.personalDetails.location}</span></>}
                        {data.personalDetails.linkedinUrl && (
                            <><Dot /><a href={data.personalDetails.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: "#1d4ed8", textDecoration: "none", fontStyle: "italic" }}>LinkedIn</a></>
                        )}
                        {data.personalDetails.portfolioUrl && (
                            <><Dot /><a href={data.personalDetails.portfolioUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: "#1d4ed8", textDecoration: "none", fontStyle: "italic" }}>Portfolio</a></>
                        )}
                    </div>
                    <div style={{ borderBottom: "2px solid #111", marginTop: "12px" }} />
                </header>

                {/* Professional Summary */}
                {data.summary && (
                    <section style={{ marginBottom: "22px" }}>
                        <SH>Professional Summary</SH>
                        <p style={{ fontSize: "12.5px", color: "#333", lineHeight: 1.7, margin: 0 }}>
                            {data.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {(data.experience?.length || 0) > 0 && (
                    <section style={{ marginBottom: "22px" }}>
                        <SH>Experience</SH>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {data.experience.map((exp, i) => (
                                <div key={exp.id || i} className="resume-entry">
                                    <div className="entry-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f0f" }}>{exp.role}</span>
                                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, marginLeft: "12px" }}>{exp.duration}</span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#444", fontStyle: "italic", marginBottom: "7px" }}>{exp.company}</div>
                                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", listStyleType: "disc" }}>
                                        {(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map((b, idx) => (
                                            <li key={idx} style={{ fontSize: "12.5px", color: "#333", lineHeight: 1.65, marginBottom: "4px" }}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {((data.skills?.length || 0) > 0 || (data.softSkills?.length || 0) > 0) && (
                    <section style={{ marginBottom: "22px" }}>
                        <SH>Skills</SH>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {(data.skills?.length || 0) > 0 && (
                                <div style={{ display: "flex", gap: "10px", fontSize: "12.5px", lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, color: "#0f0f0f", minWidth: "90px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "2px" }}>Technical:</span>
                                    <span style={{ color: "#333" }}>{data.skills.join(", ")}</span>
                                </div>
                            )}
                            {(data.softSkills?.length || 0) > 0 && (
                                <div style={{ display: "flex", gap: "10px", fontSize: "12.5px", lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, color: "#0f0f0f", minWidth: "90px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "2px" }}>Soft Skills:</span>
                                    <span style={{ color: "#333" }}>{data.softSkills.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {(data.projects?.length || 0) > 0 && (
                    <section style={{ marginBottom: "22px" }}>
                        <SH>Projects</SH>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {data.projects.map((proj, i) => (
                                <div key={proj.id || i} className="resume-entry">
                                    <div className="entry-header" style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f0f", marginBottom: "6px" }}>
                                        {proj.title}
                                        {proj.link && <span style={{ fontSize: "11px", color: "#1d4ed8", fontStyle: "italic", fontWeight: 400, marginLeft: "8px" }}>(Link)</span>}
                                    </div>
                                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", listStyleType: "disc" }}>
                                        {(Array.isArray(proj.description) ? proj.description : [proj.description]).filter(Boolean).map((b, idx) => (
                                            <li key={idx} style={{ fontSize: "12.5px", color: "#333", lineHeight: 1.65, marginBottom: "4px" }}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {(data.education?.length || 0) > 0 && (
                    <section style={{ marginBottom: "22px" }}>
                        <SH>Education</SH>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {data.education.map((edu, i) => (
                                <div key={edu.id || i} className="resume-entry">
                                    <div className="entry-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f0f" }}>{edu.degree}</span>
                                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, marginLeft: "12px" }}>{edu.year}</span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#444", fontStyle: "italic", marginTop: "2px" }}>{edu.school}</div>
                                    {edu.gpa && <div style={{ fontSize: "11.5px", color: "#666", marginTop: "3px" }}>GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications & Honors */}
                {((data.certifications?.length || 0) > 0 || (data.extracurricularActivities?.length || 0) > 0) && (
                    <section style={{ marginBottom: "10px" }}>
                        <SH>Certifications &amp; Honors</SH>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {data.certifications?.map((cert, i) => (
                                <div key={i} style={{ fontSize: "12.5px" }}>
                                    <span style={{ fontWeight: 700, color: "#0f0f0f" }}>
                                        {typeof cert === "string" ? cert : cert.name}
                                    </span>
                                    {typeof cert !== "string" && cert.issuer && (
                                        <span style={{ color: "#666", fontSize: "11.5px", marginLeft: "8px" }}>
                                            — {cert.issuer} ({cert.year})
                                        </span>
                                    )}
                                </div>
                            ))}
                            {data.extracurricularActivities?.map((activity, i) => (
                                <div key={i} className="resume-entry">
                                    <div className="entry-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f0f" }}>{activity.role}</span>
                                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, marginLeft: "12px" }}>{activity.duration}</span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#444", fontStyle: "italic", marginBottom: "7px" }}>{activity.organization}</div>
                                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", listStyleType: "disc" }}>
                                        {(Array.isArray(activity.description) ? activity.description : [activity.description]).filter(Boolean).map((b, idx) => (
                                            <li key={idx} style={{ fontSize: "12.5px", color: "#333", lineHeight: 1.65, marginBottom: "4px" }}>{b}</li>
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

function Dot() {
    return <span style={{ color: "#ccc" }}>•</span>;
}

function SH({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="resume-section-heading" style={{
            fontSize: "10.5px", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.12em", color: "#0f0f0f",
            borderBottom: "1.5px solid #c8c8c8", paddingBottom: "4px",
            marginBottom: "12px", marginTop: 0,
        }}>
            {children}
        </h2>
    );
}
