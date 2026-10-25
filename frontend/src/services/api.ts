import {
  UserProfile,
  AuthResponse,
  PeriodRecordDTO,
  CreatePeriodRecordInput,
  UpdatePeriodRecordInput,
  CycleStats,
  JournalEntryDTO,
  UpsertJournalEntryInput,
  UserProgressSummary,
  BloomStreakSummary
} from '../../../shared/types/index.js';

const API_BASE = '/api';
const TOKEN_KEY = 'lavender_bloom_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data as T;
}

export const api = {
  auth: {
    async register(payload: {
      username: string;
      password: string;
      nickname?: string;
      ageBand?: string;
      periodStatus?: string;
    }): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setStoredToken(res.token);
      return res;
    },

    async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
      const res = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      setStoredToken(res.token);
      return res;
    },

    async getMe(): Promise<UserProfile> {
      return request<UserProfile>('/auth/me');
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
      return request<UserProfile>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },

    async exportData(): Promise<any> {
      return request<any>('/auth/export');
    },

    async deleteAccount(): Promise<void> {
      await request<void>('/auth/account', {
        method: 'DELETE'
      });
      clearStoredToken();
    },

    logout(): void {
      clearStoredToken();
    }
  },

  periods: {
    async list(): Promise<{ periods: PeriodRecordDTO[]; stats: CycleStats }> {
      return request<{ periods: PeriodRecordDTO[]; stats: CycleStats }>('/periods');
    },

    async create(payload: CreatePeriodRecordInput): Promise<PeriodRecordDTO> {
      return request<PeriodRecordDTO>('/periods', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async update(id: string, payload: UpdatePeriodRecordInput): Promise<PeriodRecordDTO> {
      return request<PeriodRecordDTO>(`/periods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },

    async delete(id: string): Promise<void> {
      await request<void>(`/periods/${id}`, {
        method: 'DELETE'
      });
    }
  },

  journal: {
    async list(): Promise<JournalEntryDTO[]> {
      return request<JournalEntryDTO[]>('/journal');
    },

    async getByDate(date: string): Promise<JournalEntryDTO | null> {
      return request<JournalEntryDTO | null>(`/journal/date/${date}`);
    },

    async upsert(payload: UpsertJournalEntryInput): Promise<JournalEntryDTO> {
      return request<JournalEntryDTO>('/journal', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async delete(id: string): Promise<void> {
      await request<void>(`/journal/${id}`, {
        method: 'DELETE'
      });
    }
  },

  learning: {
    async getProgress(): Promise<UserProgressSummary> {
      return request<UserProgressSummary>('/learning/progress');
    },

    async completeLesson(lessonId: string, pointsEarned: number = 15): Promise<any> {
      return request<any>('/learning/complete-lesson', {
        method: 'POST',
        body: JSON.stringify({ lessonId, pointsEarned })
      });
    },

    async submitQuizAttempt(payload: { quizId: string; score: number; totalQuestions: number }): Promise<any> {
      return request<any>('/learning/quiz-attempt', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async submitDailyActivity(payload: {
      activityId: string;
      dayNumber: number;
      activityType: 'mcq' | 'myth_fact';
      clientDate?: string;
    }): Promise<{ activity: any; streak: BloomStreakSummary }> {
      return request<{ activity: any; streak: BloomStreakSummary }>('/learning/daily-activity', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  }
};
