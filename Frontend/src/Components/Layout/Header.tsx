import { NavIcon } from '@/Icons/NavIcon';
import { Briefcase, Users, MessageCircle, Calendar, Settings, Home } from 'lucide-react';

export function Header() {
    return (
        <nav className="bg-[#ff7f7f] p-4 flex justify-center gap-8 border-b border-white/20">
            <NavIcon Icon={Home}  />
            <NavIcon Icon={Briefcase}  />
            <NavIcon Icon={Users}  />
            <NavIcon Icon={MessageCircle}  />
            <NavIcon Icon={Calendar}  />
            <NavIcon Icon={Settings}  />
        </nav>
    )
}