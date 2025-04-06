import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'

const DevRoleSwitcher = () => {
  const { switchRole, currentUser } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-50">
      <div className="font-bold mb-2">Development Role Switcher</div>
      <div className="space-y-2">
        <button
          className={`block w-full py-1 px-3 rounded ${
            currentUser?.role === roles.admin ? 'bg-primary-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => switchRole(roles.admin)}
        >
          Admin
        </button>
        <button
          className={`block w-full py-1 px-3 rounded ${
            currentUser?.role === roles.employee ? 'bg-primary-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => switchRole(roles.employee)}
        >
          Employee
        </button>
        <button
          className={`block w-full py-1 px-3 rounded ${
            currentUser?.role === roles.customer ? 'bg-primary-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => switchRole(roles.customer)}
        >
          Customer
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-400">Current role: {currentUser?.role}</div>
    </div>
  )
}

export default DevRoleSwitcher 