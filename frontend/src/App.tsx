import { Sparkles } from 'lucide-react'

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-primary-500 to-accent-500">
      <div className="text-center space-y-4">
        <Sparkles className="w-16 h-16 text-white mx-auto" />
        <h1 className="text-5xl font-bold text-white">Frontend Test</h1>
      </div>
    </div>
  )
}

export default App
