import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md border-b-4 border-brand-brown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-6 hover:opacity-90 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="Happy Oak Logo" 
            width={180}
            height={180}
            className="object-contain"
            priority
          />
          {/* --- The Restored Title --- */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-brown tracking-tight">
            Generate Estimates
          </h1>
        </Link>

        {/* Hidden on very small mobile screens to save space, visible on tablets/desktops */}
        <div className="hidden sm:block text-sm text-brand-brown font-bold px-4 py-2 bg-brand-canvas rounded-full border border-gray-200 shadow-inner">
          
        </div>
        
      </div>
    </header>
  );
}