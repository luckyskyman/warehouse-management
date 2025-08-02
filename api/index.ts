import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS 헤더 설정 함수
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// 기본 사용자 데이터 (테스트용)
const users = [
  { id: 1, username: 'admin', password: 'xormr', role: 'super_admin' },
  { id: 2, username: 'viewer', password: 'viewer123', role: 'viewer' }
];

// 기본 재고 데이터 (테스트용)
const inventory = [
  { id: 1, code: 'TEST-001', name: '테스트 제품 1', stock: 100, location: 'A-1-1' },
  { id: 2, code: 'TEST-002', name: '테스트 제품 2', stock: 50, location: 'B-2-3' }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const method = req.method || 'GET';

  console.log(`API Request: ${method} ${url}`);

  try {
    // Health check
    if (url === '/api/health') {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        method: method
      });
    }

    // 로그인
    if (url === '/api/auth/login' && method === 'POST') {
      const { username, password } = req.body || {};
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.status(200).json({ 
        message: 'Login successful',
        user: { id: user.id, username: user.username, role: user.role }
      });
    }

    // 재고 조회
    if (url === '/api/inventory') {
      return res.status(200).json(inventory);
    }

    // 알림 조회
    if (url === '/api/notifications') {
      return res.status(200).json([]);
    }

    // BOM 조회
    if (url === '/api/bom') {
      return res.status(200).json([]);
    }

    // 업무일지 조회
    if (url === '/api/work-diary') {
      return res.status(200).json([]);
    }

    // 창고 레이아웃 조회
    if (url === '/api/warehouse/layout') {
      return res.status(200).json([]);
    }

    // 사용자 조회
    if (url === '/api/users') {
      return res.status(200).json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
    }

    // 404 - API 엔드포인트를 찾을 수 없음
    return res.status(404).json({ message: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
