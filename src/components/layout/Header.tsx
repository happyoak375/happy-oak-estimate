import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b-4 border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Next.js optimized Image component */}
          <div className="relative w-14 h-14">
            <Image 
              src="/logo.png" 
              alt="Happy Oak Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Happy Oak
            </h1>
            <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
              Estimate Generator
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">
          ERP System
        </div>
      </div>
    </header>
  );
}