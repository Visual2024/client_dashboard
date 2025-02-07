export function Elements_Card({ Icon, title, description }: {
    Icon: React.ElementType;
    title: string;
    description: string;
  }) {
    return (
      <div className="bg-[#ff9999]/30 backdrop-blur-sm rounded-2xl p-6 text-white group hover:bg-[#ff9999]/40 transition-all cursor-pointer">
        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-white/80">{description}</p>
        <div className="flex justify-end mt-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-white/60 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
  );
}