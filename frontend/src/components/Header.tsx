import { HealthCheck } from "./HealthCheck";

export function Header() {

  return (
    <>
      <header className="p-6 mb-3 relative" style={{ border: 'none' }}>
        <div className="relative flex items-center justify-between">
          {/* Left side - empty for balance */}
          <div className="w-48"></div>
          
          {/* Center - Title and Author on same line */}
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold tracking-wide" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg font-bold text-[32px] font-[Rubik_Dirt]">RAG检索系统</span> 
              <span className="text-lg text-muted-foreground/80 tracking-wider font-light" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>by </span>
              <span className="text-lg text-gradient-gold font-semibold tracking-wider" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>Ray3417</span>
            </h1>
          </div>

          {/* Right side - Tutorial button and health check */}
          <div className="w-48 flex justify-end items-center gap-3">
            <HealthCheck />
            
          </div>
        </div>
      </header>

    </>
  );
}