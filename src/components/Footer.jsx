import { useAuth } from '../hooks/useAuth';
import { roles } from '../constants/roles';

const Footer = () => {
  const { currentUser } = useAuth();
  const isCustomer = currentUser?.role === roles.customer;

  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-start">
          <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              About
            </h3>
            <p className="text-base text-gray-500">
              Creditor has been established in 2003 and currently operates with twenty different branches. We provide loans ranging from $5 to $2000 as a micro-lending business, helping people in rural areas access financial services more easily. Our mission is to make financial services more accessible and digitalize the micro-lending business in Ulaanbaatar, Mongolia.
            </p>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/dashboard" className="text-base text-gray-500 hover:text-gray-900">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/loans" className="text-base text-gray-500 hover:text-gray-900">
                  Loans
                </a>
              </li>
              <li>
                <a href="/transactions" className="text-base text-gray-500 hover:text-gray-900">
                  Transactions
                </a>
              </li>
              {!isCustomer && (
                <>
                  <li>
                    <a href="/customers" className="text-base text-gray-500 hover:text-gray-900">
                      Customers
                    </a>
                  </li>
                  <li>
                    <a href="/employees" className="text-base text-gray-500 hover:text-gray-900">
                      Employees
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="text-base text-gray-500">
                Email: tseka.nice@gmail.com
              </li>
              <li className="text-base text-gray-500">
                Phone: +31 615957803
              </li>
              <li className="text-base text-gray-500">
                Address: Binnenhof 1A, 2513 AA The Hague, Netherlands
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Creditor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 