export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* We will replace this with your actual logo later */}
          <div className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white font-bold">
            HO
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Happy Oak Estimates
          </h1>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          ERP System
        </div>
      </div>
    </header>
  );
}