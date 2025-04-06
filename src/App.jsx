import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Loans from './pages/Loans'
import Transactions from './pages/Transactions'
import Customers from './pages/Customers'
import Users from './pages/Users'
import Employees from './pages/Employees'
import ProfilePage from './pages/ProfilePage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import CreatePassword from './pages/auth/CreatePassword'
import Logout from './pages/auth/Logout'
import { useAuth } from './hooks/useAuth'

// Not found page component
const NotFound = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">404 - Page Not Found</h1></div>

// Layout for pages that require auth with navbar and footer
const AuthenticatedLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes - No Navbar/Footer */}
        <Route path="/auth/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/create-password" element={!isAuthenticated ? <CreatePassword /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/logout" element={<Logout />} />
        
        {/* Authenticated routes with Navbar/Footer */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/auth/login" />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        <Route 
          path="/loans" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Loans />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        <Route 
          path="/transactions" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Transactions />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        <Route 
          path="/customers" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Customers />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        <Route 
          path="/users" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Users />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        <Route 
          path="/employees" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Employees />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        {/* Profile routes */}
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/auth/login" />
            )
          } 
        />
        
        {/* Not found route */}
        <Route 
          path="*" 
          element={
            <AuthenticatedLayout>
              <NotFound />
            </AuthenticatedLayout>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
