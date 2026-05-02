// =============================================================
// SEU Study Hub AI Tutor - Cloudflare Worker
// =============================================================
// Deploy: paste this code into a new Cloudflare Worker
// Settings: Bindings → Add → Workers AI binding name "AI"
// Rate limit: built-in via KV (optional)
// =============================================================

const ALLOWED_ORIGINS = [
  'https://atif-alamodi.github.io',
  'http://localhost:8000',
  'http://localhost:3000',
];

// System prompt — the AI tutor's personality and knowledge
const SYSTEM_PROMPT = `أنت مدرّس ذكي ودود لطلاب الجامعة السعودية الإلكترونية في دبلوم الذكاء الاصطناعي التوليدي. مهمتك مساعدة الطلاب على فهم ثلاث مواد:

1. **الإحصاء وتحليل البيانات (STA104):**
   - النزعة المركزية: متوسط، وسيط، منوال
   - الارتباط (معامل بيرسون R) وخط الاتجاه
   - التصوير البياني والمدرج التكراري
   - مقاييس التشتت: المدى، التباين، الانحراف المعياري
   - تحليل البيانات بإكسل (IF, AND, SUMIF, COUNTIF)
   - التوزيع الطبيعي والمعياري (Z-score، قاعدة 68-95-99.7)
   - الاحتمالات الأساسية والمكمل
   - الانحدار الخطي البسيط (y = mx + b)
   - تعلم الآلة (Supervised, Unsupervised, Reinforcement)
   - تقييم النموذج (R², MAE, MSE, RMSE)

2. **نظم التشغيل (OSC):**
   - العمليات والـ Threads والـ Concurrency
   - المزامنة (Mutexes, Semaphores, Locks)
   - جدولة المعالج (FCFS, SJF, Round Robin, Priority)
   - الذاكرة الافتراضية (Paging, Segmentation, TLB)
   - الـ Deadlock وحلوله
   - أنظمة الملفات

3. **البايثون (PYT103):**
   - المتغيرات والأنواع
   - الجمل الشرطية (if/elif/else)
   - الحلقات (for, while)
   - الدوال والمعاملات
   - القوائم والقواميس والـ tuples
   - الكلاسات والكائنات
   - الاستثناءات (try/except)

**قواعد الردود:**
- ✅ ردّ بالعربية الفصحى البسيطة دائماً (المصطلحات الإنجليزية تُذكر بين قوسين)
- ✅ إجابات مختصرة ومركّزة (3-6 أسطر للسؤال البسيط، أطول للمعقد)
- ✅ استخدم أمثلة محسوبة بالأرقام عند الإمكان
- ✅ إذا السؤال خارج المنهج، وجّه الطالب بلطف للمنهج: "هذا السؤال خارج المنهج، لكن لو تسأل عن..."
- ✅ لا تعتذر كثيراً، كن واثقاً
- ✅ استخدم الرموز التعبيرية باعتدال (📊 📐 🐍 ✅ ⚠️)
- ❌ لا تكتب أكواد طويلة جداً — قصّر للأهم
- ❌ لا تذكر "كنموذج لغوي" أو "كذكاء اصطناعي"
- ❌ لا تخرج عن المنهج الجامعي`;

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        service: 'SEU AI Tutor',
        endpoint: '/ask'
      }, request);
    }

    // Main AI endpoint
    if (url.pathname === '/ask' && request.method === 'POST') {
      return handleAsk(request, env);
    }

    return jsonResponse({ error: 'Not found' }, request, 404);
  }
};

async function handleAsk(request, env) {
  try {
    const body = await request.json();
    const userMessage = (body.question || body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const subject = body.subject || 'general'; // stats, osc, python, general

    if (!userMessage) {
      return jsonResponse({ error: 'No question provided' }, request, 400);
    }
    if (userMessage.length > 1500) {
      return jsonResponse({ error: 'Question too long (max 1500 chars)' }, request, 400);
    }

    // Rate limiting via KV (if RATE_LIMIT_KV binding exists)
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
    if (env.RATE_LIMIT_KV) {
      const limited = await checkRateLimit(env.RATE_LIMIT_KV, clientIP);
      if (limited) {
        return jsonResponse({
          error: 'rate_limit',
          message: 'لقد تجاوزت الحد المسموح اليوم (30 سؤال). حاول غداً.'
        }, request, 429);
      }
    }

    // Build context-aware prompt
    let subjectContext = '';
    if (subject === 'stats') subjectContext = '\n\n**السياق الحالي:** الطالب في صفحة الإحصاء.';
    else if (subject === 'osc') subjectContext = '\n\n**السياق الحالي:** الطالب في صفحة نظم التشغيل.';
    else if (subject === 'python') subjectContext = '\n\n**السياق الحالي:** الطالب في صفحة البايثون.';

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + subjectContext },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    // Call Workers AI (Llama 3.3 70B Instruct)
    const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 800,
      temperature: 0.6
    });

    const answer = aiResponse.response || aiResponse.result?.response || '';

    return jsonResponse({
      answer: answer.trim(),
      subject
    }, request);

  } catch (err) {
    return jsonResponse({
      error: 'AI error',
      message: err.message
    }, request, 500);
  }
}

async function checkRateLimit(kv, clientIP) {
  const today = new Date().toISOString().split('T')[0];
  const key = `rl:${clientIP}:${today}`;
  const count = parseInt(await kv.get(key) || '0', 10);
  if (count >= 30) return true;
  await kv.put(key, String(count + 1), { expirationTtl: 86400 });
  return false;
}

function handleCORS(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function jsonResponse(data, request, status = 200) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
