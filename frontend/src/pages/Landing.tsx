import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          <span className="font-bold text-xl text-gray-900">CarMatch</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">AI</span>
        </div>
        <div className="text-sm text-gray-500">Powered by GPT-4o + LangGraph</div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            AI-Powered Car Recommendations
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Find the perfect car
            <br />
            <span className="text-blue-600">in 2 minutes.</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Answer 4 quick questions. Our AI agent analyzes{' '}
            <strong className="text-gray-700">40+ cars</strong> and gives you a personalized
            shortlist with detailed reasoning — not just specs.
          </p>
        </div>

        <button
          onClick={() => navigate('/wizard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Find My Car →
        </button>

        <p className="mt-4 text-sm text-gray-400">Free · No signup · 2 min</p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 w-full max-w-2xl">
          {[
            { icon: '🧠', title: 'Agentic AI', desc: 'LangGraph pipeline filters, scores, then reasons' },
            { icon: '🎯', title: 'Personalized', desc: 'Matches your use case, budget, and priorities' },
            { icon: '👁️', title: 'Transparent', desc: 'See every AI reasoning step in real-time' },
          ].map((f) => (
            <div key={f.title} className="text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
