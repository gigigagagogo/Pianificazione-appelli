import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiError,
  Appello,
  deleteAppello,
  getAllAppelli,
  getMyAppelli,
} from '../shared/api';

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
  const [view, setView] = useState<View>('mine');
  const [appelli, setAppelli] = useState<Appello[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (v: View) => {
    setLoading(true);
    setError(null);
    const request = v === 'mine' ? getMyAppelli() : getAllAppelli();
    request
      .then(setAppelli)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Vuoi cancellare questo appello?')) return;
    try {
      await deleteAppello(id);
      load(view);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-5">
          <span className="text-lg font-semibold tracking-wide text-indigo-600">Appelli</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Appelli</h1>
            <p className="mt-1 text-sm text-gray-500">
              L'elenco degli appelli d'esame inseriti.
            </p>
          </div>
          <Link
            to="/appelli/nuovo"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Aggiungi appello
          </Link>
        </div>

        <div className="mt-6 inline-flex rounded-md border border-gray-200 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setView('mine')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              view === 'mine' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            I miei appelli
          </button>
          <button
            type="button"
            onClick={() => setView('all')}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              view === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tutti gli appelli
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-gray-500">Caricamento...</p>}
        {error && (
          <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && (
          <TableAppelli appelli={appelli} view={view} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default AppelliPage;
