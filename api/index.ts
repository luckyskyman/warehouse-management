import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { setupDb } from '../server/db';
import { authenticateUser } from '../server/auth';
import type { User } from '../shared/schema';

// Express 앱 생성
const app = express();

// CORS 설정
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON 파싱
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Health check 라우트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 간단한 인증 라우트
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const db = setupDb();
    const user = await authenticateUser(username, password, db);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 세션 설정 (간단한 버전)
    res.json({ 
      message: 'Login successful', 
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 기본 라우트들
app.get('/api/inventory', (req, res) => {
  res.json([]);
});

app.get('/api/notifications', (req, res) => {
  res.json([]);
});

app.get('/api/bom', (req, res) => {
  res.json([]);
});

app.get('/api/work-diary', (req, res) => {
  res.json([]);
});

app.get('/api/warehouse/layout', (req, res) => {
  res.json([]);
});

app.get('/api/users', (req, res) => {
  res.json([]);
});

// 오류 처리
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Vercel 서버리스 함수 내보내기
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
