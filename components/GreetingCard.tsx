import React from 'react';

interface GreetingCardProps {
  isOpen: boolean;
}

// Simple Snowflake SVG Component
const Snowflake: React.FC<{ className?: string, size?: number, opacity?: number }> = ({ className, size = 24, opacity = 0.8 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ opacity }}
  >
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="3"/>
  </svg>
);

const GreetingCard: React.FC<GreetingCardProps> = ({ isOpen }) => {
  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-in-out origin-left ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ 
        transform: isOpen ? 'perspective(2000px) rotateY(-90deg)' : 'perspective(2000px) rotateY(0deg)',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="relative w-full h-full bg-[#165B47] flex flex-col items-center justify-between overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* --- Background Snowflakes --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <Snowflake className="absolute top-10 left-10 text-white/20 animate-pulse" size={32} />
            <Snowflake className="absolute top-24 left-1/4 text-white/10" size={20} />
            <Snowflake className="absolute top-16 right-12 text-white/20 animate-pulse" size={28} />
            <Snowflake className="absolute top-32 right-1/3 text-white/10" size={16} />
            <Snowflake className="absolute top-48 left-16 text-white/15" size={24} />
            <Snowflake className="absolute top-8 left-1/2 text-white/10" size={12} />
            <Snowflake className="absolute top-[30%] right-8 text-white/15" size={20} />
            <Snowflake className="absolute top-[25%] left-[10%] text-white/10" size={14} />
        </div>

        {/* --- Top Decorations (Hanging Ornaments) --- */}
        <div className="absolute top-0 w-full h-32 flex justify-around items-start z-10 opacity-90">
           {/* Ornament 1 */}
           <div className="flex flex-col items-center h-24 animate-swing origin-top" style={{ animationDelay: '0s' }}>
              <div className="w-[2px] h-4 bg-yellow-200/50"></div>
              <div className="w-12 h-12 bg-red-600 rounded-full border-4 border-yellow-400 shadow-lg flex items-center justify-center">
              </div>
           </div>
           {/* Ornament 2 */}
           <div className="flex flex-col items-center h-32 animate-swing origin-top" style={{ animationDelay: '0.5s' }}>
              <div className="w-[2px] h-8 bg-yellow-200/50"></div>
              <div className="w-16 h-16 bg-yellow-500 rounded-full border-4 border-orange-300 shadow-lg flex items-center justify-center">
              </div>
           </div>
           {/* Ornament 3 */}
           <div className="flex flex-col items-center h-20 animate-swing origin-top" style={{ animationDelay: '1.2s' }}>
              <div className="w-[2px] h-3 bg-yellow-200/50"></div>
              <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
           </div>
        </div>

        {/* --- Center Typography --- */}
        <div className="flex-1 flex flex-col items-center justify-start z-20 pt-20">
           <h1 className="text-5xl md:text-7xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] text-center whitespace-nowrap" style={{ fontFamily: '"Great Vibes", cursive' }}>
             Merry Christmas
           </h1>
           
           {/* AND Line */}
           <div className="flex items-center gap-4 w-48 md:w-64 my-2 opacity-90">
             <div className="h-[1px] bg-white flex-1"></div>
             <span className="text-white text-xs md:text-sm tracking-widest font-sans">AND</span>
             <div className="h-[1px] bg-white flex-1"></div>
           </div>

           {/* HAPPY NEW YEAR */}
           <h2 className="text-white text-lg md:text-2xl font-light tracking-[0.3em] font-sans drop-shadow-sm text-center">
             HAPPY NEW YEAR
           </h2>
        </div>

        {/* --- Bottom Illustration (The Pink House) --- */}
        <div className="relative w-full h-[40vh] flex justify-center items-end">
          
          {/* House Structure */}
          <div className="relative w-[90%] md:w-[600px] h-[300px] bg-[#F7E7E6] rounded-t-lg shadow-2xl flex justify-center items-end z-10">
            
             {/* Roof (Snowy) */}
             <div className="absolute -top-12 w-[110%] h-20 bg-white rounded-full shadow-md z-20"></div>
             <div className="absolute -top-8 w-[105%] h-16 bg-[#E94E46] rounded-t-3xl z-10"></div>

             {/* Windows Container */}
             <div className="w-full flex justify-around items-end pb-8 px-8">
                
                {/* Left Window (Gifts) */}
                <div className="w-24 h-32 bg-[#1A2E25] rounded-t-full border-4 border-white relative overflow-hidden group">
                  <div className="absolute bottom-0 left-2 w-8 h-12 bg-red-600 rotate-12"></div>
                  <div className="absolute bottom-0 right-4 w-10 h-8 bg-yellow-400"></div>
                </div>

                {/* Center Window (Santa) */}
                <div className="w-28 h-40 bg-[#1A2E25] rounded-t-full border-4 border-white relative overflow-hidden flex justify-center items-end">
                   {/* Santa Body */}
                   <div className="w-20 h-16 bg-red-600 rounded-t-xl z-10"></div>
                   {/* Santa Beard */}
                   <div className="absolute bottom-2 w-16 h-14 bg-white rounded-full z-20"></div>
                   {/* Santa Face */}
                   <div className="absolute bottom-12 w-10 h-8 bg-[#ffccbb] rounded-full z-10"></div>
                   {/* Hat */}
                   <div className="absolute bottom-16 w-12 h-10 bg-red-600 rounded-t-full z-20"></div>
                   <div className="absolute bottom-24 w-4 h-4 bg-white rounded-full z-30 animate-bounce"></div>
                </div>

                {/* Right Window (Gifts) */}
                <div className="w-24 h-32 bg-[#1A2E25] rounded-t-full border-4 border-white relative overflow-hidden">
                   <div className="absolute bottom-0 left-4 w-12 h-10 bg-blue-500"></div>
                   <div className="absolute top-8 right-4 w-1 h-20 bg-white/20"></div> {/* Window shine */}
                </div>
             </div>
             
             {/* SWIPE INSTRUCTION (Wall Sign) */}
             <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30">
                <div className="text-[#1A2E25] font-serif font-bold tracking-[0.2em] text-lg uppercase border-b-2 border-[#1A2E25] pb-1 whitespace-nowrap opacity-90 drop-shadow-sm">
                  Swipe to Open
                </div>
             </div>
          </div>
          
          {/* Chimney */}
          <div className="absolute bottom-[250px] right-[10%] md:right-[25%] w-20 h-32 bg-[#E94E46] z-0 flex flex-col items-center">
             <div className="w-24 h-6 bg-white rounded-full absolute -top-3"></div>
          </div>

        </div>

        {/* Decoration Overlay (Texture) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>
    </div>
  );
};

export default GreetingCard;