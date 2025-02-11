//* Interfaces to create a new job
export interface JobSpec {
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    summary: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
    customFields: { label: string; value: string; }[];
    miscellaneous: string[];
    [key: string]: unknown;
};

export interface Message {
    role: "user" | "assistant";
    content: string;
}

// * Manager

export interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    status: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    posted_date: Date;
}

export interface Candidate {
    id: number;
    name: string;
    location: string;
    salary: string;
    skills: string;
    match_score?: number;
    match_reason?: string;
    title: string;
}

// * Calendar 

export interface Interview {
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

export interface DragInfo {
    date: Date;
    time: string;
}

// AuthContext

export interface AuthTokens {
    token: string;
    email: string;
    iat: number;
    exp: number;
    authorities: string[];
}

export interface tokenData {
    fullName: string;
    sub: string;
    iat: number;
    exp: number;
    authorities: string[];
}

export interface AuthContextProps {
    login: (email: string, password: string) => void;
    logout: () => void;
    isLoggedIn: boolean;
    authTokens: AuthTokens | null;
    register: (email: string, password: string, name: string, lastname: string) => void;
    fetchJobs: VoidFunction;
    handleDeleteJob: (jobId: number) => Promise<void>;
}

export interface AuthenticationRequest {
    email: string;
    password: string;
}
