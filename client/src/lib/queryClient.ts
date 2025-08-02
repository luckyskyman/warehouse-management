import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = `${res.status}: ${res.statusText}`;
    try {
      // Response를 한 번만 읽기 위해 clone 사용
      const resClone = res.clone();
      const json = await resClone.json();
      errorMessage = json.message || json.error || errorMessage;
    } catch (parseError) {
      try {
        const text = await res.text();
        if (text) errorMessage = `${res.status}: ${text}`;
      } catch (textError) {
        // 이미 읽힌 경우 기본 메시지 사용
      }
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Content-Type': 'application/json',
  };

  // Add session ID to headers if available (try both keys)
  const sessionId = localStorage.getItem('warehouse_session') || localStorage.getItem('sessionId');
  if (sessionId) {
    headers["x-session-id"] = sessionId;
    headers["Authorization"] = `Bearer ${sessionId}`;
    headers["SessionId"] = sessionId;
    console.log('Adding session headers:', sessionId.substring(0, 20) + '...');
  } else {
    console.log('No session ID found in localStorage');
  }

  console.log('API request:', { method, url });

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-cache",
  });

  console.log('API response:', { status: res.status, statusText: res.statusText, url });
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const sessionId = localStorage.getItem('warehouse_session') || localStorage.getItem('sessionId');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (sessionId) {
      headers["x-session-id"] = sessionId;
      headers["Authorization"] = `Bearer ${sessionId}`;
      headers["SessionId"] = sessionId;
      console.log('Query function adding session headers:', sessionId.substring(0, 20) + '...');
    } else {
      console.log('Query function: No session ID found');
    }

    console.log('Fetching:', queryKey[0], 'with headers:', Object.keys(headers));

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      console.log('Query 401 error, clearing auth state');
      localStorage.removeItem('warehouse_session');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('warehouse_user');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      } else {
        // 로그인 페이지로 리다이렉트
        window.location.href = '/';
        throw new Error("Unauthorized");
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
