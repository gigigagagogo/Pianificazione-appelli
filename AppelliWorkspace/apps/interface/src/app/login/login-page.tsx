import { useState, SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../shared/auth-layout';
import { inputClass, labelClass } from '../shared/form-styles';
import { ApiError, loginUser } from '../shared/api';
import { EyeIcon, EyeOffIcon } from '../shared/icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const { token, role, name, surname } = await loginUser({ email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('surname', surname);
      navigate(role === 'segreteria' ? '/segreteria' : '/appelli');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bentornato"
      subtitle="Accedi per gestire i tuoi appelli d'esame."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Accedi</h1>
          <p className="mt-2 text-sm text-gray-500">
            Inserisci le tue credenziali per continuare.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className={labelClass}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className={`${inputClass} pr-10`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Accesso in corso...' : 'Accedi'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Non hai un account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Registrati
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;