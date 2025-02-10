import { NavIcon } from '@/Icons/NavIcon';
import { Briefcase, Users, MessageCircle, Calendar, Settings, Home } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    const navItems: NavItem[] = [
        { Icon: Home, link: '/' },
        { Icon: Briefcase, link: '/manager' },
        { Icon: Users, link: '/' },
        { Icon: MessageCircle, link: '/messages' },
        { Icon: Calendar, link: '/calendar' },
        { Icon: Settings, link: '/settings' },
    ];

    interface NavItem {
        Icon: React.ComponentType;
        link: string;
    }

    return (
        <nav className="bg-[#ff7f7f] p-4 flex justify-center gap-8 border-b border-white/20">
            {navItems.map((item, index) => (
                <Link href={item.link} key={index}>
                    <NavIcon key={index} Icon={item.Icon} />
                </Link>
            ))}
        </nav>
    );
}