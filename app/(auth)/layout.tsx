export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060606] px-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E8FF6B] opacity-[0.025] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#4D9EFF] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
