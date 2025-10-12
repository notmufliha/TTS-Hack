// app/dashboard/components/DashboardHeader.tsx
export default function DashboardHeader() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Referral System Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              TTS Hospital - Manage and track patient referrals
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Dr. Smith</p>
              <p className="text-sm text-gray-500">Cardiology Department</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">DS</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}