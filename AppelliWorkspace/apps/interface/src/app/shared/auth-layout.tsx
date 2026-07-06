import { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="flex min-h-[580px] w-full max-w-6xl overflow-hidden rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        <div className="hidden w-1/2 flex-col justify-center gap-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-14 text-white md:flex">
          <div>
            <h1 className="text-5xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 max-w-sm text-lg text-indigo-100">{subtitle}</p>
          </div>

          <span className="text-sm text-indigo-200">
            Sistema di pianificazione degli appelli
          </span>
        </div>

        <div className="flex w-full items-center justify-center bg-white p-10 md:w-1/2">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
