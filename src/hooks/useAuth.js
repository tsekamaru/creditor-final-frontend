import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

// Custom hook for easier access to the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth 