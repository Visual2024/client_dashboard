import { Calendar, ListOrdered, MessageCircle, PlusCircle } from "lucide-react";
import { Elements_Card } from "./Element_Cards";


export function Cards() {
    return (
        <main className="flex-1 container mx-auto px-4 py-8">
            <h1 className="text-white text-4xl font-light text-center mb-12">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Elements_Card
                    Icon={PlusCircle}
                    title="Post a Job"
                    description="Create a new job posting"
                    link="/jobs"
                />
                <Elements_Card
                    Icon={ListOrdered}
                    title="Manage Jobs"
                    description="View and manage your job postings"
                    link="/manager"
                />
                <Elements_Card
                    Icon={Calendar}
                    title="Interview Schedule"
                    description="Manage your upcoming interviews and schedule"
                    link="/calendar"
                />
                <Elements_Card
                    Icon={MessageCircle}
                    title="Messages"
                    description="Communicate with candidates by chat, audio or video"
                    link=""
                />
            </div>
        </main>
    )
}