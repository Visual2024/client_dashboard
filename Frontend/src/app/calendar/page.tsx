"use client";
import Link from "next/link";
import React, { useState } from "react";

interface Interview {
    id: number;
    company: string;
    role: string;
    date: string;
    time: string;
    duration: string;
    type: string;
    interviewer: string;
    status: string;
    meetingLink: string;
    notes: string;
    logo: string;
}

interface DragInfo {
    date: Date;
    time: string;
}

function MainComponent() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [hoveredInterviewer, setHoveredInterviewer] = useState<string | null>(null);
    const [interviewerProfile, setInterviewerProfile] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<DragInfo | null>(null);
    const [dragEnd, setDragEnd] = useState<DragInfo | null>(null);
    const [dragValue, setDragValue] = useState<boolean>(true);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
    const [interviews] = useState<Interview[]>([
        {
            id: 1,
            company: "Treasury Position",
            role: "Senior Treasury Manager",
            date: "2025-02-15",
            time: "14:00",
            duration: "45 minutes",
            type: "Technical Interview",
            interviewer: "Candidate - Michael Thompson",
            status: "upcoming",
            meetingLink: "https://meet.google.com/abc-defg-hij",
            notes: "Prepare system design examples and recent project discussions",
            logo: "/company-logos/tech-solutions.png",
        },
        {
            id: 3,
            company: "IT Position",
            role: "Data Analyst",
            date: "2025-02-16",
            time: "10:00",
            duration: "30 minutes",
            type: "Initial Screening",
            interviewer: "Emma Wilson",
            status: "upcoming",
            meetingLink: "https://teams.microsoft.com/meet/123",
            notes: "Prepare SQL examples and data visualization portfolio",
            logo: "/company-logos/future-finance.png",
        },
    ]);

    const changeMonth = (increment: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setSelectedDate(newDate);
    };

    const changeWeek = (increment: number) => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + increment * 7);
        setCurrentWeekStart(newDate);
    };

    const fetchInterviewerProfile = async (interviewer: string) => {
        setLoadingProfile(true);
        try {
            if (interviewer === "Candidate - Michael Thompson") {
                setInterviewerProfile(
                    "Michael Thompson is a Treasury Manager at Heineken, where he leads a team of 6 MCT qualified and ACCA part qualified. Before his time at Heineken Mike was a Senior Treasury Analyst for Diageo. 85%"
                );
            } else {
                const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are a professional profile generator. Focus on the person's current role and responsibilities at the company, including their team size, key projects, and areas of expertise. Keep it very concise (2-3 sentences max).",
                            },
                            {
                                role: "user",
                                content: `Generate a current role profile for ${interviewer}`,
                            },
                        ],
                    }),
                });
                const data = await response.json();
                setInterviewerProfile(data.choices[0].message.content);
            }
        } catch (error) {
            console.error("Error fetching interviewer profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const getInterviewsForDate = (date: Date): Interview[] => {
        return interviews.filter((interview) => interview.date === date.toISOString().split("T")[0]);
    };

    const generateCalendarDays = (): { date: number; hasInterviews: boolean; interviews: Interview[] }[] => {
        const days = [];
        const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            currentDate.setDate(i);
            const dateString = currentDate.toISOString().split("T")[0];
            const dayInterviews = interviews.filter((interview) => interview.date === dateString);
            days.push({
                date: i,
                hasInterviews: dayInterviews.length > 0,
                interviews: dayInterviews,
            });
        }
        return days;
    };

    const [selectedInterviewType, setSelectedInterviewType] = React.useState<string>("video");
    const [availability, setAvailability] = React.useState<Record<string, boolean>>({});

    const generateTimeSlots = (): string[] => {
        const slots = [];
        for (let hour = 7; hour <= 21; hour++) {
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    };

    const generateTwoWeekDates = (): Date[] => {
        const dates = [];
        const weekStart = new Date(currentWeekStart);
        for (let i = 0; i < 14; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const toggleAvailability = (date: Date, time: string) => {
        const dateStr = date.toISOString().split("T")[0];
        const timeSlot = `${dateStr}-${time}`;
        setAvailability((prev) => ({ ...prev, [timeSlot]: !prev[timeSlot] }));
    };

    const handleDragStart = (date: Date, time: string) => {
        setIsDragging(true);
        setDragStart({ date, time });
        setDragEnd({ date, time });
        const timeSlot = `${date.toISOString().split("T")[0]}-${time}`;
        setDragValue(!availability[timeSlot]);
    };

    console.log(dragEnd)

    const handleDragMove = (date: Date, time: string) => {
        if (isDragging) {
            setDragEnd({ date, time });
            const slots = getSlotsBetween(dragStart as DragInfo, { date, time });
            setAvailability((prev) => {
                const newAvailability = { ...prev };
                slots.forEach((slot) => {
                    newAvailability[slot] = dragValue;
                });
                return newAvailability;
            });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };

    const getSlotsBetween = (start: DragInfo, end: DragInfo): string[] => {
        const slots: string[] = [];
        const startDate = new Date(start.date);
        const endDate = new Date(end.date);
        const timeSlots = generateTimeSlots();
        const startIndex = timeSlots.indexOf(start.time);
        const endIndex = timeSlots.indexOf(end.time);
        const [earlierDate, laterDate] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
        const [minIndex, maxIndex] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

        const currentDate = new Date(earlierDate);
        while (currentDate <= laterDate) {
            timeSlots.slice(minIndex, maxIndex + 1).forEach((time) => {
                slots.push(`${currentDate.toISOString().split("T")[0]}-${time}`);
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return slots;
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff6b6b] to-[#ff8585]">
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#ff6b6b]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-center items-center h-16 gap-4">
                        <Link href="/" className="text-white flex items-center gap-2">
                            <i className="fas fa-home text-xl"></i>
                            <span>Home</span>
                        </Link>
                        <Link
                            href="/livejobs"
                            className="text-white/80 hover:text-white flex items-center gap-2"
                        >
                            <i className="fas fa-briefcase text-xl"></i>
                            <span>Jobs</span>
                        </Link>
                        <Link
                            href="/messenger"
                            className="text-white/80 hover:text-white flex items-center gap-2"
                        >
                            <i className="fas fa-comments text-xl"></i>
                            <span>Messages</span>
                        </Link>
                        <div className="text-white/30 flex items-center gap-2 cursor-not-allowed">
                            <i className="fas fa-calendar text-xl"></i>
                            <span>Calendar</span>
                        </div>
                        <Link
                            href="/settings"
                            className="text-white/80 hover:text-white flex items-center gap-2"
                        >
                            <i className="fas fa-cog text-xl"></i>
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="pt-24 px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl text-white font-light">
                            Interview Schedule
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#ff8585] rounded-xl p-6 border-2 border-[#ff6b6b]">
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <h2 className="text-xl text-white">
                                    {selectedDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h2>
                                <button
                                    onClick={() => changeMonth(1)}
                                    className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                    (day) => (
                                        <div key={day} className="text-white text-center text-sm">
                                            {day}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {generateCalendarDays().map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const newDate = new Date(selectedDate);
                                            newDate.setDate(day.date);
                                            setSelectedDate(newDate);
                                        }}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-white relative
        ${day.hasInterviews ? "bg-[#ff6b6b]" : "bg-white/10"}
        ${selectedDate.getDate() === day.date ? "ring-2 ring-white" : ""}
      `}
                                    >
                                        {day.date}
                                        {day.hasInterviews && (
                                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-[#ff8585] rounded-xl p-6 border-2 border-[#ff6b6b]">
                            <h2 className="text-xl text-white mb-6">
                                Interviews for{" "}
                                {selectedDate.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </h2>
                            <div className="space-y-4">
                                {getInterviewsForDate(selectedDate).map((interview) => (
                                    <div
                                        key={interview.id}
                                        className="bg-white/10 rounded-xl p-4"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-[#ff6b6b] rounded-xl flex items-center justify-center">
                                                <i className="fas fa-building text-white text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">
                                                    {interview.company}
                                                </h3>
                                                <p className="text-white/80">{interview.role}</p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-white">{interview.time}</p>
                                                <p className="text-white/80">{interview.duration}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-white/80 mb-1">Type</p>
                                                <p className="text-white">{interview.type}</p>
                                            </div>
                                            <div className="relative">
                                                <p className="text-white/80 mb-1">Candidate</p>
                                                <p
                                                    className="text-white cursor-pointer hover:text-[#ff6b6b]"
                                                    onMouseEnter={() => {
                                                        setHoveredInterviewer(interview.interviewer);
                                                        fetchInterviewerProfile(interview.interviewer);
                                                    }}
                                                    onMouseLeave={() => {
                                                        setHoveredInterviewer(null);
                                                        setInterviewerProfile(null);
                                                    }}
                                                >
                                                    {interview.interviewer}
                                                </p>
                                                {hoveredInterviewer === interview.interviewer && (
                                                    <div className="absolute z-50 w-64 bg-[#ff6b6b] p-4 rounded-xl shadow-lg border-2 border-white top-full mt-2 left-0">
                                                        {loadingProfile ? (
                                                            <div className="flex justify-center">
                                                                <i className="fas fa-spinner fa-spin text-white"></i>
                                                            </div>
                                                        ) : (
                                                            <div className="text-white text-sm">
                                                                {interviewerProfile}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Link
                                                href="/camera"
                                                className="flex-1 bg-[#ff6b6b] hover:bg-[#ff8585] px-4 py-2 rounded-xl text-white text-center"
                                            >
                                                Join Meeting
                                            </Link>
                                            <Link
                                                href="/pb-prepbot"
                                                className="flex-1 bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/30 px-4 py-2 rounded-xl text-white text-center"
                                            >
                                                Prepare with AI
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {getInterviewsForDate(selectedDate).length === 0 && (
                                    <div className="text-center text-white/80 py-8">
                                        No interviews scheduled for this date
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-3 bg-[#ff8585] rounded-xl p-6 border-2 border-[#ff6b6b]">
                            <div className="mb-6 flex justify-between items-center">
                                <h2 className="text-xl text-white">Interview Availability</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => changeWeek(-1)}
                                        className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <button
                                        onClick={() => changeWeek(1)}
                                        className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 bg-white/10 p-2 rounded-xl mb-6">
                                {["video", "call", "in-person"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedInterviewType(type)}
                                        className={`flex-1 px-4 py-2 rounded-xl text-white capitalize ${selectedInterviewType === type
                                                ? "bg-[#ff6b6b]"
                                                : "hover:bg-white/10"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="overflow-x-auto">
                                <div className="min-w-[800px]">
                                    <div className="grid grid-cols-[100px_repeat(14,minmax(120px,1fr))]">
                                        <div className="sticky left-0 bg-[#ff8585] z-10">
                                            <div className="h-12"></div>
                                            {generateTimeSlots().map((time) => (
                                                <div
                                                    key={time}
                                                    className="h-10 flex items-center text-white"
                                                >
                                                    {time}
                                                </div>
                                            ))}
                                        </div>

                                        {generateTwoWeekDates().map((date) => (
                                            <div key={date.toISOString()} className="min-w-[120px]">
                                                <div className="h-12 flex flex-col items-center justify-center text-white border-b border-white/10">
                                                    <div>
                                                        {date.toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                        })}
                                                    </div>
                                                    <div>
                                                        {date.toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </div>
                                                </div>
                                                {generateTimeSlots().map((time) => {
                                                    const timeSlot = `${date.toISOString().split("T")[0]
                                                        }-${time}`;
                                                    return (
                                                        <button
                                                            key={timeSlot}
                                                            onClick={() => {
                                                                if (!isDragging) {
                                                                    toggleAvailability(date, time);
                                                                }
                                                            }}
                                                            onMouseDown={() => handleDragStart(date, time)}
                                                            onMouseMove={() => handleDragMove(date, time)}
                                                            onMouseUp={handleDragEnd}
                                                            onMouseLeave={() => {
                                                                if (isDragging) {
                                                                    handleDragMove(date, time);
                                                                }
                                                            }}
                                                            className={`w-full h-10 border border-white/10 ${availability[timeSlot]
                                                                    ? "bg-[#ff6b6b]"
                                                                    : "hover:bg-white/10"
                                                                }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dropdown-animate {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
        </div>
    );
}

export default MainComponent;