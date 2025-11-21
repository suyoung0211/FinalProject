import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c1775708/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== Authentication Routes =====

// Sign up
app.post("/make-server-c1775708/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// ===== Page Routes =====

// Get all pages for a user
app.get("/make-server-c1775708/pages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Use demo user if no access token
    let userId = 'demo-user';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = user.id;
      }
    }

    // Get pages for this user
    const pages = await kv.getByPrefix(`page:${userId}:`);
    
    return c.json({ pages: pages || [] });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return c.json({ error: 'Failed to fetch pages' }, 500);
  }
});

// Create a new page
app.post("/make-server-c1775708/pages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Use demo user if no access token
    let userId = 'demo-user';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = user.id;
      }
    }

    const { title, content, template, icon } = await c.req.json();
    
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const pageId = crypto.randomUUID();
    const page = {
      id: pageId,
      title,
      content: content || '',
      template: template || 'blank',
      icon: icon || '📄',
      owner: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`page:${userId}:${pageId}`, page);

    return c.json({ page });
  } catch (error) {
    console.error('Error creating page:', error);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

// Update a page
app.put("/make-server-c1775708/pages/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pageId = c.req.param('id');
    const updates = await c.req.json();

    // Get existing page
    const existingPage = await kv.get(`page:${user.id}:${pageId}`);
    if (!existingPage) {
      return c.json({ error: 'Page not found' }, 404);
    }

    // Update page
    const updatedPage = {
      ...existingPage,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`page:${user.id}:${pageId}`, updatedPage);

    return c.json({ page: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);
    return c.json({ error: 'Failed to update page' }, 500);
  }
});

// Delete a page
app.delete("/make-server-c1775708/pages/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pageId = c.req.param('id');
    await kv.del(`page:${user.id}:${pageId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

// AI Generate Page
app.post("/make-server-c1775708/pages/ai-generate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Use demo user if no access token
    let userId = 'demo-user';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = user.id;
      }
    }

    const { prompt } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Generate page based on prompt
    // This is a simple implementation - you can integrate with actual AI services
    const pageId = crypto.randomUUID();
    
    // Determine template and content based on prompt
    let template = 'blank';
    let icon = '📄';
    let content = '';
    
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('일기') || promptLower.includes('diary')) {
      template = 'diary';
      icon = '📘';
      content = '# 오늘의 일기\n\n날짜: ' + new Date().toLocaleDateString() + '\n\n## 오늘의 기분\n\n## 오늘 있었던 일\n\n## 배운 것\n\n## 감사한 일';
    } else if (promptLower.includes('목록') || promptLower.includes('리스트') || promptLower.includes('list')) {
      template = 'list';
      icon = '📝';
      content = '# 목록\n\n- [ ] 항목 1\n- [ ] 항목 2\n- [ ] 항목 3';
    } else if (promptLower.includes('습관') || promptLower.includes('트래킹') || promptLower.includes('habit')) {
      template = 'habit';
      icon = '📈';
      content = '# 습관 트래킹\n\n## 주간 목표\n\n| 습관 | 월 | 화 | 수 | 목 | 금 | 토 | 일 |\n|------|---|---|---|---|---|---|---|\n| 운동 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |\n| 독서 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |\n| 명상 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |';
    } else if (promptLower.includes('목표') || promptLower.includes('goal')) {
      template = 'goal';
      icon = '🎯';
      content = '# 목표 설정\n\n## 장기 목표 (1년)\n\n## 중기 목표 (3개월)\n\n## 단기 목표 (이번 주)\n\n## 실행 계획\n\n## 진행 상황';
    } else if (promptLower.includes('추억') || promptLower.includes('사진') || promptLower.includes('memory')) {
      template = 'memory';
      icon = '📷';
      content = '# 추억 간직하기\n\n날짜: ' + new Date().toLocaleDateString() + '\n\n## 사진\n\n[사진을 추가하세요]\n\n## 이야기\n\n## 함께한 사람들';
    } else if (promptLower.includes('고객') || promptLower.includes('피드백') || promptLower.includes('feedback')) {
      template = 'feedback';
      icon = '💬';
      content = '# 고객 피드백 트래킹\n\n| 날짜 | 고객명 | 우선순위 | 상태 | 담당자 | 내용 |\n|------|--------|----------|------|--------|------|\n| ' + new Date().toLocaleDateString() + ' | | 중 | 진행중 | | |';
    } else {
      content = '# ' + prompt + '\n\n내용을 작성하세요.';
    }

    const page = {
      id: pageId,
      title: prompt,
      content,
      template,
      icon,
      owner: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`page:${userId}:${pageId}`, page);

    return c.json({ page });
  } catch (error) {
    console.error('Error generating AI page:', error);
    return c.json({ error: 'Failed to generate page' }, 500);
  }
});

// ===== Study Log Routes =====

// Get study logs for a user
app.get("/make-server-c1775708/study-logs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const logs = await kv.getByPrefix(`studylog:${user.id}:`);
    
    return c.json({ logs: logs || [] });
  } catch (error) {
    console.error('Error fetching study logs:', error);
    return c.json({ error: 'Failed to fetch study logs' }, 500);
  }
});

// Add study log
app.post("/make-server-c1775708/study-logs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { duration, notes } = await c.req.json();
    
    const logId = crypto.randomUUID();
    const log = {
      id: logId,
      userId: user.id,
      duration: duration || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`studylog:${user.id}:${logId}`, log);

    return c.json({ log });
  } catch (error) {
    console.error('Error adding study log:', error);
    return c.json({ error: 'Failed to add study log' }, 500);
  }
});

Deno.serve(app.fetch);