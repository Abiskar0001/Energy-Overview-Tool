import Header from './components/Header'
import LeftComponent from './components/LeftComponent'
import './App.css'
import ParentComponent from './components/ParentComponent'

function App() {

  return (
    <>
    <Header />
    <div className="flex h-screen">
    <LeftComponent />
    </div>
    </>
  )
}

export default App
