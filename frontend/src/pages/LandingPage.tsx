import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-12 max-w-lg w-full p-8 text-center animate-in fade-in zoom-in duration-700">
        <img 
          src="/logo.png" 
          alt="DR Insight Logo" 
          className="w-48 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />
        
        <div className="flex flex-col gap-6 w-full">
          <button
            onClick={() => navigate('/overview')}
            className="w-full relative group overflow-hidden rounded-full p-[1px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-green-500 to-red-600 rounded-full opacity-70 group-hover:opacity-100 blur transition-opacity duration-300"></span>
            <div className="relative bg-slate-950 rounded-full px-8 py-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-opacity-80">
              <span className="text-xl font-medium tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-white transition-colors">
                Start comparing <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
