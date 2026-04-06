/**
 * API client boundary - abstracts HTTP communication.
 * Provides both real and mock implementations for testing.
 */

import {
  AuthResult,
  LogoutResult,
  User,
  Session,
  ExhibitCard,
  ContentVersion,
  FaqItem,
  AuditEvent,
  UserRole,
} from '../../domain/contracts';

export interface IApiClient {
  // Auth
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<LogoutResult>;
  getSession(): Promise<Session | null>;
  getUser(id: string): Promise<User | null>;

  // Exhibits
  listExhibits(): Promise<ExhibitCard[]>;
  getExhibit(id: string): Promise<ExhibitCard | null>;

  // Versions
  listVersions(exhibitId: string): Promise<ContentVersion[]>;

  // FAQ
  listFaq(): Promise<FaqItem[]>;

  // Audit
  listAuditEvents(limit?: number): Promise<AuditEvent[]>;
}

export class ApiClient implements IApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.token = this.loadToken();
  }

  private loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('auth_token');
  }

  private saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('auth_token');
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Login failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      if (data.token) {
        this.token = data.token;
        this.saveToken(data.token);
      }

      return {
        success: true,
        session: data.session,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      if (this.token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        });
      }

      this.token = null;
      this.clearToken();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSession(): Promise<Session | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch {
      return null;
    }
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch {
      return null;
    }
  }

  async listExhibits(): Promise<ExhibitCard[]> {
    throw new Error('Not implemented: listExhibits');
  }

  async getExhibit(_id: string): Promise<ExhibitCard | null> {
    throw new Error('Not implemented: getExhibit');
  }

  async listVersions(_exhibitId: string): Promise<ContentVersion[]> {
    throw new Error('Not implemented: listVersions');
  }

  async listFaq(): Promise<FaqItem[]> {
    throw new Error('Not implemented: listFaq');
  }

  async listAuditEvents(_limit?: number): Promise<AuditEvent[]> {
    throw new Error('Not implemented: listAuditEvents');
  }
}

export class MockApiClient implements IApiClient {
  async login(email: string, password: string): Promise<AuthResult> {
    // Mock credentials for demo: <role>@museum.com / admin
    const roleByEmail: Record<string, UserRole> = {
      'admin@museum.com': 'admin',
      'editor@museum.com': 'editor',
      'curator@museum.com': 'curator',
      'analyst@museum.com': 'analyst',
    };

    const role = roleByEmail[email];
    if (role && password === 'admin') {
      const user: User = {
        id: role,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session: Session = {
        userId: user.id,
        token: 'mock-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      // Store in sessionStorage for persistence
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_token', session.token);
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      }

      return { success: true, session, user };
    }

    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  async logout(): Promise<LogoutResult> {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    }
    return { success: true };
  }

  async getSession(): Promise<Session | null> {
    if (typeof window === 'undefined') return null;

    const token = sessionStorage.getItem('auth_token');
    if (!token) return null;

    const userStr = sessionStorage.getItem('auth_user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch {
      return null;
    }
  }

  async getUser(id: string): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const userStr = sessionStorage.getItem('auth_user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return user.id === id ? user : null;
    } catch {
      return null;
    }
  }

  async listExhibits(): Promise<ExhibitCard[]> {
    return [];
  }

  async getExhibit(_id: string): Promise<ExhibitCard | null> {
    return null;
  }

  async listVersions(_exhibitId: string): Promise<ContentVersion[]> {
    return [];
  }

  async listFaq(): Promise<FaqItem[]> {
    return [];
  }

  async listAuditEvents(_limit = 100): Promise<AuditEvent[]> {
    return [];
  }
}
