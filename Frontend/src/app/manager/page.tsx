"use client";
import { Candidate, Job } from "@/Types/interfaces";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";


function MainComponent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showCandidatesOverlay, setShowCandidatesOverlay] = useState<boolean>(false);
  const [rankedCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("../../json/jobs.json", {
        method: "POST",
        body: JSON.stringify({
          query: "",
          values: [],
        }),
      });
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await fetch("/api/db/newjobspecs", {
        method: "POST",
        body: JSON.stringify({
          query: "DELETE FROM job_specs WHERE id = ?",
          values: [jobId],
        }),
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleSaveJob = async () => {
    if (!editedJob) return;
    try {
      const response = await fetch("/api/db/newjobspecs", {
        method: "POST",
        body: JSON.stringify({
          query: `UPDATE job_specs SET 
            title = ?, 
            company = ?, 
            location = ?, 
            type = ?, 
            salary = ?, 
            status = ?,
            description = ?,
            requirements = ?,
            responsibilities = ?,
            benefits = ?
            WHERE id = ?`,
          values: [
            editedJob.title,
            editedJob.company,
            editedJob.location,
            editedJob.type,
            editedJob.salary,
            editedJob.status,
            editedJob.description,
            JSON.stringify(editedJob.requirements),
            JSON.stringify(editedJob.responsibilities),
            JSON.stringify(editedJob.benefits),
            editedJob.id,
          ],
        }),
      });

      if (response.ok) {
        await fetchJobs();
        setShowOverlay(false);
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  // const handleViewCandidates = async (job: Job) => {
  //   setSelectedJob(job);
  //   setLoadingCandidates(true);
  //   setShowCandidatesOverlay(true);

  //   try {
  //     const candidatesResponse = await fetch("/api/db/treasurycandy", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         query: "SELECT * FROM treasurycandy",
  //         values: [],
  //       }),
  //     });
  //     const candidates: Candidate[] = await candidatesResponse.json();

  //     const rankedResults = candidates.map((candidate) => {
  //       let score = 0;
  //       let matchReason: string[] = [];

  //       if (candidate.location?.toLowerCase().includes(job.location?.toLowerCase())) {
  //         score += 30;
  //         matchReason.push("Location match");
  //       }

  //       const jobSalary = parseInt(job.salary?.replace(/[^0-9]/g, "")) || 0;
  //       const candidateSalary = parseInt(candidate.salary?.replace(/[^0-9]/g, "")) || 0;

  //       if (Math.abs(jobSalary - candidateSalary) < 10000) {
  //         score += 25;
  //         matchReason.push("Salary expectations align");
  //       }

  //       const jobSkills = job.requirements?.join(" ").toLowerCase() || "";
  //       const candidateSkills = candidate.skills?.toLowerCase() || "";

  //       const skillsMatch = candidateSkills.split(",").filter((skill) => jobSkills.includes(skill.trim())).length;

  //       if (skillsMatch > 0) {
  //         score += Math.min(skillsMatch * 15, 45);
  //         matchReason.push(`${skillsMatch} key skills match`);
  //       }

  //       return { ...candidate, match_score: score, match_reason: matchReason.join(", ") };
  //     }).sort((a, b) => b.match_score - a.match_score).slice(0, 3);

  //     setRankedCandidates(rankedResults);
  //   } catch (error) {
  //     console.error("Error fetching candidates:", error);
  //   } finally {
  //     setLoadingCandidates(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b6b] to-[#ff8585]">
      <div className="bg-[#ff6b6b] shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-16 gap-6">
          <Link
            href="/"
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <i className="fas fa-home text-2xl"></i>
            <span className="text-sm mt-1">Home</span>
          </Link>
          <div className="flex flex-col items-center text-white/30 cursor-not-allowed">
            <i className="fas fa-briefcase text-2xl"></i>
            <span className="text-sm mt-1">Jobs</span>
          </div>
          <Link
            href="/messenger"
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <i className="fas fa-comments text-2xl"></i>
            <span className="text-sm mt-1">Messages</span>
          </Link>
          <Link
            href="/schedule"
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <i className="fas fa-calendar text-2xl"></i>
            <span className="text-sm mt-1">Calendar</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <i className="fas fa-cog text-2xl"></i>
            <span className="text-sm mt-1">Settings</span>
          </Link>
        </div>
      </div>
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
                    <Link
                      href="/top-rankedcandidates"
                      className="bg-[#ff858580] hover:bg-[#ff8585] text-white px-6 py-2 rounded-xl transition-all duration-300 text-center w-full"
                    >
                      Top Ranked Candidates
                    </Link>
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
                  value={editedJob.requirements.join("\n")}
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
                  value={editedJob.responsibilities.join("\n")}
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
                  value={editedJob.benefits.join("\n")}
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