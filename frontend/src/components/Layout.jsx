import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl">
        <div className="text-center">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout