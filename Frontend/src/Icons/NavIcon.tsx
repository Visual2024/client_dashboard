

export function NavIcon({ Icon }: { Icon: React.ElementType }) {
    return (
      <div className="p-2 text-white/90 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
        <Icon size={24} />
      </div>
    );
  }