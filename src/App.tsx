import Header from './components/Header'
import './App.css'
import ParentComponent from './components/ParentComponent.tsx'

function App() {

  return (
    <>
    <div className="mx-auto h-screen w-screen">
    <Header />
    <ParentComponent />
    </div>
    </>
  )
}

export default App
