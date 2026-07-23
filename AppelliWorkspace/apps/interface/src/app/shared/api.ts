const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
// Client HTTP centralizzato: aggiunge base URL, token di autenticazione e Content-Type,
// e converte le risposte non-ok in ApiError così i chiamanti possono usare try/catch.
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : undefined;

  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(message ?? 'Errore imprevisto', response.status);
  }

  return data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });

export type Role = 'docente' | 'segreteria';

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  role: Role;
  name: string;
  surname: string;
}

export function registerUser(payload: RegisterPayload) {
  return post<RegisteredUser>('/register', payload);
}

export function loginUser(payload: LoginPayload) {
  return post<LoginResult>('/login', payload);
}

export interface Course {
  id: number;
  code: string;
  name: string;
  years?: CourseYear[];
}

export interface Docente {
  id: string;
  name: string;
  surname: string;
  email: string;
}

export function getDocenti() {
  return get<Docente[]>('/users/docenti');
}

export interface CourseYear {
  id: number;
  courseId: number;
  yearNumber: number;
  label: string;
  course?: Course;
  docenteId?: string;
  docente?: Docente;
}

export function getMyCourseYears() {
  return get<CourseYear[]>('/courses/years/mine');
}

export interface Materia {
  id: number;
  name: string;
  courseYearId: number;
  courseYear?: CourseYear;
  docenteId?: string | null;
  docente?: Docente;
}

// Materie del docente loggato per un anno: già filtrate per corso, anno e prof.
// Usato per precaricare la select nel form appello.
export function getMyMaterieByCourseYear(courseYearId: number) {
  return get<Materia[]>(`/courses/years/${courseYearId}/materie/mine`);
}

// Tutte le materie con corso/anno/docente: usato dalla segreteria.
export function getMaterie() {
  return get<Materia[]>('/courses/materie');
}

export interface CreateMateriaPayload {
  name: string;
  courseYearId: number;
  docenteId?: string | null;
}

export function createMateria(payload: CreateMateriaPayload) {
  return post<Materia>('/courses/materie', payload);
}

export function updateMateria(id: number, payload: Partial<CreateMateriaPayload>) {
  return patch<Materia>(`/courses/materie/${id}`, payload);
}

export function deleteMateria(id: number) {
  return del<void>(`/courses/materie/${id}`);
}

export interface ExamSession {
  id: number;
  name: string;
  sessionStartDate: string;
  sessionEndDate: string;
  submissionStartDate: string;
  submissionEndDate: string;
  courseYears?: CourseYear[];
}

export interface Appello {
  id: number;
  date: string;
  courseYearId: number;
  courseYear: CourseYear;
  materiaId: number;
  materia?: Materia;
  examSession: ExamSession;
  createdAt: string;
  docente?: { id: string; name: string; surname: string };
}

export function getMyAppelli() {
  return get<Appello[]>('/appelli/mine');
}

export function getAllAppelli() {
  return get<Appello[]>('/appelli');
}

export interface CreateAppelloPayload {
  date: string;
  courseYearId: number;
  materiaId: number;
  examSessionId: number;
}

export function createAppello(payload: CreateAppelloPayload) {
  return post<Appello>('/appelli', payload);
}

export function deleteAppello(id: number) {
  return del<void>(`/appelli/${id}`);
}

export interface UpdateAppelloPayload {
  date: string;
  courseYearId: number;
  materiaId: number;
  examSessionId: number;
}

export function updateAppello(id: number, payload: UpdateAppelloPayload) {
  return patch<Appello>(`/appelli/${id}`, payload);
}

export function getCourses() {
  return get<Course[]>('/courses');
}

export function getSessions() {
  return get<ExamSession[]>('/sessions');
}

export interface CalendarDay {
  date: string;
  available: boolean;
  appelloId?: number;
  mine?: boolean;
  docente?: string;
  holiday?: string; // descrizione della festività, se il giorno è festivo
}

export interface CalendarResponse {
  session: {
    id: number;
    name: string;
    sessionStartDate: string;
    sessionEndDate: string;
    submissionWindowOpen: boolean;
  };
  days: CalendarDay[];
}

export function getCalendar(sessionId: number, courseYearId: number) {
  return get<CalendarResponse>(
    `/sessions/${sessionId}/calendar?courseYearId=${courseYearId}`,
  );
}

export interface CreateCoursePayload {
  code: string;
  name: string;
}

export function createCourse(payload: CreateCoursePayload) {
  return post<Course>('/courses', payload);
}

export function getCourseYears() {
  return get<CourseYear[]>('/courses/years');
}

export interface CreateCourseYearPayload {
  courseId: number;
  yearNumber: number;
  label: string;
  docenteId?: string | null;
}

export function createCourseYear(payload: CreateCourseYearPayload) {
  return post<CourseYear>('/courses/years', payload);
}

export interface CreateSessionPayload {
  name: string;
  sessionStartDate: string;
  sessionEndDate: string;
  submissionStartDate: string;
  submissionEndDate: string;
  courseYearIds: number[];
}

export function createSession(payload: CreateSessionPayload) {
  return post<ExamSession>('/sessions', payload);
}

export interface UpdateCoursePayload {
  code?: string;
  name?: string;
}

export function updateCourse(id: number, payload: UpdateCoursePayload) {
  return patch<Course>(`/courses/${id}`, payload);
}

export function deleteCourse(id: number) {
  return del<void>(`/courses/${id}`);
}

export function deleteCourseYear(id: number) {
  return del<void>(`/courses/years/${id}`);
}

export interface UpdateCourseYearPayload {
  courseId?: number;
  yearNumber?: number;
  label?: string;
  docenteId?: string | null;
}

export function updateCourseYear(id: number, payload: UpdateCourseYearPayload) {
  return patch<CourseYear>(`/courses/years/${id}`, payload);
}

export interface Holiday {
  id: number;
  date: string;
  description: string;
}

export function getHolidays() {
  return get<Holiday[]>('/holidays');
}

export interface CreateHolidayPayload {
  date: string;
  description: string;
}

export function createHoliday(payload: CreateHolidayPayload) {
  return post<Holiday>('/holidays', payload);
}

export function updateHoliday(id: number, payload: Partial<CreateHolidayPayload>) {
  return patch<Holiday>(`/holidays/${id}`, payload);
}

export function deleteHoliday(id: number) {
  return del<void>(`/holidays/${id}`);
}

export interface UpdateSessionPayload {
  name?: string;
  sessionStartDate?: string;
  sessionEndDate?: string;
  submissionStartDate?: string;
  submissionEndDate?: string;
  courseYearIds?: number[];
}

export function updateSession(id: number, payload: UpdateSessionPayload) {
  return patch<ExamSession>(`/sessions/${id}`, payload);
}