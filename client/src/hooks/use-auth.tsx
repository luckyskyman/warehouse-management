import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@/types/warehouse';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  sessionId: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const data = await response.json();
      setUser(data.user);
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('warehouse_user', JSON.stringify(data.user));
      localStorage.setItem('warehouse_session', data.sessionId);
      
      console.log('Login successful, session stored:', data.sessionId.substring(0, 20) + '...');
      
      // 로그인 시 권한별 캐시 무효화 (페이지 새로고침 없음)
      queryClient.clear(); // 전체 캐시 초기화로 권한 변경 즉시 반영
    } catch (error) {
      throw error instanceof Error ? error : new Error('로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('warehouse_user');
    localStorage.removeItem('warehouse_session');
    window.location.href = '/';
  };

  const refreshUser = async () => {
    const currentSessionId = sessionId || localStorage.getItem('warehouse_session') || localStorage.getItem('sessionId');
    if (!currentSessionId) return;
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'x-session-id': currentSessionId }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('warehouse_user', JSON.stringify(userData));
        
        // 권한 변경 후 캐시 무효화
        queryClient.clear();
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('warehouse_user');
    const savedSession = localStorage.getItem('warehouse_session') || localStorage.getItem('sessionId');
    
    console.log('AuthProvider useEffect:', { savedUser: !!savedUser, savedSession: !!savedSession });
    
    if (savedUser && savedSession) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Setting user from localStorage:', userData);
        setUser(userData);
        setSessionId(savedSession);
        
        // 세션 복원 후 바로 대시보드 표시 (검증 없이)
        console.log('Session restored successfully, user ready for dashboard');
      } catch (error) {
        console.error('localStorage 파싱 에러:', error);
        logout();
      }
    } else {
      console.log('No saved user or session found');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, sessionId, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
