export default function LoadingScreen({
  message = "Loading..."
}) {

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center animate-pulse shadow-lg" style={{ background: '#2F5DFF' }}>
              <img src="/logo.png" alt="logo" className="rounded-full w-9 h-9" />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1E1E1E' }}>PrepWise</span>
          </div>
          <p style={{ color: '#1E1E1E', opacity: 0.7 }}>Preparing your personalized experience</p>
        </div>

        <div className="mb-8">
          <div className="relative w-10 h-10 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>

            <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#2F5DFF' }}></div>

            <div className="absolute inset-6 rounded-full animate-pulse" style={{ background: '#2F5DFF' }}></div>
          </div>

          <p className="text-lg font-medium mb-2" style={{ color: '#1E1E1E' }}>{message}</p>
        </div>
      </div>
    </div>
  )
}
