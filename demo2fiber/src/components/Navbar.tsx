import React from 'react';

interface NavbarProps {
  primaryButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ primaryButton = true }) => {
  const navItems = ['Dashboard', 'Orders', 'Products', 'Customers', 'Settings'];
  const activeItem = 'Dashboard';

  return (
    <div className="relative w-full h-16 bg-white border-b border-neutral-200 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-row items-center h-full px-6">
        <div className="flex flex-row items-center justify-between w-full max-w-[1280px] mx-auto">
          {/* Logo */}
          <div className="h-10 w-[76px] relative flex items-center">
            <span className="text-xl font-bold text-neutral-900">Acraft</span>
          </div>

          {/* Navigation and Actions */}
          <div className="flex flex-row items-center gap-4">
            {/* Navigation */}
            <nav className="flex flex-row gap-1">
              {navItems.map((item) => (
                <button
                  key={item}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item === activeItem
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* Primary Button */}
            {primaryButton && (
              <button className="flex flex-row items-center gap-2 px-4 py-2 h-9 bg-neutral-900 text-neutral-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-neutral-800 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.5V14.5M14.5 8H1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">Upgrade</span>
              </button>
            )}

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;