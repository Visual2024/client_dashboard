

export function NavIcon({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="p-2 fill-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
      <Icon size={24} color="#fff" strokeWidth="2.4" />
    </div>
  );
}