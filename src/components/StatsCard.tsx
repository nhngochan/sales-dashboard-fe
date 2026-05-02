interface StatsCardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

export default function StatsCard({ title, value, loading = false }: StatsCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl px-5 py-4 flex flex-col items-center justify-center text-center shadow-sm border border-gray-800">
      {loading ? (
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-10 w-28 bg-gray-700/50 rounded-md" />
          <div className="h-3 w-20 bg-gray-700/30 rounded-md" />
        </div>
      ) : (
        <>
          <span className="text-cyan-400 text-[36px] font-extrabold leading-none tracking-tight">
            {value}
          </span>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5">
            {title}
          </span>
        </>
      )}
    </div>
  );
}
