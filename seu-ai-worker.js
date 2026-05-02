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

// =============================================================
// محرك توليد الرسومات (SVG حقيقية، ليس ASCII)
// =============================================================

function svgWrap(inner, w = 600, h = 360) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="'Noto Sans Arabic', system-ui, sans-serif" style="background:white;border-radius:12px;max-width:100%;height:auto;">${inner}</svg>`;
}

// منحنى التوزيع الطبيعي (الجرس) مع المتوسط μ والانحرافات المعيارية
function svgNormalDistribution(opts = {}) {
  const w = 600, h = 360;
  const padX = 60, padY = 50;
  const plotW = w - padX * 2, plotH = h - padY * 2;
  const cx = w / 2;
  const baseY = h - padY;
  const peakY = padY + 20;

  // نقاط منحنى الجرس
  const points = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0..1
    const xPos = padX + plotW * t;
    const z = (t - 0.5) * 6; // -3 إلى +3
    const y = Math.exp(-(z * z) / 2);
    const yPos = baseY - y * (baseY - peakY);
    points.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
  }
  const pathD = `M ${padX},${baseY} L ${points.join(' L ')} L ${w - padX},${baseY} Z`;

  // مواقع σ
  const sigmaX = (zMul) => cx + (zMul / 6) * plotW;

  return svgWrap(`
    <defs>
      <linearGradient id="bell" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#3b82f6" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#3b82f6" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <text x="${cx}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">منحنى التوزيع الطبيعي</text>
    <line x1="${padX}" y1="${baseY}" x2="${w - padX}" y2="${baseY}" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="${cx}" y1="${baseY}" x2="${cx}" y2="${peakY - 10}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
    <path d="${pathD}" fill="url(#bell)" stroke="#1d4ed8" stroke-width="2.2"/>
    <!-- علامات σ -->
    ${[-3, -2, -1, 0, 1, 2, 3].map(z => `
      <line x1="${sigmaX(z)}" y1="${baseY}" x2="${sigmaX(z)}" y2="${baseY + 6}" stroke="#475569" stroke-width="1"/>
      <text x="${sigmaX(z)}" y="${baseY + 22}" text-anchor="middle" font-size="12" fill="#334155" direction="ltr">${z === 0 ? 'μ' : (z > 0 ? '+' : '') + z + 'σ'}</text>
    `).join('')}
    <!-- نسب 68-95-99.7 -->
    <text x="${cx}" y="${baseY - 100}" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="700">68%</text>
    <text x="${cx}" y="${baseY - 60}" text-anchor="middle" font-size="11" fill="#475569">±1σ</text>
    <text x="${sigmaX(-2)}" y="${baseY - 30}" text-anchor="middle" font-size="11" fill="#0f766e">±2σ → 95%</text>
    <text x="${sigmaX(2)}" y="${baseY - 30}" text-anchor="middle" font-size="11" fill="#0f766e">±3σ → 99.7%</text>
    <!-- تسميات المحاور -->
    <text x="${w - padX + 12}" y="${baseY + 4}" font-size="12" fill="#475569">x</text>
    <text x="${padX - 12}" y="${peakY + 5}" font-size="12" fill="#475569" text-anchor="end">f(x)</text>
  `, w, h);
}

// مخطط تشتت مع خط انحدار خطي
function svgScatterRegression() {
  const w = 600, h = 360;
  const padX = 60, padY = 50;
  const plotW = w - padX * 2, plotH = h - padY * 2;
  const baseY = h - padY;

  // نقاط شبه عشوائية لكنها ثابتة (deterministic)
  const data = [
    [0.10, 0.20], [0.18, 0.30], [0.25, 0.28], [0.30, 0.40],
    [0.38, 0.45], [0.45, 0.50], [0.50, 0.58], [0.58, 0.62],
    [0.65, 0.70], [0.72, 0.75], [0.80, 0.82], [0.88, 0.88],
    [0.42, 0.38], [0.55, 0.65], [0.68, 0.60]
  ];
  const toX = t => padX + t * plotW;
  const toY = t => baseY - t * plotH;

  const dots = data.map(([x, y]) =>
    `<circle cx="${toX(x).toFixed(1)}" cy="${toY(y).toFixed(1)}" r="5" fill="#3b82f6" stroke="white" stroke-width="1.5"/>`
  ).join('');

  // خط انحدار y = 0.85x + 0.10
  const x1 = 0.05, y1 = 0.85 * 0.05 + 0.10;
  const x2 = 0.95, y2 = 0.85 * 0.95 + 0.10;

  return svgWrap(`
    <text x="${w/2}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">الانحدار الخطي البسيط · y = mx + b</text>
    <!-- شبكة -->
    ${[0.25, 0.5, 0.75].map(t => `
      <line x1="${toX(t)}" y1="${padY}" x2="${toX(t)}" y2="${baseY}" stroke="#e2e8f0" stroke-dasharray="2,3"/>
      <line x1="${padX}" y1="${toY(t)}" x2="${w-padX}" y2="${toY(t)}" stroke="#e2e8f0" stroke-dasharray="2,3"/>
    `).join('')}
    <!-- محاور -->
    <line x1="${padX}" y1="${baseY}" x2="${w-padX}" y2="${baseY}" stroke="#475569" stroke-width="1.5"/>
    <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${baseY}" stroke="#475569" stroke-width="1.5"/>
    <!-- النقاط -->
    ${dots}
    <!-- خط الانحدار -->
    <line x1="${toX(x1).toFixed(1)}" y1="${toY(y1).toFixed(1)}" x2="${toX(x2).toFixed(1)}" y2="${toY(y2).toFixed(1)}" stroke="#dc2626" stroke-width="2.5"/>
    <!-- تسمية الخط -->
    <text x="${toX(0.78)}" y="${toY(0.88)}" font-size="13" fill="#dc2626" font-weight="700" direction="ltr">y = mx + b</text>
    <!-- تسميات المحاور -->
    <text x="${w - padX + 12}" y="${baseY + 4}" font-size="13" fill="#475569" direction="ltr">x</text>
    <text x="${padX - 12}" y="${padY - 4}" font-size="13" fill="#475569" direction="ltr">y</text>
    <text x="${w/2}" y="${h - 12}" text-anchor="middle" font-size="11" fill="#64748b">المتغير المستقل (x)</text>
  `, w, h);
}

// أنواع الارتباط الثلاثة: طردي، عكسي، معدوم
function svgCorrelationTypes() {
  const w = 600, h = 280;
  const cellW = (w - 40) / 3;
  const padTop = 50, plotH = h - padTop - 40;

  function plot(idx, title, gen, lineFrom, lineTo, color) {
    const ox = 20 + idx * cellW + 15;
    const inW = cellW - 30;
    const baseY = h - 40;
    const top = padTop + 10;
    const toX = t => ox + t * inW;
    const toY = t => baseY - t * (baseY - top);
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      pts.push([t, gen(t, i)]);
    }
    return `
      <g>
        <text x="${ox + inW/2}" y="${padTop - 10}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${title}</text>
        <line x1="${ox}" y1="${baseY}" x2="${ox+inW}" y2="${baseY}" stroke="#475569" stroke-width="1.2"/>
        <line x1="${ox}" y1="${top}" x2="${ox}" y2="${baseY}" stroke="#475569" stroke-width="1.2"/>
        ${pts.map(([x,y]) => `<circle cx="${toX(x).toFixed(1)}" cy="${toY(y).toFixed(1)}" r="3.5" fill="${color}" opacity="0.8"/>`).join('')}
        ${lineFrom ? `<line x1="${toX(lineFrom[0]).toFixed(1)}" y1="${toY(lineFrom[1]).toFixed(1)}" x2="${toX(lineTo[0]).toFixed(1)}" y2="${toY(lineTo[1]).toFixed(1)}" stroke="${color}" stroke-width="2" opacity="0.6"/>` : ''}
      </g>`;
  }

  const noise = (i) => ((i * 9301 + 49297) % 233280) / 233280 * 0.15 - 0.075;

  return svgWrap(`
    <text x="${w/2}" y="24" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">أنواع الارتباط (Correlation)</text>
    ${plot(0, 'طردي قوي · r ≈ +0.9', (t,i) => t * 0.9 + noise(i) + 0.05, [0.05, 0.1], [0.95, 0.95], '#16a34a')}
    ${plot(1, 'عكسي قوي · r ≈ -0.9', (t,i) => (1-t) * 0.9 + noise(i) + 0.05, [0.05, 0.95], [0.95, 0.1], '#dc2626')}
    ${plot(2, 'لا ارتباط · r ≈ 0', (t,i) => 0.5 + noise(i*3)*4, null, null, '#6366f1')}
  `, w, h);
}

// منحنى التوزيع الطبيعي مع منطقة مظللة (مثلاً Z > 1.5)
function svgZScoreCurve(zVal = 1.5, dir = 'right') {
  const w = 600, h = 340;
  const padX = 60, padY = 60;
  const plotW = w - padX * 2;
  const baseY = h - padY;
  const peakY = padY + 20;
  const cx = w / 2;

  const points = [];
  const fillPoints = [];
  const N = 100;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const xPos = padX + plotW * t;
    const z = (t - 0.5) * 6;
    const y = Math.exp(-(z * z) / 2);
    const yPos = baseY - y * (baseY - peakY);
    points.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
    if ((dir === 'right' && z >= zVal) || (dir === 'left' && z <= -zVal)) {
      fillPoints.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
    }
  }
  const pathD = `M ${padX},${baseY} L ${points.join(' L ')} L ${w - padX},${baseY} Z`;
  const zMarkX = padX + plotW * (0.5 + (dir === 'right' ? zVal : -zVal) / 6);

  let shadedPath = '';
  if (fillPoints.length > 0) {
    const startX = dir === 'right' ? zMarkX : padX;
    const endX = dir === 'right' ? (w - padX) : zMarkX;
    shadedPath = `<path d="M ${startX},${baseY} L ${fillPoints.join(' L ')} L ${endX},${baseY} Z" fill="#dc2626" opacity="0.5"/>`;
  }

  return svgWrap(`
    <text x="${cx}" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">الدرجة المعيارية Z-Score · المنطقة المظللة عند Z = ${dir === 'right' ? '+' : '-'}${zVal}</text>
    <line x1="${padX}" y1="${baseY}" x2="${w-padX}" y2="${baseY}" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="${pathD}" fill="#3b82f6" fill-opacity="0.18" stroke="#1d4ed8" stroke-width="2"/>
    ${shadedPath}
    <line x1="${zMarkX}" y1="${baseY}" x2="${zMarkX}" y2="${peakY - 10}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="${zMarkX}" y="${baseY + 22}" text-anchor="middle" font-size="13" fill="#dc2626" font-weight="700" direction="ltr">Z = ${dir === 'right' ? '+' : '-'}${zVal}</text>
    <text x="${cx}" y="${baseY + 22}" text-anchor="middle" font-size="13" fill="#334155" direction="ltr">μ</text>
    <text x="${w - padX + 12}" y="${baseY + 4}" font-size="12" fill="#475569">x</text>
  `, w, h);
}

// مخطط Gantt لجدولة المعالج (مثلاً Round Robin)
function svgGanttChart(processes) {
  const w = 600, h = 240;
  const padX = 50, padY = 70;
  const plotW = w - padX * 2;
  const barH = 40;
  const total = processes.reduce((s, p) => s + p.duration, 0);
  const colors = ['#3b82f6', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

  let cursor = 0;
  const bars = processes.map((p, i) => {
    const x1 = padX + (cursor / total) * plotW;
    const x2 = padX + ((cursor + p.duration) / total) * plotW;
    const color = colors[i % colors.length];
    cursor += p.duration;
    return `
      <rect x="${x1.toFixed(1)}" y="${padY}" width="${(x2-x1).toFixed(1)}" height="${barH}" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="${((x1+x2)/2).toFixed(1)}" y="${padY + barH/2 + 5}" text-anchor="middle" font-size="13" fill="white" font-weight="700">${p.name}</text>
      <text x="${x1.toFixed(1)}" y="${padY + barH + 18}" text-anchor="middle" font-size="11" fill="#475569" direction="ltr">${cursor - p.duration}</text>
    `;
  }).join('');

  return svgWrap(`
    <text x="${w/2}" y="32" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">مخطط Gantt لجدولة المعالج</text>
    <text x="${w/2}" y="52" text-anchor="middle" font-size="12" fill="#64748b">المحور الأفقي يمثل الوقت</text>
    ${bars}
    <text x="${padX + plotW}" y="${padY + barH + 18}" text-anchor="middle" font-size="11" fill="#475569" direction="ltr">${total}</text>
    <line x1="${padX}" y1="${padY + barH + 4}" x2="${padX + plotW}" y2="${padY + barH + 4}" stroke="#475569" stroke-width="1.2"/>
  `, w, h);
}

// =============================================================
// كاشف نية الرسم
// =============================================================
function wantsDrawing(question) {
  const q = question || '';
  return /ارسم|صورة|رسم بياني|مخطط|أرني|أظهر|رسماً|رسم|اعرض|draw|plot|chart|graph|visualize|تخيل|اعطني صورة|أعطني صورة|paint|illustrate|sketch|diagram/i.test(q);
}

// =============================================================
// محرك توليد الصور عبر Cloudflare Workers AI (flux-1-schnell)
// =============================================================

async function buildImagePrompt(env, userMessage, subjectName) {
  // نطلب من LLM بناء prompt إنجليزي محسّن لصورة تعليمية
  try {
    const resp = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        {
          role: 'system',
          content: `You are an image-prompt expert. Given an Arabic educational request, output a single English prompt (max 150 words) describing a clean educational diagram or illustration. Output ONLY the prompt, no preamble, no quotes, no explanation.

Style requirements: clean white or light background, professional educational illustration, clearly labeled in English, scientific accuracy, no people, no text logos.

Subject context: ${subjectName}.

Examples:
- Request: "ارسم لي التوزيع الطبيعي" → "Clean educational illustration of a normal distribution bell curve, blue gradient fill, x-axis labeled with mu and standard deviation marks (-3 to +3 sigma), y-axis labeled f(x), 68-95-99.7 percentages annotated, white background, professional textbook style, mathematical notation"
- Request: "ارسم المدرج التكراري" → "Clean educational histogram chart, vertical bars showing frequency distribution, x-axis showing data bins, y-axis showing frequency count, blue bars on white background, professional textbook style, English labels, clear gridlines"
- Request: "ارسم Gantt chart للجدولة" → "Clean Gantt chart diagram for CPU scheduling, horizontal colored bars showing process P1 P2 P3 P4 with time intervals, time axis at bottom in English, white background, professional textbook style"`
        },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.3
    });
    let prompt = (resp.response || resp.result?.response || '').trim();
    // تنظيف: إزالة علامات اقتباس وأسطر زائدة
    prompt = prompt.replace(/^["'`]|["'`]$/g, '').replace(/\n+/g, ' ').slice(0, 800);
    if (!prompt) {
      prompt = `Clean educational illustration related to ${subjectName}, professional textbook style, English labels, white background`;
    }
    return prompt;
  } catch (err) {
    return `Clean educational illustration related to ${subjectName}, professional textbook style, white background`;
  }
}

async function generateImage(env, prompt) {
  try {
    const resp = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: prompt,
      steps: 4,
      seed: Math.floor(Math.random() * 1000000)
    });
    // resp.image يأتي base64 jpeg
    return resp.image || null;
  } catch (err) {
    return null;
  }
}

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
    const isDrawingRequest = wantsDrawing(userMessage);

    let drawingInstruction = '';
    if (isDrawingRequest) {
      drawingInstruction = `

**ملاحظة مهمة جداً**: الطالب طلب رسماً، وتم توليد الصورة المطلوبة منفصلة وستُعرض له في الواجهة. لا تحاول رسم أي شيء بالأحرف (ASCII art) لأنه سيكون مشوّهاً. اكتفِ بشرح المفهوم نصياً بإيجاز (3-5 أسطر)، وأشر إلى أن الرسم معروض أعلاه.`;
    } else {
      drawingInstruction = `

**ملاحظة**: ممنوع منعاً باتاً رسم أي شيء بالأحرف أو الرموز (ASCII art)، لأنه يظهر مشوّهاً. إذا طلب الطالب رسماً، فسيتولى النظام توليده تلقائياً.`;
    }

    const systemPrompt = `${CORE_RULES}

# المادة الحالية: ${subject.name}
${subject.content}

---
**تذكير قبل الإجابة**:
- أجب بالعربية الفصحى فقط
- لا تستخدم أي حرف من أي لغة أخرى غير العربية والإنجليزية للمصطلحات بين قوسين
- اعتمد على المحتوى أعلاه فقط${drawingInstruction}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

    // تشغيل توليد النص + بناء image prompt بالتوازي
    const textPromise = env.AI.run(MODEL, {
      messages,
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.9
    });

    let imagePromise = Promise.resolve(null);
    if (isDrawingRequest) {
      imagePromise = (async () => {
        const imgPrompt = await buildImagePrompt(env, userMessage, subject.name);
        const img = await generateImage(env, imgPrompt);
        return { prompt: imgPrompt, image: img };
      })();
    }

    const [aiResponse, imgResult] = await Promise.all([textPromise, imagePromise]);

    let answer = (aiResponse.response || aiResponse.result?.response || '').trim();
    answer = filterForeignScripts(answer);
    answer = stripAsciiArt(answer);

    if (!answer && !(imgResult && imgResult.image)) {
      return jsonResponse({
        error: 'empty_response',
        message: 'لم أتمكن من توليد إجابة. حاول إعادة صياغة السؤال.'
      }, request, 500);
    }

    return jsonResponse({
      answer,
      subject: subjectKey,
      model: MODEL,
      image: imgResult ? imgResult.image : null,
      image_prompt: imgResult ? imgResult.prompt : null,
      image_svg: null
    }, request);

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

// إزالة محاولات ASCII art (سطور تتكون أساساً من الرموز / \ | _ - * = +)
function stripAsciiArt(text) {
  if (!text) return text;
  const lines = text.split('\n');
  const out = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) { inCodeBlock = !inCodeBlock; out.push(line); continue; }
    if (inCodeBlock) { out.push(line); continue; }
    const trimmed = line.trim();
    if (!trimmed) { out.push(line); continue; }
    // سطر "فني" يحتوي 60%+ من رموز الرسم الـ ASCII الشائعة
    const artChars = (trimmed.match(/[\\\/|_\-*=+~^<>]/g) || []).length;
    const ratio = artChars / trimmed.length;
    if (ratio > 0.55 && trimmed.length >= 4) {
      // نتجاوز هذا السطر (ASCII art مشوّه)
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
