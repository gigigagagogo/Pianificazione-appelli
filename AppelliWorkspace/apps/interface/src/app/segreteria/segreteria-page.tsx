import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { inputClass, labelClass } from '../shared/form-styles';
import {
  ApiError,
  Course,
  CourseYear,
  ExamSession,
  createCourse,
  createCourseYear,
  createSession,
  getCourses,
  getCourseYears,
  getSessions,
} from '../shared/api';

const SegreteriaPage = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseYears, setCourseYears] = useState<CourseYear[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');

  const [yearCourseId, setYearCourseId] = useState('');
  const [yearNumber, setYearNumber] = useState(1);
  const [yearLabel, setYearLabel] = useState('');

  const [sessionName, setSessionName] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [submissionStartDate, setSubmissionStartDate] = useState('');
  const [submissionEndDate, setSubmissionEndDate] = useState('');
  const [selectedYearIds, setSelectedYearIds] = useState<number[]>([]);

  const reloadAll = async () => {
    try {
      const [c, y, s] = await Promise.all([getCourses(), getCourseYears(), getSessions()]);
      setCourses(c);
      setCourseYears(y);
      setSessions(s);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await createCourse({ code: courseCode, name: courseName });
      setCourseCode('');
      setCourseName('');
      setMessage('Corso di laurea creato.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const handleCreateYear = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!yearCourseId) {
      setError('Seleziona un corso di laurea.');
      return;
    }
    try {
      await createCourseYear({
        courseId: Number(yearCourseId),
        yearNumber,
        label: yearLabel,
      });
      setYearLabel('');
      setMessage('Anno di frequenza creato.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const toggleYear = (id: number) => {
    setSelectedYearIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateSession = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (selectedYearIds.length === 0) {
      setError('Seleziona almeno un corso/anno da abilitare.');
      return;
    }
    try {
      await createSession({
        name: sessionName,
        sessionStartDate,
        sessionEndDate,
        submissionStartDate,
        submissionEndDate,
        courseYearIds: selectedYearIds,
      });
      setSessionName('');
      setSelectedYearIds([]);
      setMessage('Sessione d\'esame creata.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-5">
          <span className="text-lg font-semibold tracking-wide text-indigo-600">
            Segreteria
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:underline"
          >
            Esci
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        {error && (
          <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {message && (
          <p className="mb-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Nuovo corso di laurea</h2>
          <form onSubmit={handleCreateCourse} className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Codice</label>
              <input
                className={inputClass}
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="es. INFLM"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nome</label>
              <input
                className={inputClass}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="es. Ingegneria Informatica Magistrale"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Crea
            </button>
          </form>
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Nuovo anno di frequenza</h2>
          <form onSubmit={handleCreateYear} className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Corso di laurea</label>
              <select
                className={inputClass}
                value={yearCourseId}
                onChange={(e) => setYearCourseId(e.target.value)}
                required
              >
                <option value="">-- seleziona --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Numero anno</label>
              <input
                type="number"
                min={1}
                className={`${inputClass} w-24`}
                value={yearNumber}
                onChange={(e) => setYearNumber(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Etichetta</label>
              <input
                className={inputClass}
                value={yearLabel}
                onChange={(e) => setYearLabel(e.target.value)}
                placeholder="es. INFLM-I"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Crea
            </button>
          </form>
          <ul className="mt-4 flex flex-wrap gap-2">
            {courseYears.map((y) => (
              <li
                key={y.id}
                className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
              >
                {y.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Nuova sessione d'esame</h2>
          <form onSubmit={handleCreateSession} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nome sessione</label>
              <input
                className={inputClass}
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="es. Giugno/Luglio 2026"
                required
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Inizio sessione</label>
                <input
                  type="date"
                  className={inputClass}
                  value={sessionStartDate}
                  onChange={(e) => setSessionStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Fine sessione</label>
                <input
                  type="date"
                  className={inputClass}
                  value={sessionEndDate}
                  onChange={(e) => setSessionEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Inizio inserimento</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={submissionStartDate}
                  onChange={(e) => setSubmissionStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Fine inserimento</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={submissionEndDate}
                  onChange={(e) => setSubmissionEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <span className={labelClass}>Corsi/anni abilitati</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {courseYears.map((y) => (
                  <label key={y.id} className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedYearIds.includes(y.id)}
                      onChange={() => toggleYear(y.id)}
                    />
                    {y.label}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="mt-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Crea sessione
            </button>
          </form>

          <ul className="mt-6 divide-y divide-gray-100">
            {sessions.map((s) => (
              <li key={s.id} className="py-2 text-sm text-gray-700">
                <span className="font-medium">{s.name}</span> — {s.sessionStartDate} →{' '}
                {s.sessionEndDate}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default SegreteriaPage;