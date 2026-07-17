import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ApiError,
  Appello,
  ExamSession,
  deleteAppello,
  getAllAppelli,
  getMyAppelli,
  getSessions,
} from '../shared/api';
import SidebarLayout from '../shared/sidebar-layout';

type View = 'mine' | 'all';
type SortField = 'date' | 'corso' | 'anno' | 'sessione' | 'docente';
type SortDirection = 'asc' | 'desc';

const sortValue = (appello: Appello, field: SortField): string => {
  switch (field) {
    case 'date':
      return appello.date;
    case 'corso':
      return appello.courseYear.course?.name ?? '';
    case 'anno':
      return appello.courseYear.label;
    case 'sessione':
      return appello.examSession.name;
    case 'docente':
      return appello.docente ? `${appello.docente.name} ${appello.docente.surname}` : '';
  }
};

const SortableHeader = ({
  field,
  label,
  sortField,
  sortDirection,
  onToggle,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggle: (field: SortField) => void;
}) => (
  <th className="px-2 py-1">
    <button
      type="button"
      onClick={() => onToggle(field)}
      className="flex w-full select-none items-center gap-1 rounded px-4 py-2 text-left hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      {label}
      {sortField === field ? (
        <span className="text-indigo-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <span className="flex items-center gap-0.5 text-gray-300">
          <span>↑</span>
          <span>↓</span>
        </span>
      )}
    </button>
  </th>
);

const TableAppelli = ({
  appelli,
  view,
  onDelete,
}: {
  appelli: Appello[];
  view: View;
  onDelete: (id: number) => void;
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...appelli];
    copy.sort((a, b) => {
      const cmp = sortValue(a, sortField).localeCompare(sortValue(b, sortField));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [appelli, sortField, sortDirection]);

  if (appelli.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <span className="text-3xl">🗓️</span>
        <p className="text-sm font-medium text-gray-700">
          {view === 'mine'
            ? 'Non hai ancora inserito nessun appello.'
            : 'Non risulta ancora nessun appello inserito.'}
        </p>
        <p className="text-sm text-gray-500">Quando ne aggiungerai uno, lo vedrai qui.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <SortableHeader
              field="date"
              label="Data"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            <SortableHeader
              field="corso"
              label="Corso di laurea"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            <SortableHeader
              field="anno"
              label="Anno"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            <SortableHeader
              field="sessione"
              label="Sessione"
              sortField={sortField}
              sortDirection={sortDirection}
              onToggle={toggleSort}
            />
            {view === 'all' && (
              <SortableHeader
                field="docente"
                label="Docente"
                sortField={sortField}
                sortDirection={sortDirection}
                onToggle={toggleSort}
              />
            )}
            {view === 'mine' && <th className="px-6 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((appello) => (
            <tr key={appello.id} className="transition-[background-color] hover:bg-indigo-50/50">
              <td className="px-6 py-4 font-medium text-gray-900">{appello.date}</td>
              <td className="px-6 py-4 text-gray-600">{appello.courseYear.course?.name}</td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {appello.courseYear.label}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{appello.examSession.name}</td>
              {view === 'all' && (
                <td className="px-6 py-4 text-gray-600">
                  {appello.docente ? `${appello.docente.name} ${appello.docente.surname}` : '-'}
                </td>
              )}
              {view === 'mine' && (
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      to="/appelli/nuovo"
                      state={{ editAppello: appello }}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Modifica
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(appello.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Elimina
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AppelliPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialView = (location.state as { view?: View } | null)?.view ?? 'mine';

  const [view, setView] = useState<View>(initialView);
  const [myAppelli, setMyAppelli] = useState<Appello[]>([]);
  const [allAppelli, setAllAppelli] = useState<Appello[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Notifiche: scompaiono da sole dopo 8 secondi
  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [message, error]);

  const reloadAll = async () => {
    try {
      const [mine, all, s] = await Promise.all([getMyAppelli(), getAllAppelli(), getSessions()]);
      setMyAppelli(mine);
      setAllAppelli(all);
      setSessions(s);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Vuoi cancellare questo appello?')) return;
    setMessage(null);
    setError(null);
    try {
      await deleteAppello(id);
      setMessage('Appello eliminato.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const activeSessionsCount = sessions.filter(
    (s) => s.sessionStartDate <= today && s.sessionEndDate >= today,
  ).length;

  const navItems = [
    { key: 'mine', label: 'I miei appelli', active: view === 'mine', onClick: () => setView('mine') },
    { key: 'all', label: 'Tutti gli appelli', active: view === 'all', onClick: () => setView('all') },
    { key: 'nuovo', label: '+ Aggiungi appello', active: false, onClick: () => navigate('/appelli/nuovo') },
  ];

  const appelli = view === 'mine' ? myAppelli : allAppelli;

  return (
    <SidebarLayout title="Docente" navItems={navItems} onLogout={handleLogout}>
      {(error || message) && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            I miei appelli
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{myAppelli.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Tutti gli appelli
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{allAppelli.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Sessioni attive oggi
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{activeSessionsCount}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {view === 'mine' ? 'I miei appelli' : 'Tutti gli appelli'}
          </h2>
          <Link
            to="/appelli/nuovo"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Aggiungi appello
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : (
          <TableAppelli appelli={appelli} view={view} onDelete={handleDelete} />
        )}
      </section>
    </SidebarLayout>
  );
};

export default AppelliPage;
