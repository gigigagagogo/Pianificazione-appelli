import { ReactNode } from 'react';
import { LogoutIcon } from './icons';

export interface SidebarNavItem {
  key: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface SidebarLayoutProps {
  title: string;
  navItems: SidebarNavItem[];
  onLogout: () => void;
  children: ReactNode;
}

export const SidebarLayout = ({ title, navItems, onLogout, children }: SidebarLayoutProps) => (
  <div className="flex min-h-screen bg-gray-50">
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <span className="text-lg font-semibold tracking-wide text-indigo-600">{title}</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              item.active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogoutIcon size={16} />
          Esci
        </button>
      </div>
    </aside>

    <main className="flex-1 px-8 py-8">{children}</main>
  </div>
);

export default SidebarLayout;
