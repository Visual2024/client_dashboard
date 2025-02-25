"use client";
import { Header } from "@/Components/Layout/Header";
import { useAuthContext } from "@/Context/AuthContext";
import { Candidate, Job } from "@/Types/interfaces";
import Link from "next/link";
import { useEffect, useState } from "react";

function MainComponent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showCandidatesOverlay, setShowCandidatesOverlay] = useState<boolean>(false);
  const [rankedCandidates, setRankedCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());
  const { handleDeleteJob } = useAuthContext();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulación de carga de datos
    const mockJobs: Job[] = [
      {
        id: 1,
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        type: "Full-time",
        salary: "$100,000",
        status: "Open",
        description: "Develop and maintain software applications.",
        requirements: JSON.parse('["JavaScript", "React", "Node.js"]') as string[],
        responsibilities: ["Write code", "Review PRs"],
        benefits: ["Health insurance", "401(k)"],
        posted_date: "2023-10-01",
      },
      {
        id: 2,
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        type: "Full-time",
        salary: "$100,000",
        status: "Open",
        description: "Develop and maintain software applications.",
        requirements: JSON.parse('["JavaScript", "React", "Node.js"]') as string[],
        responsibilities: ["Write code", "Review PRs"],
        benefits: ["Health insurance", "401(k)"],
        posted_date: "2023-10-01",
      },
    ];
    setJobs(mockJobs);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteConfirm && !(event.target as HTMLElement).closest(".delete-confirm-area")) {
        setShowDeleteConfirm(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteConfirm]);

  useEffect(() => {
    const handleClickOutsideOverlay = (event: MouseEvent) => {
      if (showCandidatesOverlay && !(event.target as HTMLElement).closest(".candidates-overlay")) {
        setShowCandidatesOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideOverlay);
    return () => document.removeEventListener("mousedown", handleClickOutsideOverlay);
  }, [showCandidatesOverlay]);

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditedJob({
      ...job,
      requirements: JSON.parse(job.requirements as unknown as string || "[]"),
      responsibilities: JSON.parse(job.responsibilities as unknown as string || "[]"),
      benefits: JSON.parse(job.benefits as unknown as string || "[]"),
    });
    setShowOverlay(true);
  };

  const handleSaveJob = async () => {
    if (!editedJob) return;
    try {
      // Simulación de guardado de datos
      const updatedJobs = jobs.map(job => job.id === editedJob.id ? editedJob : job);
      setJobs(updatedJobs);
      setShowOverlay(false);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleViewCandidates = async (job: Job) => {
    setSelectedJob(job);
    setLoadingCandidates(true);
    setShowCandidatesOverlay(true);

    // Simulación de carga de candidatos
    const mockCandidates: Candidate[] = [
      {
        id: 1,
        name: "John Doe",
        title: "Software Engineer",
        location: "Remote",
        salary: "$95,000",
        skills: "JavaScript, React, Node.js",
        match_score: 85,
        match_reason: "Location match, Salary expectations align, 3 key skills match",
      },
      // Agrega más candidatos aquí
    ];

    const rankedResults = mockCandidates
      .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
      .slice(0, 3);

    setRankedCandidates(rankedResults);
    setLoadingCandidates(false);
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b6b] to-[#ff8585]">
      <Header />
      <div className="px-8 pb-8 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl text-white font-light">Jobs Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const postedDate = new Date(job.posted_date);
              const hoursElapsed = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
              const showNewBadge = hoursElapsed <= 48;
              const daysLeft = Math.max(
                15 - Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24)),
                0
              );

              return (
                <div
                  key={job.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative hover:shadow-2xl transition-all duration-300 group min-h-[400px]"
                >
                  <div className="absolute -top-3 -left-3 flex items-center gap-2 delete-confirm-area">
                    <button
                      onClick={() => setShowDeleteConfirm(job.id)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all duration-300 hover:bg-[#ff8585] group shadow-lg"
                    >
                      <i className="fas fa-times text-[#ff6b6b] group-hover:text-white"></i>
                    </button>
                    {showDeleteConfirm === job.id && (
                      <div className="bg-white px-3 py-1 rounded-xl shadow-lg z-10">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-[#ff6b6b] hover:text-[#ff8585] text-sm whitespace-nowrap"
                        >
                          Confirm Delete?
                        </button>
                      </div>
                    )}
                  </div>
                  {showNewBadge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FF7F6B] to-[#ff8585] text-white px-3 py-1 rounded-lg text-sm shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                      New Job
                    </div>
                  )}
                  <h2 className="text-2xl text-white font-light mb-4 pr-24">
                    {job.title}
                  </h2>
                  <div className="space-y-2 mb-24">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Status:</span>
                      <span className="text-[#22c55e]">{job.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Posted:</span>
                      <span className="text-white">
                        {new Date(job.posted_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        {daysLeft > 0 && ` (closes in ${daysLeft} days)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Location:</span>
                      <span className="text-white">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Salary:</span>
                      <span className="text-white">{job.salary}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 left-6 flex flex-col gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="bg-[#ff858580] hover:bg-[#ff8585] text-white px-6 py-2 rounded-xl transition-all duration-300 w-full"
                    >
                      View / Edit
                    </button>
                    <button
                      onClick={() => handleViewCandidates(job)}
                      className="bg-[#ff858580] hover:bg-[#ff8585] text-white px-6 py-2 rounded-xl transition-all duration-300 text-center w-full"
                    >
                      Top Ranked Candidates
                    </button>
                    <Link
                      href="/shortlist"
                      className="bg-[#22c55e] hover:bg-[#22c55e]/80 text-white px-6 py-2 rounded-xl transition-all duration-300 text-center w-full"
                    >
                      <i className="fas fa-star mr-2"></i>
                      Shortlist
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showOverlay && editedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#ff6b6b] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl text-white">Edit Job Specification</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowOverlay(false)}
                  className="bg-[#ff858580] hover:bg-[#ff8585] px-12 py-3 rounded-full text-white text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJob}
                  className="bg-[#90C290] hover:bg-[#80B380] px-12 py-3 rounded-full text-white text-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={editedJob.title}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, title: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="title"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Company</label>
                  <input
                    type="text"
                    value={editedJob.company}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, company: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="company"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={editedJob.location}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, location: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="location"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Type</label>
                  <input
                    type="text"
                    value={editedJob.type}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, type: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="type"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Salary</label>
                  <input
                    type="text"
                    value={editedJob.salary}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, salary: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="salary"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Status</label>
                  <input
                    type="text"
                    value={editedJob.status}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, status: e.target.value })
                    }
                    className="w-full bg-white/10 px-4 py-2 rounded-xl text-white"
                    name="status"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={editedJob.description}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, description: e.target.value })
                  }
                  className="w-full h-32 bg-white/10 px-4 py-2 rounded-xl text-white resize-none"
                  name="description"
                />
              </div>
              <div>
                <label className="block text-white mb-2">
                  Requirements (one per line)
                </label>
                <textarea
                  value={(editedJob.requirements as string[]).join("\n")}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      requirements: e.target.value.split("\n"),
                    })
                  }
                  className="w-full h-32 bg-white/10 px-4 py-2 rounded-xl text-white resize-none"
                  name="requirements"
                />
              </div>
              <div>
                <label className="block text-white mb-2">
                  Responsibilities (one per line)
                </label>
                <textarea
                  value={(editedJob.responsibilities as string[]).join("\n")}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      responsibilities: e.target.value.split("\n"),
                    })
                  }
                  className="w-full h-32 bg-white/10 px-4 py-2 rounded-xl text-white resize-none"
                  name="responsibilities"
                />
              </div>
              <div>
                <label className="block text-white mb-2">
                  Benefits (one per line)
                </label>
                <textarea
                  value={(editedJob.benefits as string[]).join("\n")}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      benefits: e.target.value.split("\n"),
                    })
                  }
                  className="w-full h-32 bg-white/10 px-4 py-2 rounded-xl text-white resize-none"
                  name="benefits"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showCandidatesOverlay && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#ff6b6b] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto candidates-overlay">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl text-white">Top Ranked Candidates</h2>
              <button
                onClick={() => setShowCandidatesOverlay(false)}
                className="bg-[#ff858580] hover:bg-[#ff8585] px-6 py-2 rounded-xl text-white"
              >
                Close
              </button>
            </div>

            {loadingCandidates ? (
              <div className="flex justify-center items-center h-64">
                <i className="fas fa-spinner fa-spin text-white text-3xl"></i>
              </div>
            ) : (
              <div className="space-y-6">
                {rankedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="bg-white/10 rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FF7F6B] to-[#ff8585] flex items-center justify-center text-white text-xl">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl text-white">{candidate.name}</h3>
                        <p className="text-white/80">{candidate.title}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-[#22c55e] px-3 py-1 rounded-lg text-white">
                          {candidate.match_score}% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 mb-4">
                      {candidate.match_reason}
                    </p>
                    <div className="flex gap-4">
                      <Link
                        href="/messenger"
                        className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white text-center"
                      >
                        <i className="fas fa-comments mr-2"></i>
                        Contact
                      </Link>
                      <Link
                        href="/camera"
                        className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white text-center"
                      >
                        <i className="fas fa-video mr-2"></i>
                        Interview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;