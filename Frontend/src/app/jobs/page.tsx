"use client";
import { JobSpec, Message } from "@/Types/interfaces";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";


function MainComponent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [jobSpec, setJobSpec] = useState<JobSpec>({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        summary: "",
        responsibilities: [],
        requirements: [],
        benefits: [],
        customFields: [],
        miscellaneous: [],
        key: "",
    });
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            role: "assistant",
            content: "Hi! I'll help you write a job spec. Just type a job title to get started. I'll ask for any additional details I need about the location and industry."
        }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        try {
            setLoading(true);
            const userMessage: Message = { role: "user", content: inputValue };
            setMessages((prev) => [...prev, userMessage]);
            setInputValue("");

            const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: `You are a job specification writer. Your first task is to determine if you have enough information about the job location and industry.

              If the user hasn't specified both location and industry/company:
              1. Ask for the missing information
              2. Return: [CONVERSATION]What {missing_info} is this job based in?[/CONVERSATION][SPEC_UPDATE]{}[/SPEC_UPDATE]

              If you have both location and industry:
              1. Create the job specification
              2. Only apply location/industry salary premiums when explicitly known
              3. For finance/accounting roles, don't assume financial services industry
              4. Use base salary ranges without premiums if industry unknown
              5. Format salary as "£XX,XXX - £YY,YYY (estimate)"

              Return format: [CONVERSATION]your response[/CONVERSATION][SPEC_UPDATE]{ "field": "value" }[/SPEC_UPDATE]

              The spec update should be valid JSON with fields: title, company, location, type, salary, summary, responsibilities (array), requirements (array), benefits (array).`,
                        },
                        ...messages,
                        userMessage,
                    ],
                }),
            });

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            try {
                const conversationMatch = botResponse.match(
                    /\[CONVERSATION\](.*?)\[\/CONVERSATION\]/
                );
                const specMatch = botResponse.match(
                    /\[SPEC_UPDATE\](.*?)\[\/SPEC_UPDATE\]/
                );

                if (specMatch || conversationMatch) {
                    const specUpdate = specMatch ? JSON.parse(specMatch[1].trim()) : {};
                    setJobSpec((prev) => {
                        const newSpec: JobSpec = { ...prev };
                        Object.keys(specUpdate).forEach((key: string) => {
                            if (Array.isArray(specUpdate[key] as unknown)) {
                                newSpec[key] = [...new Set([...prev[key] as unknown as string[], ...(specUpdate[key] as unknown as string[])])];
                            } else if (specUpdate[key]) {
                                if (
                                    key === "salary" &&
                                    !specUpdate[key].includes("(estimate)")
                                ) {
                                    let salary = specUpdate[key];
                                    const highPayingIndustries = [
                                        "mining",
                                        "financial services",
                                        "big tech",
                                        "oil & gas",
                                    ];
                                    let totalIncrease = 0;

                                    if (specUpdate.location?.toLowerCase().includes("london")) {
                                        totalIncrease += 10;
                                    }

                                    if (specUpdate.company) {
                                        const industryMatch = highPayingIndustries.some(
                                            (industry) =>
                                                specUpdate.company.toLowerCase().includes(industry)
                                        );
                                        if (industryMatch) {
                                            totalIncrease += 5 + Math.random() * 5;
                                        }
                                    }

                                    if (totalIncrease > 0) {
                                        const [min, max] = salary
                                            .split("-")
                                            .map((s: string) => parseInt(s.replace(/[^0-9]/g, "")));
                                        const adjustedMin: number = Math.round(
                                            min * (1 + totalIncrease / 100)
                                        );
                                        const adjustedMax = Math.round(
                                            max * (1 + totalIncrease / 100)
                                        );
                                        salary = `£${adjustedMin.toLocaleString()} - £${adjustedMax.toLocaleString()} (estimate)`;
                                    } else {
                                        salary = `${salary} (estimate)`;
                                    }
                                    newSpec[key] = salary;
                                } else {
                                    newSpec[key] = specUpdate[key];
                                }
                            }
                        });
                        return newSpec;
                    });

                    if (conversationMatch) {
                        setMessages((prev) => [
                            ...prev,
                            {
                                role: "assistant",
                                content: conversationMatch[1].trim(),
                            },
                        ]);
                    }
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (error) {
                console.error("Error processing response:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "I'm having trouble processing that. Could you try again?",
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I'm having trouble right now. Could you try again?",
                },
            ]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const formattedJob = {
                title: jobSpec.title,
                description: jobSpec.summary,
                company: jobSpec.company,
                location: jobSpec.location,
                type: jobSpec.type,
                salary: jobSpec.salary,
                responsibilities: jobSpec.responsibilities.filter(Boolean),
                requirements: jobSpec.requirements.filter(Boolean),
                benefits: jobSpec.benefits.filter(Boolean),
                customFields: jobSpec.customFields.filter(
                    (field) => field.label && field.value
                ),
                status: "active",
                postedDate: new Date().toISOString(),
                expiryDate: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
            };

            const dbResponse = await fetch("/api/db/job-descriptions", {
                method: "POST",
                body: JSON.stringify({
                    query:
                        "INSERT INTO `jobs` (`title`, `description`, `company`, `location`, `type`, `salary`, `benefits`, `requirements`, `description`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    values: [
                        formattedJob.title,
                        formattedJob.description,
                        formattedJob.company,
                        formattedJob.location,
                        formattedJob.type,
                        formattedJob.salary,
                        JSON.stringify(formattedJob.benefits),
                        JSON.stringify(formattedJob.requirements),
                        formattedJob.description,
                    ],
                }),
            });

            if (!dbResponse.ok) {
                throw new Error("Failed to save to database");
            }

            setShowSuccess(true);
            setShowPreview(false);

            setTimeout(() => {
                window.location.href = "/clientdash";
            }, 2000);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `❌ ${(error as Error).message}. Please try again.`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ff6b6b] p-8 font-helvetica-neue font-bold">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={'/'}
                            className="bg-[#4339ca] hover:bg-[#4339ca]/80 px-6 py-2 rounded-xl transition-all text-white"
                        >
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-light text-white">
                            Generate Job Specification
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/10 rounded-2xl p-6 h-[calc(100vh-12rem)] border-2 border-[#4339ca]">
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                            }`}>
                                        <div
                                            className={`max-w-[70%] p-4 rounded-xl ${message.role === "user" ? "bg-[#4339ca]" : "bg-white/10"
                                                } text-white`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 p-4 rounded-xl text-white">
                                            <i className="fas fa-spinner fa-spin"></i>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                                    placeholder={
                                        messages.length === 1
                                            ? "For example: Plumber, Finance Manager, Software Developer..."
                                            : "Tell me more about the role and I'll do the boring stuff"
                                    }
                                    className="flex-1 bg-white/10 px-4 py-2 rounded-xl text-white outline-none flash-animation placeholder-white"
                                    name="message"
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-[#4339ca] hover:bg-[#4339ca]/80 w-12 h-12 rounded-xl text-white disabled:opacity-50 flex items-center justify-center"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 h-[calc(100vh-12rem)] flex flex-col border-2 border-[#4339ca]">
                        <div className="flex-1 overflow-y-auto space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl text-white">Job Specification</h2>
                                    <button
                                        onClick={() =>
                                            setJobSpec((prev) => ({
                                                ...prev,
                                                customFields: [
                                                    ...(prev.customFields || []),
                                                    { label: "", value: "" },
                                                ],
                                            }))
                                        }
                                        className="bg-[#4339ca] hover:bg-[#4339ca]/80 px-4 py-2 rounded-xl text-white text-sm"
                                    >
                                        Add Field
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Basic Details</h3>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={jobSpec.title}
                                                onChange={(e) =>
                                                    setJobSpec((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                placeholder="Title"
                                                className="w-full bg-[#00E5FF]/20 px-4 placeholder-slate-100 py-2 rounded-xl text-white"
                                                name="title"
                                            />
                                            <input
                                                type="text"
                                                value={jobSpec.company}
                                                onChange={(e) =>
                                                    setJobSpec((prev) => ({
                                                        ...prev,
                                                        company: e.target.value,
                                                    }))
                                                }
                                                placeholder="Company"
                                                className="w-full bg-[#00E5FF]/20 px-4 py-2 placeholder-slate-100 rounded-xl text-white"
                                                name="company"
                                            />
                                            <input
                                                type="text"
                                                value={jobSpec.location}
                                                onChange={(e) =>
                                                    setJobSpec((prev) => ({
                                                        ...prev,
                                                        location: e.target.value,
                                                    }))
                                                }
                                                placeholder="Location"
                                                className="w-full bg-[#00E5FF]/20 placeholder-slate-100 px-4 py-2 rounded-xl text-white"
                                                name="location"
                                            />
                                            <input
                                                type="text"
                                                value={jobSpec.type}
                                                onChange={(e) =>
                                                    setJobSpec((prev) => ({
                                                        ...prev,
                                                        type: e.target.value,
                                                    }))
                                                }
                                                placeholder="Type"
                                                className="w-full bg-[#00E5FF]/20 placeholder-slate-100 px-4 py-2 rounded-xl text-white"
                                                name="type"
                                            />
                                            <input
                                                type="text"
                                                value={jobSpec.salary}
                                                onChange={(e) =>
                                                    setJobSpec((prev) => ({
                                                        ...prev,
                                                        salary: e.target.value,
                                                    }))
                                                }
                                                placeholder="Salary"
                                                className="w-full bg-[#00E5FF]/20 placeholder-slate-100 px-4 py-2 rounded-xl text-white"
                                                name="salary"
                                            />
                                            {jobSpec.customFields?.map((field, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) =>
                                                            setJobSpec((prev) => ({
                                                                ...prev,
                                                                customFields: prev.customFields.map((f, i) =>
                                                                    i === index
                                                                        ? { ...f, label: e.target.value }
                                                                        : f
                                                                ),
                                                            }))
                                                        }
                                                        placeholder="Field Name"
                                                        className="flex-1 bg-[#00E5FF]/20 px-4 py-2 rounded-xl text-white"
                                                        name={`custom-field-label-${index}`}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            setJobSpec((prev) => ({
                                                                ...prev,
                                                                customFields: prev.customFields.map((f, i) =>
                                                                    i === index
                                                                        ? { ...f, value: e.target.value }
                                                                        : f
                                                                ),
                                                            }))
                                                        }
                                                        placeholder="Value"
                                                        className="flex-1 bg-[#00E5FF]/20 px-4 py-2 rounded-xl text-white"
                                                        name={`custom-field-value-${index}`}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setJobSpec((prev) => ({
                                                                ...prev,
                                                                customFields: prev.customFields.filter(
                                                                    (_, i) => i !== index
                                                                ),
                                                            }))
                                                        }
                                                        className="bg-[#FF7F6B]/70 hover:bg-[#FF7F6B] w-10 rounded-xl text-white flex items-center justify-center"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Summary</h3>
                                        <textarea
                                            value={jobSpec.summary}
                                            onChange={(e) =>
                                                setJobSpec((prev) => ({
                                                    ...prev,
                                                    summary: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter job summary..."
                                            className="w-full h-32 bg-[#00E5FF]/20 placeholder-slate-100 px-4 py-2 rounded-xl text-white resize-none"
                                            name="summary"
                                        />
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Responsibilities</h3>
                                        <textarea
                                            value={jobSpec.responsibilities.join("\n")}
                                            onChange={(e) =>
                                                setJobSpec((prev) => ({
                                                    ...prev,
                                                    responsibilities: e.target.value.split("\n"),
                                                }))
                                            }
                                            placeholder="Enter responsibilities (one per line)..."
                                            className="w-full h-32 bg-[#00E5FF]/20 placeholder-slate-100 px-4 py-2 rounded-xl text-white resize-none"
                                            name="responsibilities"
                                        />
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Requirements</h3>
                                        <textarea
                                            value={jobSpec.requirements.join("\n")}
                                            onChange={(e) =>
                                                setJobSpec((prev) => ({
                                                    ...prev,
                                                    requirements: e.target.value.split("\n"),
                                                }))
                                            }
                                            placeholder="Enter requirements (one per line)..."
                                            className="w-full h-32 bg-[#00E5FF]/20 px-4 py-2 placeholder-slate-100 rounded-xl text-white resize-none"
                                            name="requirements"
                                        />
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Benefits</h3>
                                        <textarea
                                            value={jobSpec.benefits.join("\n")}
                                            onChange={(e) =>
                                                setJobSpec((prev) => ({
                                                    ...prev,
                                                    benefits: e.target.value.split("\n"),
                                                }))
                                            }
                                            placeholder="Enter benefits (one per line)..."
                                            className="w-full h-32 bg-[#00E5FF]/20 px-4 py-2 placeholder-slate-100 rounded-xl text-white resize-none"
                                            name="benefits"
                                        />
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <h3 className="text-white mb-2">Other / Miscellaneous</h3>
                                        <textarea
                                            value={jobSpec.miscellaneous?.join("\n") || ""}
                                            onChange={(e) =>
                                                setJobSpec((prev) => ({
                                                    ...prev,
                                                    miscellaneous: e.target.value.split("\n"),
                                                }))
                                            }
                                            placeholder="Enter any additional information (one per line)..."
                                            className="w-full h-32 bg-[#00E5FF]/20 px-4 py-2 placeholder-slate-100 rounded-xl text-white resize-none"
                                            name="miscellaneous"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPreview(true)}
                            className="bg-[#4339ca] hover:bg-[#4339ca]/80 px-6 py-2 rounded-xl text-white w-full mt-4"
                        >
                            Preview & Publish
                        </button>
                    </div>
                </div>
            </div>
            {showPreview && (
                <div className="fixed inset-0 bg-[#ff6b6b] flex items-center justify-center p-8 z-50">
                    <div className="bg-[#ff6b6b] rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl text-white">Job Specification Preview</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="bg-[#4339ca] hover:bg-[#4339ca]/80 px-6 py-2 rounded-xl text-white"
                                    disabled={loading}
                                >
                                    Make Changes
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-[#4339ca] hover:bg-[#4339ca]/80 px-6 py-2 rounded-xl text-white flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Publishing...
                                        </>
                                    ) : (
                                        "Publish"
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                <h3 className="text-2xl text-white mb-4">{jobSpec.title}</h3>
                                <div className="grid grid-cols-2 gap-4 text-white mb-4">
                                    <div>Company: {jobSpec.company}</div>
                                    <div>Location: {jobSpec.location}</div>
                                    <div>Type: {jobSpec.type}</div>
                                    <div>Salary: {jobSpec.salary}</div>
                                    {jobSpec.customFields?.map((field, index) => (
                                        <div key={index}>
                                            {field.label}: {field.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {jobSpec.summary && (
                                <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                    <h3 className="text-xl text-white mb-4">Summary</h3>
                                    <p className="text-white/80 whitespace-pre-wrap">
                                        {jobSpec.summary}
                                    </p>
                                </div>
                            )}
                            {jobSpec.responsibilities.length > 0 && (
                                <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                    <h3 className="text-xl text-white mb-4">Responsibilities</h3>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {jobSpec.responsibilities.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {jobSpec.requirements.length > 0 && (
                                <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                    <h3 className="text-xl text-white mb-4">Requirements</h3>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {jobSpec.requirements.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {jobSpec.benefits.length > 0 && (
                                <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                    <h3 className="text-xl text-white mb-4">Benefits</h3>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {jobSpec.benefits.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {jobSpec.miscellaneous?.length > 0 && (
                                <div className="bg-white/10 p-6 rounded-xl border-2 border-[#4339ca]">
                                    <h3 className="text-xl text-white mb-4">Other Information</h3>
                                    <ul className="list-disc list-inside text-white/80 space-y-2">
                                        {jobSpec.miscellaneous.map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-2xl text-white mb-4">
                            Job Posted Successfully!
                        </h3>
                        <p className="text-white/80">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}
            <style jsx global>{`
        @keyframes flash {
          0%, 100% { background-color: rgba(255, 255, 255, 0.1); }
          50% { background-color: rgba(255, 255, 255, 0.2); }
        }
        .flash-animation {
          animation: flash 1s 2;
        }
      `}</style>
        </div>
    );
}

export default MainComponent;