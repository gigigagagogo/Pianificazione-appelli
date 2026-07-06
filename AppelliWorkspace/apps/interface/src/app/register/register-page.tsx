import { useState, SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../shared/auth-layout';
import { inputClass, labelClass } from '../shared/form-styles';
import { ApiError, registerUser, Role } from '../shared/api';
import { EyeIcon, EyeOffIcon } from '../shared/icons';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = () => setShowPassword((prev) => !prev);


  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!role) {
      setError('Seleziona un ruolo');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ name, surname, email, password, role });
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Benvenuto"
      subtitle="Crea un account per iniziare a pianificare i tuoi appelli d'esame."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Registrati</h1>
          <p className="mt-2 text-sm text-gray-500">
            Crea un account per iniziare.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className={labelClass}>Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="surname" className={labelClass}>Cognome</label>
          <input
            type="text"
            id="surname"
            name="surname"
            className={inputClass}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>

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
              onClick={handleToggle}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={labelClass}>Ruolo</span>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                id="role-docente"
                name="role"
                checked={role === 'docente'}
                onChange={() => setRole(role === 'docente' ? null : 'docente')}
              />
              Docente
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                id="role-segreteria"
                name="role"
                checked={role === 'segreteria'}
                onChange={() => setRole(role === 'segreteria' ? null : 'segreteria')}
              />
              Segreteria
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Registrazione in corso...' : 'Registrati'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Hai già un account?{' '}
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            Accedi
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
