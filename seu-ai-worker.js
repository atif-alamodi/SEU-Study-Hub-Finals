// =============================================================
// SEU Study Hub AI Tutor - Cloudflare Worker (v2)
// =============================================================
// التحسينات:
//  - فصل المعرفة لكل مادة (تُحقن فقط حسب الصفحة الحالية)
//  - قاعدة صارمة: العربية الفصحى فقط، ممنوع تسريب أي لغة أخرى
//  - temperature منخفض (0.2) لتقليل الهلوسة
//  - تعليمات واضحة بعدم الاختراع خارج المنهج
//  - فلتر برمجي يزيل أي حرف غير عربي/إنجليزي/رقم/علامة (مكافحة تسريب لغوي)
// =============================================================

const ALLOWED_ORIGINS = [
  'https://atif-alamodi.github.io',
  'http://localhost:8000',
  'http://localhost:3000',
];

const CORE_RULES = `أنت مدرّس ذكي ودود لطلاب الجامعة السعودية الإلكترونية في دبلوم الذكاء الاصطناعي التوليدي.

## قواعد إلزامية صارمة:

1. **اللغة**: ردّ بالعربية الفصحى البسيطة فقط. ممنوع منعاً باتاً استخدام أي لغة أخرى (روسية، صينية، يابانية، إلخ). يُسمح فقط بالمصطلح الإنجليزي بين قوسين بعد ترجمته العربية، مثل: الانحدار الخطي (Linear Regression).

2. **الالتزام بالمنهج**: لا تجب إلا بناءً على المحتوى المنهجي المرفق أدناه. إذا سألك الطالب عن شيء خارج المنهج، قل بوضوح: هذا السؤال خارج منهج المقرر.

3. **الدقة**: لا تخترع معادلات أو قوانين. إذا لم تكن متأكداً، قل: لست متأكداً، الأفضل الرجوع إلى المحاضرة الأصلية.

4. **الإيجاز**: 3-7 أسطر للسؤال البسيط، أطول للمعقد. لا تطيل بدون داعٍ.

5. **الأمثلة**: استخدم أمثلة محسوبة بالأرقام عند الإمكان.

6. **التنسيق**: معادلات في أسطر منفصلة، رموز تعبيرية باعتدال (📊 📐 🐍 ✅ ⚠️) فقط.

7. **ممنوع**:
   - ذكر "كنموذج لغوي" أو "كذكاء اصطناعي"
   - أكواد طويلة جداً
   - الاعتذار المبالغ فيه
   - خلط أي لغة أخرى مع العربية في نفس الجملة`;

const STATS_CONTENT = `
## مقرر الإحصاء وتحليل البيانات (STA104):

### 1) النزعة المركزية:
- المتوسط الحسابي (Mean): مجموع القيم ÷ عددها. حساس للقيم الشاذة.
- الوسيط (Median): القيمة الوسطى بعد الترتيب. غير حساس للقيم الشاذة.
- المنوال (Mode): القيمة الأكثر تكراراً.

### 2) مقاييس التشتت:
- المدى (Range): أكبر قيمة − أصغر قيمة.
- التباين (Variance): متوسط مربعات الانحرافات عن المتوسط.
  σ² = Σ(xᵢ − μ)² / n  (للمجتمع)
  s² = Σ(xᵢ − x̄)² / (n−1)  (للعينة)
- الانحراف المعياري: الجذر التربيعي للتباين.

### 3) الارتباط (Correlation):
- معامل بيرسون (r): يقيس قوة واتجاه العلاقة الخطية.
- المدى: من −1 إلى +1.
  r = +1: ارتباط طردي تام
  r = −1: ارتباط عكسي تام
  r = 0: لا ارتباط خطي
- |r| > 0.7: قوي، 0.3-0.7: متوسط، أقل من 0.3: ضعيف.

### 4) التوزيع الطبيعي:
- منحنى الجرس، متماثل حول المتوسط μ.
- معادلة الكثافة: f(x) = (1/(σ√(2π))) × e^(−((x−μ)²/(2σ²)))
- في الرسم: المحور x = قيم المتغير، المحور y = الكثافة الاحتمالية f(x).
- قاعدة 68-95-99.7:
  68% ضمن ±1σ، 95% ضمن ±2σ، 99.7% ضمن ±3σ.

### 5) الدرجة المعيارية (Z-Score):
- Z = (x − μ) / σ
- تخبرنا كم انحراف معياري تبعد القيمة عن المتوسط.

### 6) الاحتمالات:
- P(A) = الحالات المرغوبة ÷ إجمالي الحالات.
- المكمل: P(not A) = 1 − P(A).

### 7) الانحدار الخطي البسيط:
- y = mx + b  أو  y = β₀ + β₁x
- m: الميل، b: نقطة التقاطع.
- طريقة المربعات الصغرى (OLS) تقلل مجموع مربعات الأخطاء.

### 8) معايير تقييم النموذج:
- MAE = (1/n) Σ|yᵢ − ŷᵢ|  (بنفس وحدة المتغير، أقل حساسية للقيم الشاذة)
- MSE = (1/n) Σ(yᵢ − ŷᵢ)²  (وحدة مربعة، حساس جداً للقيم الشاذة)
- RMSE = √MSE  (بنفس وحدة المتغير)
- R² = 1 − (SS_res / SS_tot)
  R² = 1: نموذج مثالي
  R² = 0: لا يفسر شيئاً
  R² = 0.85: يفسر 85% من التباين

### 9) تعلم الآلة:
- التعلم المُشرف (Supervised): بيانات معنونة (انحدار، تصنيف).
- التعلم غير المُشرف (Unsupervised): بيانات غير معنونة (تجميع/Clustering).
- التعلم المعزز (Reinforcement): التعلم من المكافآت.

### 10) دوال إكسل المهمة:
- IF, AND, OR, SUMIF, COUNTIF, AVERAGEIF
- VLOOKUP, INDEX/MATCH
- STDEV.P, STDEV.S, VAR.P, VAR.S
- CORREL, SLOPE, INTERCEPT, RSQ`;

const OSC_CONTENT = `
## مقرر نظم التشغيل (OSC):

### 1) المفاهيم الأساسية:
- نظام التشغيل: واجهة بين المستخدم والعتاد، يدير الموارد.
- أنواعه: Batch, Time-sharing, Real-time, Distributed, Embedded.

### 2) العمليات (Processes):
- العملية: برنامج قيد التنفيذ، لها معرّف PID.
- حالات العملية: New ← Ready ← Running ← Waiting ← Terminated.
- PCB: يحفظ معلومات العملية (الحالة، السجلات، الذاكرة).

### 3) الـ Threads:
- وحدة تنفيذ خفيفة داخل عملية، تشترك في الذاكرة.
- مزايا: استجابة أسرع، استخدام أفضل للنوى المتعددة.
- أنواع: User threads, Kernel threads.

### 4) جدولة المعالج (CPU Scheduling):
- FCFS: الأول أولاً، يعاني من تأثير القافلة.
- SJF: الأقصر أولاً، يقلل متوسط الانتظار.
- Priority: حسب الأولوية، قد يسبب تجويعاً.
- Round Robin: شريحة زمنية بالتناوب، عادل.
- المعايير: Throughput, Turnaround, Waiting, Response time.

### 5) المزامنة:
- Race Condition: نتيجة غير متوقعة بسبب التنفيذ المتزامن.
- Critical Section: منطقة الكود التي تحتاج وصولاً حصرياً.
- Mutex: قفل ثنائي.
- Semaphore: عداد للوصول المحدد.
- Monitor: بنية برمجية للمزامنة.
- Producer-Consumer, Readers-Writers, Dining Philosophers.

### 6) الـ Deadlock:
- الشروط الأربعة: Mutual exclusion, Hold and wait, No preemption, Circular wait.
- الحلول: Prevention, Avoidance (Banker's Algorithm), Detection, Recovery.

### 7) إدارة الذاكرة:
- Contiguous, Paging, Segmentation.
- Page: صفحة منطقية بحجم ثابت.
- Frame: إطار فيزيائي.
- Page Table: يربط الصفحات بالإطارات.
- TLB: ذاكرة تخزين مؤقت لترجمة العناوين.

### 8) الذاكرة الافتراضية:
- تنفيذ برامج أكبر من الذاكرة الفعلية.
- Demand Paging: تحميل الصفحات عند الحاجة.
- Page Fault: عند عدم وجود الصفحة في الذاكرة.
- خوارزميات الاستبدال: FIFO, LRU, Optimal.

### 9) أنظمة الملفات:
- File: مجموعة بيانات باسم.
- بنية المجلدات: Single-level, Two-level, Tree, Acyclic graph.
- التخصيص: Contiguous, Linked, Indexed.
- إدارة المساحة الحرة: Bitmap, Linked list.

### 10) الإدخال/الإخراج:
- Polling vs Interrupt-driven.
- DMA: نقل البيانات بدون تدخل المعالج.
- Buffering, Caching, Spooling.`;

const PYTHON_CONTENT = `
## مقرر البايثون (PYT103):

### 1) المتغيرات والأنواع:
- int: أعداد صحيحة (5, -3).
- float: أعداد عشرية (3.14).
- str: نصوص ("hello").
- bool: True أو False.
- التحويل: int(), float(), str(), bool().

### 2) المعاملات:
- حسابية: + - * / // % **
- مقارنة: == != < > <= >=
- منطقية: and, or, not

### 3) الجمل الشرطية:
\`\`\`
if condition:
    code
elif other_condition:
    code
else:
    code
\`\`\`

### 4) الحلقات:
- for للتكرار:
\`\`\`
for i in range(5):
    print(i)
\`\`\`
- while: تكرار طالما الشرط صحيح.
- break: إيقاف، continue: تخطي.

### 5) الدوال:
\`\`\`
def function_name(parameter1, parameter2):
    return result
\`\`\`
- معاملات افتراضية: def f(x=10):
- *args و **kwargs.

### 6) القوائم (Lists):
- متغيرة الطول، قابلة للتعديل.
- إنشاء: my_list = [1, 2, 3]
- إضافة: append(), insert(), extend()
- حذف: remove(), pop(), del
- شرائح: my_list[1:3], my_list[::-1]

### 7) القواميس (Dictionaries):
- أزواج مفتاح-قيمة.
- إنشاء: d = {"name": "Atif", "age": 30}
- وصول: d["name"]
- إضافة: d["job"] = "HR"
- الدوال: keys(), values(), items()

### 8) الـ Tuples:
- مثل القوائم لكن غير قابلة للتعديل.
- t = (1, 2, 3)

### 9) الـ Sets:
- مجموعات غير مرتبة بدون تكرار.
- s = {1, 2, 3}
- العمليات: union, intersection, difference.

### 10) السلاسل النصية:
- الدوال: upper(), lower(), strip(), split(), join(), replace()
- f-strings: f"My name is {name}"
- شرائح: s[0:3], s[::-1]

### 11) الكلاسات (OOP):
\`\`\`
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def greet(self):
        return f"Hello, I'm {self.name}"
\`\`\`
- الوراثة: class Child(Parent):
- self: مرجع الكائن نفسه.

### 12) الاستثناءات:
\`\`\`
try:
    x = int(input())
except ValueError:
    print("Invalid input")
finally:
    print("Done")
\`\`\`

### 13) الملفات:
\`\`\`
with open("file.txt", "r") as f:
    content = f.read()
\`\`\`

### 14) المكتبات الشائعة:
- math: sqrt, pi, log
- random: randint, choice, shuffle
- datetime: للتواريخ
- os: للنظام`;

const SUBJECT_MAP = {
  stats: { name: 'الإحصاء وتحليل البيانات (STA104)', content: STATS_CONTENT },
  osc: { name: 'نظم التشغيل (OSC)', content: OSC_CONTENT },
  python: { name: 'البايثون (PYT103)', content: PYTHON_CONTENT },
  general: { name: 'عام', content: STATS_CONTENT + '\n\n' + OSC_CONTENT + '\n\n' + PYTHON_CONTENT }
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return handleCORS(request);
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'SEU AI Tutor', version: '2.0', endpoint: '/ask' }, request);
    }
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
    const history = Array.isArray(body.history) ? body.history.slice(-4) : [];
    const subjectKey = body.subject || 'general';

    if (!userMessage) return jsonResponse({ error: 'No question provided' }, request, 400);
    if (userMessage.length > 1500) return jsonResponse({ error: 'Question too long (max 1500 chars)' }, request, 400);

    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
    if (env.RATE_LIMIT_KV) {
      const limited = await checkRateLimit(env.RATE_LIMIT_KV, clientIP);
      if (limited) {
        return jsonResponse({
          error: 'rate_limit',
          message: 'لقد تجاوزت الحد المسموح اليوم (30 سؤالاً). حاول غداً.'
        }, request, 429);
      }
    }

    const subject = SUBJECT_MAP[subjectKey] || SUBJECT_MAP.general;
    const systemPrompt = `${CORE_RULES}

# المادة الحالية: ${subject.name}
${subject.content}

---
**تذكير قبل الإجابة**:
- أجب بالعربية الفصحى فقط
- لا تستخدم أي حرف من أي لغة أخرى غير العربية والإنجليزية للمصطلحات بين قوسين
- اعتمد على المحتوى أعلاه فقط`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

    const aiResponse = await env.AI.run(MODEL, {
      messages,
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.9
    });

    let answer = (aiResponse.response || aiResponse.result?.response || '').trim();
    answer = filterForeignScripts(answer);

    if (!answer) {
      return jsonResponse({
        error: 'empty_response',
        message: 'لم أتمكن من توليد إجابة. حاول إعادة صياغة السؤال.'
      }, request, 500);
    }

    return jsonResponse({ answer, subject: subjectKey, model: MODEL }, request);

  } catch (err) {
    return jsonResponse({ error: 'AI error', message: err.message }, request, 500);
  }
}

// إزالة أي تسريب لغوي (سيريلي/CJK) من رد النموذج
function filterForeignScripts(text) {
  if (!text) return text;
  text = text.replace(/[\u0400-\u04FF\u0500-\u052F]/g, '');
  text = text.replace(/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g, '');
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return text;
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
