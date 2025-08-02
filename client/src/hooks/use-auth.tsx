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
      
      // 로그인 응답 구조 확인
      console.log('Login response data:', data);
      
      const user = data.user || data;
      const sessionId = data.sessionId;
      
      // 즉시 localStorage에 저장
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);
      localStorage.setItem('warehouse_user', JSON.stringify(user));
      localStorage.setItem('warehouse_session', sessionId);
      
      console.log('Login successful, setting user and session immediately');
      console.log('User data:', user);
      console.log('Session ID:', sessionId.substring(0, 20) + '...');
      
      // 상태 즉시 설정
      setUser(user);
      setSessionId(sessionId);
      
      // 로그인 시 권한별 캐시 무효화 (페이지 새로고침 없음)
      queryClient.clear(); // 전체 캐시 초기화로 권한 변경 즉시 반영
      
      console.log('Auth state updated - user should see dashboard now');
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
    
    console.log('AuthProvider useEffect - checking saved auth:', { 
      savedUser: !!savedUser, 
      savedSession: !!savedSession,
      sessionId: savedSession ? savedSession.substring(0, 20) + '...' : 'none'
    });
    
    if (savedUser && savedSession) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Found saved user data, restoring immediately:', userData.username);
        
        // Set state immediately without verification for faster UX
        setUser(userData);
        setSessionId(savedSession);
        
        console.log('Auth state restored from localStorage - user should see dashboard');
        
        // Verify session in background (optional)
        fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedSession}`,
            'X-Session-Id': savedSession,
            'SessionId': savedSession,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Session invalid: ${response.status}`);
          }
          return response.json();
        })
        .then(serverUserData => {
          console.log('Background session verification successful');
          // Update with fresh server data if different
          if (JSON.stringify(userData) !== JSON.stringify(serverUserData)) {
            setUser(serverUserData);
            localStorage.setItem('warehouse_user', JSON.stringify(serverUserData));
          }
        })
        .catch(error => {
          console.log('Background session verification failed, clearing auth:', error.message);
          localStorage.removeItem('warehouse_user');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('warehouse_session');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
          setUser(null);
          setSessionId(null);
        });
      } catch (error) {
        console.error('localStorage parsing error:', error);
        logout();
      }
    } else {
      console.log('No saved auth data found');
      setUser(null);
      setSessionId(null);
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
