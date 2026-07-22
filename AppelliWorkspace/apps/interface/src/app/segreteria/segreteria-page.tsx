import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { inputClass, labelClass } from '../shared/form-styles';
import Modal from '../shared/modal';
import SidebarLayout from '../shared/sidebar-layout';
import {
  ApiError,
  Course,
  CourseYear,
  Docente,
  ExamSession,
  Holiday,
  createCourse,
  createCourseYear,
  createHoliday,
  createSession,
  deleteCourse,
  deleteCourseYear,
  deleteHoliday,
  getCourses,
  getCourseYears,
  getDocenti,
  getHolidays,
  getSessions,
  updateCourse,
  updateCourseYear,
  updateHoliday,
  updateSession,
} from '../shared/api';

type Section = 'courses' | 'years' | 'sessions' | 'holidays';

// Converte il timestamp UTC del server nei componenti dell'ora locale,
// nel formato accettato dagli input datetime-local.
const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

// Converte un numero anno (1, 2, 3...) nel numero romano corrispondente (I, II, III...).
const toRoman = (num: number): string => {
  if (!Number.isInteger(num) || num < 1) return '';
  let n = num;
  let result = '';
  for (const [value, symbol] of ROMAN_NUMERALS) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
};

const SegreteriaPage = () => {
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseYears, setCourseYears] = useState<CourseYear[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [docenti, setDocenti] = useState<Docente[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

const [courseFormError, setCourseFormError] = useState<string | null>(null);
const [yearFormError, setYearFormError] = useState<string | null>(null);
const [sessionFormError, setSessionFormError] = useState<string | null>(null);
const [holidayFormError, setHolidayFormError] = useState<string | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingYearId, setEditingYearId] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');

  const [yearCourseId, setYearCourseId] = useState('');
  const [yearNumber, setYearNumber] = useState(1);
  const [yearLabel, setYearLabel] = useState('');
  const [yearDocenteId, setYearDocenteId] = useState('');

  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');

  const [sessionName, setSessionName] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [submissionStartDate, setSubmissionStartDate] = useState('');
  const [submissionEndDate, setSubmissionEndDate] = useState('');
  const [selectedYearIds, setSelectedYearIds] = useState<number[]>([]);

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
      const [c, y, s, d, h] = await Promise.all([
        getCourses(),
        getCourseYears(),
        getSessions(),
        getDocenti(),
        getHolidays(),
      ]);
      setCourses(c);
      setCourseYears(y);
      setSessions(s);
      setDocenti(d);
      setHolidays(h);
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

  const today = new Date().toISOString().slice(0, 10);
  const activeSessionsCount = sessions.filter(
    (s) => s.sessionStartDate <= today && s.sessionEndDate >= today,
  ).length;

  // --- Corsi ---
  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseCode('');
    setCourseName('');
    setCourseFormError(null);
  };

  const openNewCourse = () => {
    resetCourseForm();
    setCourseModalOpen(true);
  };

  const openEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseCode(c.code);
    setCourseName(c.name);
    setCourseModalOpen(true);
  };

  const handleSubmitCourse = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setCourseFormError(null);
    try {
      if (editingCourseId !== null) {
        await updateCourse(editingCourseId, { code: courseCode, name: courseName });
        setMessage('Corso di laurea modificato.');
      } else {
        await createCourse({ code: courseCode, name: courseName });
        setMessage('Corso di laurea creato.');
      }
      resetCourseForm();
      setCourseModalOpen(false);
      await reloadAll();
    } catch (err) {
      setCourseFormError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const handleDeleteCourse = async (c: Course) => {
    if (!window.confirm(`Vuoi eliminare il corso "${c.name}"?`)) return;
    setMessage(null);
    setError(null);
    try {
      await deleteCourse(c.id);
      setMessage('Corso di laurea eliminato.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  // --- Anni di frequenza ---
  const resetYearForm = () => {
    setEditingYearId(null);
    setYearCourseId('');
    setYearNumber(1);
    setYearLabel('');
    setYearDocenteId('');
    setYearFormError(null);
  };

  const openNewYear = () => {
    resetYearForm();
    setYearModalOpen(true);
  };

  const openEditYear = (y: CourseYear) => {
    setEditingYearId(y.id);
    setYearCourseId(String(y.courseId));
    setYearNumber(y.yearNumber);
    setYearLabel(y.label);
    setYearDocenteId(y.docenteId ?? '');
    setYearModalOpen(true);
  };

  // Etichetta automatica: codice del corso + numero anno in romano (es. INFTL-II).
  useEffect(() => {
    if (!yearCourseId) {
      setYearLabel('');
      return;
    }
    const course = courses.find((c) => c.id === Number(yearCourseId));
    if (!course) return;
    setYearLabel(`${course.code}-${toRoman(yearNumber)}`);
  }, [yearCourseId, yearNumber, courses]);

  const handleSubmitYear = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setYearFormError(null);
    if (!yearCourseId) {
      setYearFormError('Seleziona un corso di laurea.');
      return;
    }
    try {
      if (editingYearId !== null) {
        await updateCourseYear(editingYearId, {
          courseId: Number(yearCourseId),
          yearNumber,
          label: yearLabel,
          docenteId: yearDocenteId || null,
        });
        setMessage('Anno di frequenza modificato.');
      } else {
        await createCourseYear({
          courseId: Number(yearCourseId),
          yearNumber,
          label: yearLabel,
          docenteId: yearDocenteId || null,
        });
        setMessage('Anno di frequenza creato.');
      }
      resetYearForm();
      setYearModalOpen(false);
      await reloadAll();
    } catch (err) {
      setYearFormError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const handleDeleteYear = async (y: CourseYear) => {
    if (!window.confirm(`Vuoi eliminare l'anno di frequenza "${y.label}"?`)) return;
    setMessage(null);
    setError(null);
    try {
      await deleteCourseYear(y.id);
      setMessage('Anno di frequenza eliminato.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  // --- Festività ---
  const resetHolidayForm = () => {
    setEditingHolidayId(null);
    setHolidayDate('');
    setHolidayDescription('');
    setHolidayFormError(null);
  };

  const openNewHoliday = () => {
    resetHolidayForm();
    setHolidayModalOpen(true);
  };

  const openEditHoliday = (h: Holiday) => {
    setEditingHolidayId(h.id);
    setHolidayDate(h.date);
    setHolidayDescription(h.description);
    setHolidayModalOpen(true);
  };

  const handleSubmitHoliday = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setHolidayFormError(null);
    try {
      if (editingHolidayId !== null) {
        await updateHoliday(editingHolidayId, {
          date: holidayDate,
          description: holidayDescription,
        });
        setMessage('Festività modificata.');
      } else {
        await createHoliday({ date: holidayDate, description: holidayDescription });
        setMessage('Festività creata.');
      }
      resetHolidayForm();
      setHolidayModalOpen(false);
      await reloadAll();
    } catch (err) {
      setHolidayFormError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const handleDeleteHoliday = async (h: Holiday) => {
    if (!window.confirm(`Vuoi eliminare la festività "${h.description}" del ${h.date}?`)) return;
    setMessage(null);
    setError(null);
    try {
      await deleteHoliday(h.id);
      setMessage('Festività eliminata.');
      await reloadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  // --- Sessioni ---
  const toggleYear = (id: number) => {
    setSelectedYearIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetSessionForm = () => {
    setEditingSessionId(null);
    setSessionName('');
    setSessionStartDate('');
    setSessionEndDate('');
    setSubmissionStartDate('');
    setSubmissionEndDate('');
    setSelectedYearIds([]);
    setSessionFormError(null);
  };

  const openNewSession = () => {
    resetSessionForm();
    setSessionModalOpen(true);
  };

  const openEditSession = (s: ExamSession) => {
    setEditingSessionId(s.id);
    setSessionName(s.name);
    setSessionStartDate(s.sessionStartDate);
    setSessionEndDate(s.sessionEndDate);
    setSubmissionStartDate(toDatetimeLocal(s.submissionStartDate));
    setSubmissionEndDate(toDatetimeLocal(s.submissionEndDate));
    setSelectedYearIds((s.courseYears ?? []).map((y) => y.id));
    setSessionModalOpen(true);
  };

  const handleSubmitSession = async (e: FormEvent) => {
    e.preventDefault();
    setSessionFormError(null);
    setMessage(null);
    if (selectedYearIds.length === 0) {
      setSessionFormError('Seleziona almeno un corso/anno da abilitare.');
      return;
    }
    try {
      // Gli input datetime-local sono in ora locale: convertiamo in ISO UTC
      // così il server li interpreta senza ambiguità di fuso orario.
      const payload = {
        name: sessionName,
        sessionStartDate,
        sessionEndDate,
        submissionStartDate: new Date(submissionStartDate).toISOString(),
        submissionEndDate: new Date(submissionEndDate).toISOString(),
        courseYearIds: selectedYearIds,
      };
      if (editingSessionId !== null) {
        await updateSession(editingSessionId, payload);
        setMessage("Sessione d'esame modificata.");
      } else {
        await createSession(payload);
        setMessage("Sessione d'esame creata.");
      }
      resetSessionForm();
      setSessionModalOpen(false);
      await reloadAll();
    } catch (err) {
      setSessionFormError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const navItems = [
    { key: 'courses', label: 'Corsi di laurea', active: section === 'courses', onClick: () => setSection('courses') },
    { key: 'years', label: 'Anni di frequenza', active: section === 'years', onClick: () => setSection('years') },
    { key: 'sessions', label: "Sessioni d'esame", active: section === 'sessions', onClick: () => setSection('sessions') },
    { key: 'holidays', label: 'Festività', active: section === 'holidays', onClick: () => setSection('holidays') },
  ];

  return (
    <>
      <SidebarLayout title="Segreteria" navItems={navItems} onLogout={handleLogout}>
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
              Corsi di laurea
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{courses.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Anni di frequenza
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{courseYears.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Sessioni attive oggi
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{activeSessionsCount}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : (
          <>
            {section === 'courses' && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Corsi di laurea</h2>
                  <button
                    type="button"
                    onClick={openNewCourse}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Nuovo corso
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="py-2">Codice</th>
                      <th className="py-2">Nome</th>
                      <th className="py-2">Anni collegati</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 font-medium text-gray-900">{c.code}</td>
                        <td className="py-2 text-gray-700">{c.name}</td>
                        <td className="py-2 text-gray-500">
                          {courseYears.filter((y) => y.courseId === c.id).length}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => openEditCourse(c)}
                              className="text-sm font-medium text-indigo-600 hover:underline"
                            >
                              Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(c)}
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400">
                          Nessun corso ancora creato.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {section === 'years' && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Anni di frequenza</h2>
                  <button
                    type="button"
                    onClick={openNewYear}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Nuovo anno
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="py-2">Etichetta</th>
                      <th className="py-2">Corso di laurea</th>
                      <th className="py-2">Anno</th>
                      <th className="py-2">Docente titolare</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courseYears.map((y) => {
                      const docente = docenti.find((d) => d.id === y.docenteId);
                      return (
                        <tr key={y.id}>
                          <td className="py-2 font-medium text-gray-900">{y.label}</td>
                          <td className="py-2 text-gray-700">
                            {courses.find((c) => c.id === y.courseId)?.name ?? '—'}
                          </td>
                          <td className="py-2 text-gray-500">{y.yearNumber}</td>
                          <td className="py-2 text-gray-700">
                            {docente ? `${docente.name} ${docente.surname}` : 'Non assegnato'}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-4">
                              <button
                                type="button"
                                onClick={() => openEditYear(y)}
                                className="text-sm font-medium text-indigo-600 hover:underline"
                              >
                                Modifica
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteYear(y)}
                                className="text-sm font-medium text-red-600 hover:underline"
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {courseYears.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          Nessun anno ancora creato.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {section === 'sessions' && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Sessioni d'esame</h2>
                  <button
                    type="button"
                    onClick={openNewSession}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Nuova sessione
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="py-2">Nome</th>
                      <th className="py-2">Periodo</th>
                      <th className="py-2">Stato</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.map((s) => {
                      const active = s.sessionStartDate <= today && s.sessionEndDate >= today;
                      return (
                        <tr key={s.id}>
                          <td className="py-2 font-medium text-gray-900">{s.name}</td>
                          <td className="py-2 text-gray-700">
                            {s.sessionStartDate} → {s.sessionEndDate}
                          </td>
                          <td className="py-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {active ? 'Attiva' : 'Chiusa'}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => openEditSession(s)}
                              className="text-sm font-medium text-indigo-600 hover:underline"
                            >
                              Modifica
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400">
                          Nessuna sessione ancora creata.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}
            {section === 'holidays' && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Festività</h2>
                  <button
                    type="button"
                    onClick={openNewHoliday}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Nuova festività
                  </button>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                  Nei giorni festivi (oltre a sabato e domenica) i docenti non possono fissare appelli.
                </p>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="py-2">Data</th>
                      <th className="py-2">Descrizione</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {holidays.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 font-medium text-gray-900">{h.date}</td>
                        <td className="py-2 text-gray-700">{h.description}</td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => openEditHoliday(h)}
                              className="text-sm font-medium text-indigo-600 hover:underline"
                            >
                              Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(h)}
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {holidays.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-400">
                          Nessuna festività ancora inserita.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </SidebarLayout>

      <Modal
        open={courseModalOpen}
        title={editingCourseId !== null ? 'Modifica corso di laurea' : 'Nuovo corso di laurea'}
        onClose={() => {
          resetCourseForm();
          setCourseModalOpen(false);
        }}
      >
        {courseFormError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {courseFormError}
          </p>
        )}
        <form onSubmit={handleSubmitCourse} className="flex flex-col gap-4">
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
            className="mt-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {editingCourseId !== null ? 'Salva modifiche' : 'Crea'}
          </button>
        </form>
      </Modal>

      <Modal
        open={yearModalOpen}
        title={editingYearId !== null ? 'Modifica anno di frequenza' : 'Nuovo anno di frequenza'}
        onClose={() => {
          resetYearForm();
          setYearModalOpen(false);
        }}
      >
        {yearFormError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {yearFormError}
          </p>
        )}
        <form onSubmit={handleSubmitYear} className="flex flex-col gap-4">
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
              className={inputClass}
              value={yearNumber}
              onChange={(e) => setYearNumber(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Etichetta</label>
            <input
              className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
              value={yearLabel}
              readOnly
              placeholder="-- seleziona corso e numero anno --"
              required
            />
            <p className="text-xs text-gray-400">
              Generata automaticamente da codice del corso e numero anno.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Docente titolare</label>
            <select
              className={inputClass}
              value={yearDocenteId}
              onChange={(e) => setYearDocenteId(e.target.value)}
            >
              <option value="">-- non assegnato --</option>
              {docenti.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.surname}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {editingYearId !== null ? 'Salva modifiche' : 'Crea'}
          </button>
        </form>
      </Modal>

      <Modal
        open={holidayModalOpen}
        title={editingHolidayId !== null ? 'Modifica festività' : 'Nuova festività'}
        onClose={() => {
          resetHolidayForm();
          setHolidayModalOpen(false);
        }}
      >
        {holidayFormError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {holidayFormError}
          </p>
        )}
        <form onSubmit={handleSubmitHoliday} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Data</label>
            <input
              type="date"
              className={inputClass}
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Descrizione</label>
            <input
              className={inputClass}
              value={holidayDescription}
              onChange={(e) => setHolidayDescription(e.target.value)}
              placeholder="es. Festa della Repubblica"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-2 self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {editingHolidayId !== null ? 'Salva modifiche' : 'Crea'}
          </button>
        </form>
      </Modal>

      <Modal
        open={sessionModalOpen}
        title={editingSessionId !== null ? "Modifica sessione d'esame" : "Nuova sessione d'esame"}
        onClose={() => {
          resetSessionForm();
          setSessionModalOpen(false);
        }}
      >
        {sessionFormError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {sessionFormError}
          </p>
        )}
        <form onSubmit={handleSubmitSession} className="flex flex-col gap-4">
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
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>Inizio sessione</label>
              <input
                type="date"
                className={inputClass}
                value={sessionStartDate}
                onChange={(e) => setSessionStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
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
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>Inizio inserimento</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={submissionStartDate}
                onChange={(e) => setSubmissionStartDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
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
            <div className="mt-2 flex max-h-32 flex-wrap gap-3 overflow-y-auto">
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
            {editingSessionId !== null ? 'Salva modifiche' : 'Crea sessione'}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default SegreteriaPage;