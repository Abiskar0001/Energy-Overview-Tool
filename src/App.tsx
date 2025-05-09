import Header from './components/Header'
import './App.css'
import ParentComponent from './components/ParentComponent.tsx'

function App() {

  return (
    <>
    <Header />
    <div className="flex h-screen">
    <ParentComponent />
    </div>
    </>
  )
}

export default App
