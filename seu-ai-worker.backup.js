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


// =============================================================
// مكتبة SVG للرسومات التعليمية الاحترافية
// =============================================================

// =============================================================
// مكتبة توليد رسومات SVG تعليمية احترافية
// تستخدم نفس design language: تدرج بنفسجي + Key Features box
// + شروحات ثنائية اللغة + محاور دقيقة
// =============================================================

// ألوان الـ design system
const PALETTE = {
  bgPurpleDeep: '#6B46C1',
  bgPurple: '#9F7AEA',
  bgPurpleLite: '#B794F4',
  bgPurpleVeryLite: '#D6BCFA',
  bgBlueLite: '#93C5FD',
  bgBlueVeryLite: '#BFDBFE',
  text: '#1F2937',
  textMuted: '#6B7280',
  gridLine: '#E5E7EB',
  white: '#FFFFFF',
  boxBg: '#EFF6FF',
  boxBorder: '#DBEAFE',
  annotPurple: '#7C3AED',
  annotBlue: '#2563EB',
};

// إطار SVG عام بحجم احترافي
function svgWrap(inner, w = 1080, h = 1200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="'Noto Sans Arabic', 'Segoe UI', system-ui, sans-serif" style="background:white;max-width:100%;height:auto;display:block;">${inner}</svg>`;
}

// نص عربي عبر foreignObject (يضمن العرض الصحيح RTL في كل المتصفحات)
function arText(x, y, w, text, opts = {}) {
  const fs = opts.fs || 18;
  const weight = opts.weight || '500';
  const color = opts.color || '#1F2937';
  const align = opts.align || 'right';
  const h = opts.h || (fs * 2);
  return `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:${weight} ${fs}px 'Noto Sans Arabic',system-ui;color:${color};direction:rtl;text-align:${align};line-height:1.3;">${text}</div></foreignObject>`;
}

// نص إنجليزي عادي عبر foreignObject (لتنسيق متّسق)
function enText(x, y, w, text, opts = {}) {
  const fs = opts.fs || 16;
  const weight = opts.weight || '400';
  const color = opts.color || '#6B7280';
  const align = opts.align || 'left';
  const h = opts.h || (fs * 2);
  return `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:${weight} ${fs}px 'Segoe UI',system-ui;color:${color};direction:ltr;text-align:${align};line-height:1.3;">${text}</div></foreignObject>`;
}

// رأس المخطط: عنوان عربي + إنجليزي
function svgHeader(arTitle, enTitle, y = 30) {
  // نضع كل شيء في foreignObject واحد ليكون التنسيق مثالياً
  return `<foreignObject x="40" y="${y}" width="1000" height="80">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans Arabic',system-ui;text-align:center;line-height:1.2;">
      <span style="font-size:42px;font-weight:700;color:#1F2937;direction:rtl;">${arTitle}</span>
      <span style="font-size:34px;color:#6B7280;margin:0 14px;">|</span>
      <span style="font-size:38px;font-weight:600;color:#1F2937;font-family:'Segoe UI',system-ui;">${enTitle}</span>
    </div>
  </foreignObject>`;
}

// صندوق Key Features في الأسفل: عمودين منفصلين (إنجليزي يسار | عربي يمين)
function svgKeyFeatures(features, yStart = 950) {
  const boxW = 980, boxH = 220;
  const boxX = (1080 - boxW) / 2;
  const titleH = 50;
  const rowH = (boxH - titleH - 20) / Math.max(features.length, 4);
  const midX = boxX + boxW / 2;

  let rows = '';
  features.slice(0, 4).forEach((f, i) => {
    const y = yStart + titleH + 10 + i * rowH;

    rows += `
      <!-- ============= الصف ${i + 1} ============= -->

      <!-- العمود الأيسر: أيقونة زرقاء + نقطة + نص إنجليزي -->
      <circle cx="${boxX + 30}" cy="${y + rowH/2 - 5}" r="14" fill="${PALETTE.bgBlueVeryLite}"/>
      <text x="${boxX + 30}" y="${y + rowH/2}" text-anchor="middle" font-size="14" fill="${PALETTE.annotBlue}" font-weight="700">${f.icon || '•'}</text>
      <circle cx="${boxX + 60}" cy="${y + rowH/2 - 5}" r="3" fill="${PALETTE.bgPurpleDeep}"/>
      <foreignObject x="${boxX + 75}" y="${y + 5}" width="${midX - boxX - 90}" height="${rowH}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font:500 18px 'Segoe UI',system-ui;color:#1F2937;display:flex;align-items:center;height:100%;">${f.en}</div>
      </foreignObject>

      <!-- العمود الأيمن: نص عربي + نقطة + أيقونة بنفسجية -->
      <foreignObject x="${midX + 15}" y="${y + 5}" width="${boxX + boxW - midX - 90}" height="${rowH}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font:500 19px 'Noto Sans Arabic',system-ui;color:#1F2937;direction:rtl;text-align:right;display:flex;align-items:center;justify-content:flex-end;height:100%;">${f.ar}</div>
      </foreignObject>
      <circle cx="${boxX + boxW - 60}" cy="${y + rowH/2 - 5}" r="3" fill="${PALETTE.bgPurpleDeep}"/>
      <circle cx="${boxX + boxW - 30}" cy="${y + rowH/2 - 5}" r="14" fill="${PALETTE.bgPurpleVeryLite}"/>
      <text x="${boxX + boxW - 30}" y="${y + rowH/2}" text-anchor="middle" font-size="14" fill="${PALETTE.bgPurpleDeep}" font-weight="700">${f.icon || '•'}</text>

      ${i < features.length - 1 ? `<line x1="${boxX + 20}" y1="${y + rowH - 2}" x2="${boxX + boxW - 20}" y2="${y + rowH - 2}" stroke="${PALETTE.gridLine}" stroke-width="1" stroke-dasharray="2,3"/>` : ''}
    `;
  });

  return `
    <rect x="${boxX}" y="${yStart}" width="${boxW}" height="${boxH}" rx="14" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>

    <!-- العنوان عبر foreignObject -->
    <foreignObject x="${boxX + 20}" y="${yStart + 8}" width="${boxW - 40}" height="${titleH}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans Arabic',system-ui;text-align:center;font-weight:700;color:#6B46C1;line-height:1.2;font-size:22px;padding-top:6px;">
        <span style="direction:rtl;">خصائص</span>
        <span style="margin:0 10px;">|</span>
        <span style="font-family:'Segoe UI',system-ui;">Key Features</span>
      </div>
    </foreignObject>

    <line x1="${midX}" y1="${yStart + titleH}" x2="${midX}" y2="${yStart + boxH - 10}" stroke="${PALETTE.boxBorder}" stroke-width="1" stroke-dasharray="3,3"/>

    ${rows}
  `;
}

// شرح بصندوق ملوّن مع سهم يشير لنقطة
function svgAnnotation(boxX, boxY, boxW, boxH, arText, enText, arrowX1, arrowY1, arrowX2, arrowY2, color = PALETTE.annotPurple) {
  return `
    <!-- صندوق الشرح -->
    <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="8" fill="${PALETTE.white}" stroke="${color}" stroke-width="2"/>
    <text x="${boxX + boxW - 12}" y="${boxY + 25}" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">${arText}</text>
    <text x="${boxX + 12}" y="${boxY + 50}" text-anchor="start" font-size="14" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui" direction="ltr">${enText}</text>

    <!-- سهم -->
    <defs>
      <marker id="arrow-${Math.random().toString(36).substr(2,5)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/>
      </marker>
    </defs>
    <line x1="${arrowX1}" y1="${arrowY1}" x2="${arrowX2}" y2="${arrowY2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <polygon points="${arrowX2},${arrowY2} ${arrowX2 - 8 * Math.cos(Math.atan2(arrowY2-arrowY1, arrowX2-arrowX1) - 0.4)},${arrowY2 - 8 * Math.sin(Math.atan2(arrowY2-arrowY1, arrowX2-arrowX1) - 0.4)} ${arrowX2 - 8 * Math.cos(Math.atan2(arrowY2-arrowY1, arrowX2-arrowX1) + 0.4)},${arrowY2 - 8 * Math.sin(Math.atan2(arrowY2-arrowY1, arrowX2-arrowX1) + 0.4)}" fill="${color}"/>
  `;
}

// =============================================================
// 1) المدرج التكراري Histogram
// =============================================================
function chartHistogram() {
  // بيانات افتراضية تشبه الصورة المرفقة
  const data = [
    { label: '0 – 10', value: 3, color: PALETTE.bgBlueLite },
    { label: '10 – 20', value: 7, color: PALETTE.bgPurpleVeryLite },
    { label: '20 – 30', value: 5, color: PALETTE.bgPurple },
    { label: '30 – 40', value: 8, color: PALETTE.bgPurpleDeep },
    { label: '40 – 50', value: 4, color: PALETTE.bgPurpleVeryLite },
  ];
  const maxVal = 10;
  const plotX = 130, plotY = 180, plotW = 700, plotH = 500;
  const barW = plotW / data.length;

  let bars = '';
  data.forEach((d, i) => {
    const bh = (d.value / maxVal) * plotH;
    const x = plotX + i * barW;
    const y = plotY + plotH - bh;
    bars += `<rect x="${x}" y="${y}" width="${barW - 2}" height="${bh}" fill="${d.color}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1.5" opacity="0.85"/>`;
  });

  // محور y: أرقام 0-10
  let yAxis = '';
  for (let i = 0; i <= 5; i++) {
    const v = i * 2;
    const y = plotY + plotH - (v / maxVal) * plotH;
    yAxis += `
      <line x1="${plotX}" y1="${y}" x2="${plotX + plotW}" y2="${y}" stroke="${PALETTE.gridLine}" stroke-width="1" stroke-dasharray="4,4"/>
      <text x="${plotX - 15}" y="${y + 5}" text-anchor="end" font-size="20" fill="${PALETTE.text}">${v}</text>
    `;
  }

  // محور x: تسميات الفئات
  let xAxis = '';
  data.forEach((d, i) => {
    const x = plotX + i * barW + barW / 2;
    xAxis += `<text x="${x}" y="${plotY + plotH + 30}" text-anchor="middle" font-size="18" fill="${PALETTE.text}">${d.label}</text>`;
  });

  // أسهم المحاور
  const axes = `
    <!-- محور y -->
    <line x1="${plotX}" y1="${plotY - 20}" x2="${plotX}" y2="${plotY + plotH + 5}" stroke="${PALETTE.text}" stroke-width="2"/>
    <polygon points="${plotX},${plotY - 25} ${plotX - 6},${plotY - 13} ${plotX + 6},${plotY - 13}" fill="${PALETTE.text}"/>
    <!-- محور x -->
    <line x1="${plotX - 5}" y1="${plotY + plotH}" x2="${plotX + plotW + 20}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
    <polygon points="${plotX + plotW + 25},${plotY + plotH} ${plotX + plotW + 13},${plotY + plotH - 6} ${plotX + plotW + 13},${plotY + plotH + 6}" fill="${PALETTE.text}"/>
  `;

  // عناوين المحاور
  const axisLabels = `
    <text x="55" y="${plotY + plotH/2}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" transform="rotate(-90 55 ${plotY + plotH/2})" direction="rtl">التكرارات / Frequencies</text>
    <text x="${plotX + plotW/2}" y="${plotY + plotH + 80}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" direction="rtl">الفئات (المجالات) / Class Intervals</text>
  `;

  // شرح ارتفاع العمود
  const annot1Bar = data[3];
  const annot1X = plotX + 3 * barW + barW / 2;
  const annot1Y = plotY + plotH - (annot1Bar.value / maxVal) * plotH;
  const annotation1 = `
    <rect x="850" y="190" width="220" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
    ${arText(860, 200, 200, 'ارتفاع العمود = تكرار الفئة', { fs: 16, weight: '600', color: PALETTE.text })}
    ${enText(860, 232, 200, 'Bar Height = Frequency', { fs: 14, color: PALETTE.textMuted })}
    <path d="M 850 230 Q 800 260 ${annot1X + 30} ${annot1Y + 30}" stroke="${PALETTE.annotPurple}" stroke-width="2" fill="none"/>
    <polygon points="${annot1X + 30},${annot1Y + 30} ${annot1X + 42},${annot1Y + 22} ${annot1X + 38},${annot1Y + 38}" fill="${PALETTE.annotPurple}"/>
    <line x1="${annot1X}" y1="${annot1Y + 5}" x2="${annot1X}" y2="${plotY + plotH - 5}" stroke="${PALETTE.annotPurple}" stroke-width="1.5" stroke-dasharray="3,3"/>
  `;

  const annot2 = `
    <rect x="850" y="450" width="220" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    ${arText(860, 460, 200, 'عرض العمود = طول الفئة', { fs: 16, weight: '600', color: PALETTE.text })}
    ${enText(860, 492, 200, 'Bar Width = Class Width', { fs: 14, color: PALETTE.textMuted })}
    <path d="M 850 490 Q 760 540 ${plotX + 3 * barW + 30} 600" stroke="${PALETTE.annotBlue}" stroke-width="2" fill="none"/>
    <line x1="${plotX + 3 * barW + 10}" y1="610" x2="${plotX + 4 * barW - 10}" y2="610" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <polygon points="${plotX + 3 * barW + 10},610 ${plotX + 3 * barW + 20},605 ${plotX + 3 * barW + 20},615" fill="${PALETTE.annotBlue}"/>
    <polygon points="${plotX + 4 * barW - 10},610 ${plotX + 4 * barW - 20},605 ${plotX + 4 * barW - 20},615" fill="${PALETTE.annotBlue}"/>
  `;

  const inner = `
    ${svgHeader('المدرج التكراري', 'Histogram')}
    ${yAxis}
    ${bars}
    ${axes}
    ${xAxis}
    ${axisLabels}
    ${annotation1}
    ${annot2}
    ${svgKeyFeatures([
      { ar: 'الأعمدة متلاصقة', en: 'No gaps between bars', icon: '◫' },
      { ar: 'للبيانات الكمية المستمرة', en: 'For continuous data', icon: '∿' },
      { ar: 'يوضح شكل التوزيع', en: 'Shows distribution shape', icon: '▲' },
      { ar: 'يساعد في تحديد القيم المتطرفة', en: 'Identifies outliers', icon: '⊙' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// 2) التوزيع الطبيعي Normal Distribution / Bell Curve
// =============================================================
function chartNormalDistribution() {
  const plotX = 90, plotY = 180, plotW = 900, plotH = 540;
  const cx = plotX + plotW / 2;
  const baseY = plotY + plotH;
  const peakY = plotY + 60;
  const sigmaW = 120; // كل انحراف معياري

  // منحنى الجرس باستخدام دالة طبيعية
  let path = `M ${plotX} ${baseY}`;
  for (let x = 0; x <= plotW; x += 4) {
    const xVal = (x - plotW / 2) / sigmaW; // z-score
    const y = Math.exp(-0.5 * xVal * xVal);
    const screenY = baseY - y * (baseY - peakY);
    path += ` L ${plotX + x} ${screenY}`;
  }
  path += ` L ${plotX + plotW} ${baseY} Z`;

  // مناطق ملوّنة لكل ±σ
  const regionPaths = [];
  for (let s = -3; s < 3; s++) {
    const x1 = cx + s * sigmaW;
    const x2 = cx + (s + 1) * sigmaW;
    const opacity = 0.85 - Math.abs(s + 0.5) * 0.18;
    const color = Math.abs(s + 0.5) < 1 ? PALETTE.bgPurpleDeep
                : Math.abs(s + 0.5) < 2 ? PALETTE.bgPurple
                : PALETTE.bgPurpleVeryLite;
    let regPath = `M ${x1} ${baseY}`;
    for (let x = x1; x <= x2; x += 2) {
      const xVal = (x - cx) / sigmaW;
      const y = Math.exp(-0.5 * xVal * xVal);
      regPath += ` L ${x} ${baseY - y * (baseY - peakY)}`;
    }
    regPath += ` L ${x2} ${baseY} Z`;
    regionPaths.push(`<path d="${regPath}" fill="${color}" opacity="${opacity}"/>`);
  }

  // محور x: -3σ إلى +3σ والمتوسط μ
  let xAxis = '';
  for (let s = -3; s <= 3; s++) {
    const x = cx + s * sigmaW;
    const label = s === 0 ? 'μ' : (s > 0 ? `+${s}σ` : `${s}σ`);
    xAxis += `
      <line x1="${x}" y1="${baseY}" x2="${x}" y2="${baseY + 8}" stroke="${PALETTE.text}" stroke-width="2"/>
      <text x="${x}" y="${baseY + 35}" text-anchor="middle" font-size="22" fill="${PALETTE.text}" font-weight="${s === 0 ? '700' : '500'}">${label}</text>
    `;
  }

  // خط عمودي عند المتوسط
  const meanLine = `<line x1="${cx}" y1="${peakY}" x2="${cx}" y2="${baseY}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5" stroke-dasharray="6,4"/>`;

  // محور y المخفي + خط الأرض
  const xLine = `<line x1="${plotX}" y1="${baseY}" x2="${plotX + plotW}" y2="${baseY}" stroke="${PALETTE.text}" stroke-width="2"/>`;

  // نسب 68-95-99.7
  const pcts = `
    <text x="${cx}" y="${peakY - 25}" text-anchor="middle" font-size="22" font-weight="700" fill="${PALETTE.bgPurpleDeep}">68%</text>
    <text x="${cx - sigmaW * 1.5}" y="${peakY + 110}" text-anchor="middle" font-size="20" font-weight="600" fill="${PALETTE.text}">95%</text>
    <text x="${cx + sigmaW * 1.5}" y="${peakY + 110}" text-anchor="middle" font-size="20" font-weight="600" fill="${PALETTE.text}">95%</text>
    <text x="${cx - sigmaW * 2.5}" y="${peakY + 350}" text-anchor="middle" font-size="18" font-weight="600" fill="${PALETTE.textMuted}">99.7%</text>
    <text x="${cx + sigmaW * 2.5}" y="${peakY + 350}" text-anchor="middle" font-size="18" font-weight="600" fill="${PALETTE.textMuted}">99.7%</text>
  `;

  // شرح: المتوسط
  const annot1 = `
    <rect x="780" y="200" width="240" height="70" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
    <text x="1010" y="225" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">القمة = المتوسط (μ)</text>
    <text x="790" y="250" text-anchor="start" font-size="14" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Peak = Mean (μ)</text>
    <line x1="780" y1="235" x2="${cx + 30}" y2="${peakY + 40}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
  `;

  // شرح: الانحراف المعياري
  const annot2 = `
    <rect x="60" y="200" width="240" height="70" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <text x="290" y="225" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">الانحراف المعياري σ</text>
    <text x="70" y="250" text-anchor="start" font-size="14" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Standard Deviation (σ)</text>
    <line x1="300" y1="235" x2="${cx - sigmaW - 20}" y2="${peakY + 200}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
  `;

  const inner = `
    ${svgHeader('التوزيع الطبيعي', 'Normal Distribution')}
    ${regionPaths.join('')}
    <path d="${path}" fill="none" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
    ${meanLine}
    ${xLine}
    ${xAxis}
    ${pcts}
    ${annot1}
    ${annot2}
    <text x="540" y="${baseY + 80}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" direction="rtl">قاعدة 68-95-99.7 / Empirical Rule</text>
    ${svgKeyFeatures([
      { ar: 'متماثل حول المتوسط', en: 'Symmetric around the mean', icon: '⟷' },
      { ar: 'شكل منحنى الجرس', en: 'Bell-shaped curve', icon: '◠' },
      { ar: 'المتوسط = الوسيط = المنوال', en: 'Mean = Median = Mode', icon: '=' },
      { ar: 'قاعدة 68-95-99.7', en: '68-95-99.7 Empirical Rule', icon: '%' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// 3) مخطط الانتشار Scatter Plot
// =============================================================
function chartScatterPlot() {
  const plotX = 130, plotY = 180, plotW = 800, plotH = 540;

  // نقاط بيانات تُظهر ارتباطاً طردياً
  const points = [];
  for (let i = 0; i < 30; i++) {
    const x = 0.1 + (i / 30) + (Math.sin(i * 7) * 0.05);
    const y = x + 0.1 + (Math.cos(i * 11) * 0.15);
    points.push({ x: Math.min(0.95, Math.max(0.05, x)), y: Math.min(0.95, Math.max(0.05, y)) });
  }

  let pts = '';
  points.forEach(p => {
    const cx = plotX + p.x * plotW;
    const cy = plotY + plotH - p.y * plotH;
    pts += `<circle cx="${cx}" cy="${cy}" r="7" fill="${PALETTE.bgPurple}" opacity="0.7" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1.5"/>`;
  });

  // خط الانحدار
  const x1 = plotX + 0.05 * plotW, y1 = plotY + plotH - 0.15 * plotH;
  const x2 = plotX + 0.95 * plotW, y2 = plotY + plotH - 0.95 * plotH;
  const regLine = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3" stroke-dasharray="8,4"/>`;

  // محاور
  let yAxis = '';
  for (let i = 0; i <= 5; i++) {
    const y = plotY + plotH - (i / 5) * plotH;
    yAxis += `
      <line x1="${plotX}" y1="${y}" x2="${plotX + plotW}" y2="${y}" stroke="${PALETTE.gridLine}" stroke-width="1" stroke-dasharray="4,4"/>
      <text x="${plotX - 15}" y="${y + 6}" text-anchor="end" font-size="18" fill="${PALETTE.text}">${(i * 20)}</text>
    `;
  }
  let xAxis = '';
  for (let i = 0; i <= 5; i++) {
    const x = plotX + (i / 5) * plotW;
    xAxis += `<text x="${x}" y="${plotY + plotH + 30}" text-anchor="middle" font-size="18" fill="${PALETTE.text}">${(i * 20)}</text>`;
  }

  const axes = `
    <line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
    <line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
  `;
  const axisLabels = `
    <text x="55" y="${plotY + plotH/2}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" transform="rotate(-90 55 ${plotY + plotH/2})" direction="rtl">المتغير y / y variable</text>
    <text x="${plotX + plotW/2}" y="${plotY + plotH + 70}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" direction="rtl">المتغير x / x variable</text>
  `;

  // شروحات
  const annot1 = `
    <rect x="${plotX + plotW + 20}" y="200" width="250" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
    <text x="${plotX + plotW + 260}" y="225" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">خط الانحدار</text>
    <text x="${plotX + plotW + 30}" y="250" text-anchor="start" font-size="13" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Best-Fit Regression Line</text>
    <text x="${plotX + plotW + 260}" y="270" text-anchor="end" font-size="14" fill="${PALETTE.bgPurpleDeep}" font-weight="600">y = mx + b</text>
    <line x1="${plotX + plotW + 20}" y1="245" x2="${plotX + plotW * 0.7}" y2="${plotY + plotH * 0.4}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
  `;

  const annot2 = `
    <rect x="60" y="600" width="220" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <text x="270" y="625" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">نقطة بيانات</text>
    <text x="70" y="650" text-anchor="start" font-size="13" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Data Point (xᵢ, yᵢ)</text>
    <text x="270" y="670" text-anchor="end" font-size="13" fill="${PALETTE.textMuted}" direction="rtl">ارتباط طردي قوي</text>
    <line x1="280" y1="635" x2="${plotX + 0.3 * plotW}" y2="${plotY + plotH - 0.3 * plotH}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
  `;

  const inner = `
    ${svgHeader('مخطط الانتشار', 'Scatter Plot')}
    ${yAxis}
    ${xAxis}
    ${axes}
    ${regLine}
    ${pts}
    ${axisLabels}
    ${annot1}
    ${annot2}
    ${svgKeyFeatures([
      { ar: 'يُظهر العلاقة بين متغيرين كميين', en: 'Shows relationship between two variables', icon: '⤢' },
      { ar: 'كل نقطة = ملاحظة واحدة', en: 'Each point = one observation', icon: '•' },
      { ar: 'يكشف نمط الارتباط (طردي/عكسي)', en: 'Reveals correlation pattern', icon: '↗' },
      { ar: 'يساعد في تحديد القيم الشاذة', en: 'Helps identify outliers', icon: '⊙' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// 4) Z-Score على منحنى التوزيع الطبيعي
// =============================================================
function chartZScore(zVal = 1.5) {
  const plotX = 90, plotY = 200, plotW = 900, plotH = 460;
  const cx = plotX + plotW / 2;
  const baseY = plotY + plotH;
  const peakY = plotY + 40;
  const sigmaW = 120;

  // منحنى كامل
  let curvePath = `M ${plotX} ${baseY}`;
  for (let x = 0; x <= plotW; x += 3) {
    const xVal = (x - plotW / 2) / sigmaW;
    const y = Math.exp(-0.5 * xVal * xVal);
    curvePath += ` L ${plotX + x} ${baseY - y * (baseY - peakY)}`;
  }
  curvePath += ` L ${plotX + plotW} ${baseY} Z`;

  // المنطقة المظللة (z إلى ما لانهاية)
  const zX = cx + zVal * sigmaW;
  let shadedPath = `M ${zX} ${baseY}`;
  for (let x = zX - plotX; x <= plotW; x += 2) {
    const xVal = (x - plotW / 2) / sigmaW;
    const y = Math.exp(-0.5 * xVal * xVal);
    shadedPath += ` L ${plotX + x} ${baseY - y * (baseY - peakY)}`;
  }
  shadedPath += ` L ${plotX + plotW} ${baseY} Z`;

  // محور x
  let xAxis = '';
  for (let s = -3; s <= 3; s++) {
    const x = cx + s * sigmaW;
    xAxis += `
      <line x1="${x}" y1="${baseY}" x2="${x}" y2="${baseY + 8}" stroke="${PALETTE.text}" stroke-width="2"/>
      <text x="${x}" y="${baseY + 35}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" font-weight="${s === 0 ? '700' : '500'}">${s === 0 ? '0 (μ)' : (s > 0 ? `+${s}` : `${s}`)}</text>
    `;
  }

  // خط عمودي عند Z
  const zLine = `<line x1="${zX}" y1="${peakY - 20}" x2="${zX}" y2="${baseY}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>`;
  const zMark = `
    <circle cx="${zX}" cy="${baseY}" r="6" fill="${PALETTE.bgPurpleDeep}"/>
    <text x="${zX}" y="${peakY - 30}" text-anchor="middle" font-size="22" font-weight="700" fill="${PALETTE.bgPurpleDeep}">Z = ${zVal}</text>
  `;

  const xLine = `<line x1="${plotX}" y1="${baseY}" x2="${plotX + plotW}" y2="${baseY}" stroke="${PALETTE.text}" stroke-width="2"/>`;

  // شرح الصيغة
  const formula = `
    <rect x="120" y="220" width="280" height="100" rx="10" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <text x="380" y="250" text-anchor="end" font-size="18" fill="${PALETTE.text}" font-weight="600" direction="rtl">صيغة الدرجة المعيارية</text>
    <text x="130" y="275" text-anchor="start" font-size="14" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Z-Score Formula</text>
    <text x="260" y="310" text-anchor="middle" font-size="28" fill="${PALETTE.bgPurpleDeep}" font-weight="700">Z = (x − μ) / σ</text>
  `;

  // شرح المنطقة المظلّلة
  const annot = `
    <rect x="700" y="220" width="280" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
    <text x="970" y="245" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">المساحة = الاحتمال</text>
    <text x="710" y="270" text-anchor="start" font-size="13" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">P(Z &gt; ${zVal}) ≈ ${zVal === 1.5 ? '0.067' : '?'}</text>
    <text x="970" y="290" text-anchor="end" font-size="13" fill="${PALETTE.textMuted}" direction="rtl">احتمال الذيل اليميني</text>
    <line x1="700" y1="265" x2="${zX + 80}" y2="${baseY - 50}" stroke="${PALETTE.annotPurple}" stroke-width="2"/>
  `;

  const inner = `
    ${svgHeader('الدرجة المعيارية', 'Z-Score')}
    <path d="${curvePath}" fill="${PALETTE.bgPurpleVeryLite}" opacity="0.4" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <path d="${shadedPath}" fill="${PALETTE.bgPurpleDeep}" opacity="0.7"/>
    ${zLine}
    ${zMark}
    ${xLine}
    ${xAxis}
    ${formula}
    ${annot}
    <text x="540" y="${baseY + 80}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" direction="rtl">المحور الأفقي = الانحرافات المعيارية عن المتوسط</text>
    ${svgKeyFeatures([
      { ar: 'يقيس بُعد القيمة عن المتوسط بالانحرافات المعيارية', en: 'Measures deviation from mean in σ units', icon: 'σ' },
      { ar: 'Z موجبة: القيمة فوق المتوسط', en: 'Z &gt; 0: value above mean', icon: '↑' },
      { ar: 'Z سالبة: القيمة تحت المتوسط', en: 'Z &lt; 0: value below mean', icon: '↓' },
      { ar: 'يُستخدم لمقارنة القيم عبر توزيعات مختلفة', en: 'Compare values across distributions', icon: '⇄' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// 5) الانحدار الخطي Linear Regression
// =============================================================
function chartLinearRegression() {
  const plotX = 130, plotY = 180, plotW = 800, plotH = 540;

  // نقاط حول خط y = 0.8x + 0.1
  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = (i + 1) / 22;
    const yTrue = 0.85 * x + 0.05;
    const noise = (Math.sin(i * 13) * 0.08);
    points.push({ x, y: yTrue + noise, yTrue });
  }

  let pts = '';
  let residuals = '';
  points.forEach(p => {
    const cx = plotX + p.x * plotW;
    const cy = plotY + plotH - p.y * plotH;
    const cyTrue = plotY + plotH - p.yTrue * plotH;
    residuals += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cyTrue}" stroke="${PALETTE.annotBlue}" stroke-width="1.5" opacity="0.5"/>`;
    pts += `<circle cx="${cx}" cy="${cy}" r="7" fill="${PALETTE.bgPurple}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1.5"/>`;
  });

  // خط الانحدار
  const x1 = plotX, y1 = plotY + plotH - (0.85 * 0 + 0.05) * plotH;
  const x2 = plotX + plotW, y2 = plotY + plotH - (0.85 * 1 + 0.05) * plotH;
  const regLine = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>`;

  // محاور
  const axes = `
    <line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
    <line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
  `;

  let grid = '';
  for (let i = 1; i <= 5; i++) {
    const y = plotY + plotH - (i / 5) * plotH;
    grid += `<line x1="${plotX}" y1="${y}" x2="${plotX + plotW}" y2="${y}" stroke="${PALETTE.gridLine}" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  // معادلة الخط
  const eqBox = `
    <rect x="${plotX + plotW + 20}" y="200" width="270" height="160" rx="10" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <text x="${plotX + plotW + 280}" y="230" text-anchor="end" font-size="18" fill="${PALETTE.text}" font-weight="600" direction="rtl">معادلة الانحدار</text>
    <text x="${plotX + plotW + 30}" y="255" text-anchor="start" font-size="14" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">Regression Equation</text>
    <text x="${plotX + plotW + 155}" y="295" text-anchor="middle" font-size="26" font-weight="700" fill="${PALETTE.bgPurpleDeep}">y = mx + b</text>
    <text x="${plotX + plotW + 280}" y="325" text-anchor="end" font-size="13" fill="${PALETTE.text}" direction="rtl">m = الميل (Slope)</text>
    <text x="${plotX + plotW + 280}" y="345" text-anchor="end" font-size="13" fill="${PALETTE.text}" direction="rtl">b = نقطة التقاطع (Intercept)</text>
  `;

  // شرح البواقي
  const residAnnot = `
    <rect x="60" y="600" width="240" height="80" rx="8" fill="${PALETTE.white}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <text x="290" y="625" text-anchor="end" font-size="16" fill="${PALETTE.text}" font-weight="600" direction="rtl">البواقي (Residuals)</text>
    <text x="70" y="650" text-anchor="start" font-size="13" fill="${PALETTE.textMuted}" font-family="'Segoe UI', system-ui">eᵢ = yᵢ − ŷᵢ</text>
    <text x="290" y="670" text-anchor="end" font-size="12" fill="${PALETTE.textMuted}" direction="rtl">الفرق بين القيمة الفعلية والمتوقعة</text>
  `;

  const inner = `
    ${svgHeader('الانحدار الخطي البسيط', 'Simple Linear Regression')}
    ${grid}
    ${axes}
    ${residuals}
    ${regLine}
    ${pts}
    ${eqBox}
    ${residAnnot}
    <text x="55" y="${plotY + plotH/2}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" transform="rotate(-90 55 ${plotY + plotH/2})" direction="rtl">المتغير التابع y</text>
    <text x="${plotX + plotW/2}" y="${plotY + plotH + 70}" text-anchor="middle" font-size="20" fill="${PALETTE.text}" direction="rtl">المتغير المستقل x</text>
    ${svgKeyFeatures([
      { ar: 'يُنمذج العلاقة الخطية بين متغيرين', en: 'Models linear relationship', icon: '/' },
      { ar: 'يُستخدم للتنبؤ بقيم y من x', en: 'Used to predict y from x', icon: '→' },
      { ar: 'الميل m يقيس قوة العلاقة', en: 'Slope m measures relationship', icon: 'm' },
      { ar: 'R² يقيس جودة الملاءمة (0–1)', en: 'R² measures fit quality (0–1)', icon: 'R²' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// 6) مخطط الصندوق Box Plot
// =============================================================
function chartBoxPlot() {
  const plotX = 130, plotY = 240, plotW = 800, plotH = 380;
  const boxY = plotY + 50, boxH = 200;
  const boxX1 = plotX + 220, boxX2 = plotX + 520;
  const medianX = plotX + 340;
  const minX = plotX + 80, maxX = plotX + 700;
  const outX = plotX + 760;

  // محور أفقي
  let xTicks = '';
  for (let i = 0; i <= 10; i++) {
    const x = plotX + (i / 10) * plotW;
    xTicks += `
      <line x1="${x}" y1="${boxY + boxH + 15}" x2="${x}" y2="${boxY + boxH + 25}" stroke="${PALETTE.text}" stroke-width="1.5"/>
      <text x="${x}" y="${boxY + boxH + 50}" text-anchor="middle" font-size="16" fill="${PALETTE.text}">${i * 10}</text>
    `;
  }

  const inner = `
    ${svgHeader('مخطط الصندوق', 'Box Plot')}

    <!-- خط أفقي رئيسي -->
    <line x1="${plotX}" y1="${boxY + boxH + 15}" x2="${plotX + plotW}" y2="${boxY + boxH + 15}" stroke="${PALETTE.text}" stroke-width="2"/>
    ${xTicks}

    <!-- whisker يسار (Min إلى Q1) -->
    <line x1="${minX}" y1="${boxY + boxH/2}" x2="${boxX1}" y2="${boxY + boxH/2}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="${minX}" y1="${boxY + 30}" x2="${minX}" y2="${boxY + boxH - 30}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>

    <!-- whisker يمين (Q3 إلى Max) -->
    <line x1="${boxX2}" y1="${boxY + boxH/2}" x2="${maxX}" y2="${boxY + boxH/2}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="${maxX}" y1="${boxY + 30}" x2="${maxX}" y2="${boxY + boxH - 30}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>

    <!-- الصندوق (Q1-Q3) -->
    <rect x="${boxX1}" y="${boxY}" width="${boxX2 - boxX1}" height="${boxH}" fill="${PALETTE.bgPurpleVeryLite}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>

    <!-- خط الوسيط -->
    <line x1="${medianX}" y1="${boxY}" x2="${medianX}" y2="${boxY + boxH}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="4"/>

    <!-- نقطة شاذة -->
    <circle cx="${outX}" cy="${boxY + boxH/2}" r="7" fill="${PALETTE.annotPurple}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>

    <!-- تسميات تحت كل عنصر -->
    <text x="${minX}" y="${boxY - 15}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">Min</text>
    <text x="${boxX1}" y="${boxY - 15}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">Q1</text>
    <text x="${medianX}" y="${boxY - 15}" text-anchor="middle" font-size="16" fill="${PALETTE.bgPurpleDeep}" font-weight="700">Median (Q2)</text>
    <text x="${boxX2}" y="${boxY - 15}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">Q3</text>
    <text x="${maxX}" y="${boxY - 15}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">Max</text>

    <!-- شرح IQR -->
    <line x1="${boxX1}" y1="${boxY + boxH + 80}" x2="${boxX2}" y2="${boxY + boxH + 80}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <line x1="${boxX1}" y1="${boxY + boxH + 75}" x2="${boxX1}" y2="${boxY + boxH + 85}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <line x1="${boxX2}" y1="${boxY + boxH + 75}" x2="${boxX2}" y2="${boxY + boxH + 85}" stroke="${PALETTE.annotBlue}" stroke-width="2"/>
    <text x="${(boxX1+boxX2)/2}" y="${boxY + boxH + 110}" text-anchor="middle" font-size="18" fill="${PALETTE.annotBlue}" font-weight="700">IQR = Q3 − Q1</text>

    <!-- شرح القيمة الشاذة -->
    <text x="${outX}" y="${boxY + boxH/2 - 25}" text-anchor="middle" font-size="14" fill="${PALETTE.annotPurple}" font-weight="600" direction="rtl">قيمة شاذة</text>
    <text x="${outX}" y="${boxY + boxH/2 + 35}" text-anchor="middle" font-size="13" fill="${PALETTE.annotPurple}" font-family="'Segoe UI', system-ui">Outlier</text>

    ${svgKeyFeatures([
      { ar: 'يعرض 5 مقاييس: Min, Q1, Median, Q3, Max', en: 'Shows 5 summary statistics', icon: '5' },
      { ar: 'الصندوق يحتوي 50% من البيانات (IQR)', en: 'Box contains middle 50% (IQR)', icon: '▭' },
      { ar: 'يكشف القيم الشاذة بسهولة', en: 'Easily identifies outliers', icon: '◌' },
      { ar: 'مناسب لمقارنة عدة مجموعات', en: 'Compares multiple groups', icon: '⫶' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// مخططات نظم التشغيل (Operating Systems)
// =============================================================

// 7) حالات العملية Process States
function chartProcessStates() {
  const states = [
    { id: 'new',        ar: 'جديدة',     en: 'New',        cx: 200, cy: 380, color: PALETTE.bgBlueLite },
    { id: 'ready',      ar: 'جاهزة',      en: 'Ready',      cx: 440, cy: 280, color: PALETTE.bgPurpleLite },
    { id: 'running',    ar: 'قيد التنفيذ', en: 'Running',    cx: 700, cy: 380, color: PALETTE.bgPurpleDeep },
    { id: 'waiting',    ar: 'في الانتظار', en: 'Waiting',    cx: 440, cy: 600, color: PALETTE.bgPurple },
    { id: 'terminated', ar: 'منتهية',     en: 'Terminated', cx: 940, cy: 380, color: PALETTE.textMuted },
  ];

  let circles = '';
  states.forEach(s => {
    circles += `
      <circle cx="${s.cx}" cy="${s.cy}" r="65" fill="${s.color}" opacity="0.85" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
      <foreignObject x="${s.cx - 60}" y="${s.cy - 30}" width="120" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:white;text-align:center;direction:rtl;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${s.ar}</div>
        <div xmlns="http://www.w3.org/1999/xhtml" style="font:600 13px 'Segoe UI',system-ui;color:white;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${s.en}</div>
      </foreignObject>
    `;
  });

  // الانتقالات (سهام مع تسميات)
  const transitions = [
    { from: 'new',     to: 'ready',      labelAr: 'قبول',         labelEn: 'admitted' },
    { from: 'ready',   to: 'running',    labelAr: 'جدولة',        labelEn: 'dispatch' },
    { from: 'running', to: 'ready',      labelAr: 'مقاطعة',       labelEn: 'interrupt', curve: true },
    { from: 'running', to: 'waiting',    labelAr: 'انتظار I/O',   labelEn: 'I/O wait' },
    { from: 'waiting', to: 'ready',      labelAr: 'اكتمال I/O',   labelEn: 'I/O complete' },
    { from: 'running', to: 'terminated', labelAr: 'خروج',         labelEn: 'exit' },
  ];

  function findState(id) { return states.find(s => s.id === id); }
  function edgePoint(from, to, isStart) {
    const dx = to.cx - from.cx, dy = to.cy - from.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = 67;
    const ratio = isStart ? r / dist : (dist - r) / dist;
    return { x: from.cx + dx * ratio, y: from.cy + dy * ratio };
  }

  let arrows = '';
  transitions.forEach((t, i) => {
    const from = findState(t.from), to = findState(t.to);
    const start = edgePoint(from, to, true);
    const end = edgePoint(from, to, false);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    if (t.curve) {
      // خط منحني للعودة من Running إلى Ready
      const cpX = (start.x + end.x) / 2;
      const cpY = start.y - 90;
      arrows += `<path d="M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}" stroke="${PALETTE.annotPurple}" stroke-width="2.5" fill="none"/>`;
      arrows += `<polygon points="${end.x},${end.y} ${end.x + 8},${end.y - 12} ${end.x - 4},${end.y - 14}" fill="${PALETTE.annotPurple}"/>`;
      arrows += `<foreignObject x="${cpX - 65}" y="${cpY - 25}" width="130" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="background:white;border:1.5px solid ${PALETTE.annotPurple};border-radius:6px;padding:3px 6px;text-align:center;font:600 12px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;">${t.labelAr}<br/><span style="font-family:'Segoe UI',system-ui;font-weight:400;color:${PALETTE.textMuted};font-size:11px;">${t.labelEn}</span></div></foreignObject>`;
    } else {
      arrows += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>`;
      // رأس السهم
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const a1x = end.x - 12 * Math.cos(angle - 0.4);
      const a1y = end.y - 12 * Math.sin(angle - 0.4);
      const a2x = end.x - 12 * Math.cos(angle + 0.4);
      const a2y = end.y - 12 * Math.sin(angle + 0.4);
      arrows += `<polygon points="${end.x},${end.y} ${a1x},${a1y} ${a2x},${a2y}" fill="${PALETTE.bgPurpleDeep}"/>`;
      // التسمية
      arrows += `<foreignObject x="${midX - 60}" y="${midY - 22}" width="120" height="44"><div xmlns="http://www.w3.org/1999/xhtml" style="background:white;border:1.5px solid ${PALETTE.bgPurpleDeep};border-radius:6px;padding:2px 6px;text-align:center;font:600 12px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;">${t.labelAr}<br/><span style="font-family:'Segoe UI',system-ui;font-weight:400;color:${PALETTE.textMuted};font-size:11px;">${t.labelEn}</span></div></foreignObject>`;
    }
  });

  const inner = `
    ${svgHeader('حالات العملية', 'Process States')}
    ${arrows}
    ${circles}
    ${svgKeyFeatures([
      { ar: 'العملية الجديدة تنتقل إلى Ready عند القبول', en: 'New → Ready when admitted', icon: '→' },
      { ar: 'الـ scheduler ينقل العملية من Ready إلى Running', en: 'Scheduler dispatches Ready → Running', icon: '⚙' },
      { ar: 'العملية تنتظر I/O ثم تعود للـ Ready', en: 'Wait for I/O then return to Ready', icon: '⌛' },
      { ar: 'Terminated: انتهاء التنفيذ بشكل نهائي', en: 'Terminated: execution complete', icon: '⊘' },
    ])}
  `;
  return svgWrap(inner);
}

// 8) جدولة Round Robin (مخطط جانت)
function chartGanttRoundRobin() {
  // 4 عمليات مع quantum=4
  const processes = [
    { name: 'P1', burst: 8, color: PALETTE.bgPurpleDeep },
    { name: 'P2', burst: 4, color: PALETTE.bgPurple },
    { name: 'P3', burst: 9, color: PALETTE.bgBlueLite },
    { name: 'P4', burst: 5, color: PALETTE.bgPurpleLite },
  ];
  const quantum = 4;
  // محاكاة Round Robin
  const queue = processes.map(p => ({ ...p, remaining: p.burst }));
  const timeline = [];
  let time = 0;
  while (queue.some(p => p.remaining > 0)) {
    const p = queue.shift();
    if (p.remaining === 0) continue;
    const exec = Math.min(quantum, p.remaining);
    timeline.push({ name: p.name, start: time, end: time + exec, color: p.color });
    time += exec;
    p.remaining -= exec;
    if (p.remaining > 0) queue.push(p);
    else queue.push(p);
  }

  const totalTime = timeline[timeline.length - 1].end;
  const plotX = 90, plotY = 280, plotW = 900, plotH = 100;
  const unitW = plotW / totalTime;

  let blocks = '';
  let labels = '';
  let times = '';
  timeline.forEach((t, i) => {
    const x = plotX + t.start * unitW;
    const w = (t.end - t.start) * unitW;
    blocks += `<rect x="${x}" y="${plotY}" width="${w}" height="${plotH}" fill="${t.color}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2" opacity="0.85"/>`;
    labels += `<text x="${x + w/2}" y="${plotY + plotH/2 + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="white">${t.name}</text>`;
    if (i === 0) times += `<text x="${plotX}" y="${plotY + plotH + 28}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">${t.start}</text>`;
    times += `<text x="${x + w}" y="${plotY + plotH + 28}" text-anchor="middle" font-size="16" fill="${PALETTE.text}" font-weight="600">${t.end}</text>`;
  });

  // جدول العمليات (يسار)
  let table = `
    <rect x="60" y="450" width="430" height="200" rx="10" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <foreignObject x="70" y="460" width="410" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">جدول العمليات / Process Table</div></foreignObject>
    <line x1="80" y1="500" x2="470" y2="500" stroke="${PALETTE.boxBorder}" stroke-width="1"/>
    <text x="120" y="525" text-anchor="middle" font-size="15" font-weight="600" fill="${PALETTE.text}">Process</text>
    <text x="280" y="525" text-anchor="middle" font-size="15" font-weight="600" fill="${PALETTE.text}">Burst Time</text>
    <text x="430" y="525" text-anchor="middle" font-size="15" font-weight="600" fill="${PALETTE.text}">Color</text>
  `;
  processes.forEach((p, i) => {
    const y = 555 + i * 23;
    table += `
      <text x="120" y="${y}" text-anchor="middle" font-size="15" fill="${PALETTE.text}" font-weight="600">${p.name}</text>
      <text x="280" y="${y}" text-anchor="middle" font-size="15" fill="${PALETTE.text}">${p.burst}</text>
      <rect x="410" y="${y - 13}" width="40" height="16" fill="${p.color}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1"/>
    `;
  });

  // معلومات Quantum
  const quantumBox = `
    <rect x="540" y="450" width="450" height="200" rx="10" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <foreignObject x="550" y="460" width="430" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">معلومات الجدولة / Schedule Info</div></foreignObject>
    <line x1="560" y1="500" x2="970" y2="500" stroke="${PALETTE.boxBorder}" stroke-width="1"/>
    <foreignObject x="560" y="510" width="410" height="35"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 16px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;text-align:right;">Quantum (الشريحة الزمنية): <b style="color:${PALETTE.bgPurpleDeep};">${quantum}</b> وحدات</div></foreignObject>
    <foreignObject x="560" y="545" width="410" height="35"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 16px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;text-align:right;">إجمالي الوقت: <b style="color:${PALETTE.bgPurpleDeep};">${totalTime}</b> وحدة</div></foreignObject>
    <foreignObject x="560" y="580" width="410" height="35"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 16px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;text-align:right;">عدد العمليات: <b style="color:${PALETTE.bgPurpleDeep};">${processes.length}</b></div></foreignObject>
    <foreignObject x="560" y="615" width="410" height="35"><div xmlns="http://www.w3.org/1999/xhtml" style="font:500 14px 'Segoe UI',system-ui;color:${PALETTE.textMuted};direction:ltr;text-align:left;">Quantum = ${quantum}, Total Time = ${totalTime}, Processes = ${processes.length}</div></foreignObject>
  `;

  // محور زمني سفلي
  const timeAxis = `
    <line x1="${plotX}" y1="${plotY + plotH}" x2="${plotX + plotW}" y2="${plotY + plotH}" stroke="${PALETTE.text}" stroke-width="2"/>
    <text x="${plotX + plotW/2}" y="${plotY + plotH + 60}" text-anchor="middle" font-size="18" fill="${PALETTE.text}" direction="rtl">المحور الزمني / Time Axis</text>
  `;

  const inner = `
    ${svgHeader('جدولة Round Robin', 'Round Robin Scheduling')}
    ${blocks}
    ${labels}
    ${times}
    ${timeAxis}
    ${table}
    ${quantumBox}
    ${svgKeyFeatures([
      { ar: 'كل عملية تأخذ شريحة زمنية ثابتة', en: 'Each process gets fixed time quantum', icon: '◷' },
      { ar: 'العمليات تتداول في طابور FIFO', en: 'Processes rotate in FIFO queue', icon: '⟳' },
      { ar: 'preemptive: قابلة للاستباق', en: 'Preemptive scheduling', icon: '⏸' },
      { ar: 'مثالية للأنظمة التفاعلية', en: 'Ideal for interactive systems', icon: '⌨' },
    ])}
  `;
  return svgWrap(inner);
}

// 9) تخطيط الذاكرة Memory Layout
function chartMemoryLayout() {
  const segments = [
    { ar: 'المكدس',        en: 'Stack',      desc: 'متغيرات محلية، استدعاءات الدوال', descEn: 'Local vars, function calls', color: PALETTE.bgPurpleDeep, h: 130, arrow: 'down' },
    { ar: 'فجوة',           en: 'Free Space', desc: 'مساحة غير مستخدمة',                descEn: 'Unused memory',           color: '#F3F4F6',           h: 110, arrow: null },
    { ar: 'الكومة',         en: 'Heap',       desc: 'تخصيص ديناميكي (malloc/new)',     descEn: 'Dynamic allocation',      color: PALETTE.bgPurple,    h: 130, arrow: 'up' },
    { ar: 'البيانات',       en: 'BSS / Data', desc: 'متغيرات عامة وثابتة',             descEn: 'Global &amp; static vars',    color: PALETTE.bgPurpleLite, h: 110, arrow: null },
    { ar: 'الكود',          en: 'Text',       desc: 'تعليمات البرنامج (للقراءة فقط)',  descEn: 'Program instructions (RO)', color: PALETTE.bgBlueLite,  h: 110, arrow: null },
  ];

  const boxX = 220, boxW = 320;
  let y = 170;

  let segmentsSvg = '';
  segments.forEach((seg, i) => {
    const isFree = seg.color === '#F3F4F6';
    segmentsSvg += `
      <rect x="${boxX}" y="${y}" width="${boxW}" height="${seg.h}" fill="${seg.color}" opacity="${isFree ? '1' : '0.85'}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2" stroke-dasharray="${isFree ? '6,4' : '0'}"/>

      <!-- نص داخل القسم -->
      <foreignObject x="${boxX + 10}" y="${y + 10}" width="${boxW - 20}" height="${seg.h - 20}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${isFree ? PALETTE.textMuted : 'white'};text-shadow:0 1px 2px rgba(0,0,0,0.25);text-align:center;">
          <div style="font:700 22px 'Noto Sans Arabic',system-ui;direction:rtl;">${seg.ar}</div>
          <div style="font:600 18px 'Segoe UI',system-ui;margin:4px 0;">${seg.en}</div>
          ${!isFree ? `<div style="font:500 12px 'Noto Sans Arabic',system-ui;direction:rtl;opacity:0.95;">${seg.desc}</div>` : ''}
        </div>
      </foreignObject>

      <!-- شرح يمين -->
      ${!isFree ? `<foreignObject x="${boxX + boxW + 30}" y="${y + 20}" width="380" height="${seg.h - 40}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:500 16px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;text-align:right;line-height:1.5;">${seg.desc}<br/><span style="font-family:'Segoe UI',system-ui;color:${PALETTE.textMuted};font-size:14px;">${seg.descEn}</span></div></foreignObject>` : ''}

      <!-- سهم يسار -->
      ${seg.arrow === 'down' ? `
        <line x1="${boxX - 50}" y1="${y + 20}" x2="${boxX - 50}" y2="${y + seg.h - 20}" stroke="${PALETTE.annotPurple}" stroke-width="3"/>
        <polygon points="${boxX - 50},${y + seg.h - 15} ${boxX - 58},${y + seg.h - 28} ${boxX - 42},${y + seg.h - 28}" fill="${PALETTE.annotPurple}"/>
        <foreignObject x="${boxX - 200}" y="${y + 30}" width="140" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 14px 'Noto Sans Arabic',system-ui;color:${PALETTE.annotPurple};direction:rtl;text-align:left;">ينمو للأسفل<br/><span style="font-family:'Segoe UI',system-ui;font-weight:400;font-size:12px;">grows down</span></div></foreignObject>
      ` : ''}
      ${seg.arrow === 'up' ? `
        <line x1="${boxX - 50}" y1="${y + seg.h - 20}" x2="${boxX - 50}" y2="${y + 20}" stroke="${PALETTE.annotBlue}" stroke-width="3"/>
        <polygon points="${boxX - 50},${y + 15} ${boxX - 58},${y + 28} ${boxX - 42},${y + 28}" fill="${PALETTE.annotBlue}"/>
        <foreignObject x="${boxX - 200}" y="${y + 30}" width="140" height="50"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 14px 'Noto Sans Arabic',system-ui;color:${PALETTE.annotBlue};direction:rtl;text-align:left;">ينمو للأعلى<br/><span style="font-family:'Segoe UI',system-ui;font-weight:400;font-size:12px;">grows up</span></div></foreignObject>
      ` : ''}
    `;
    y += seg.h;
  });

  // عناوين العناوين
  const addrLabels = `
    <text x="${boxX - 8}" y="180" text-anchor="end" font-size="14" fill="${PALETTE.text}" font-weight="600" font-family="monospace">High Address</text>
    <text x="${boxX - 8}" y="${y - 5}" text-anchor="end" font-size="14" fill="${PALETTE.text}" font-weight="600" font-family="monospace">0x00000000</text>
  `;

  const inner = `
    ${svgHeader('تخطيط الذاكرة', 'Memory Layout')}
    ${segmentsSvg}
    ${addrLabels}
    ${svgKeyFeatures([
      { ar: 'Stack ينمو من العنوان الأعلى للأسفل', en: 'Stack grows downward from high address', icon: '↓' },
      { ar: 'Heap ينمو من الأسفل للأعلى', en: 'Heap grows upward', icon: '↑' },
      { ar: 'Text segment للقراءة فقط (read-only)', en: 'Text segment is read-only', icon: '🔒' },
      { ar: 'Stack overflow عند تصادم Stack مع Heap', en: 'Stack overflow when stack meets heap', icon: '⚠' },
    ])}
  `;
  return svgWrap(inner);
}

// 10) جدول الصفحات Page Table
function chartPageTable() {
  // العنوان الافتراضي: 16-bit (4-bit page number + 12-bit offset)
  const inner = `
    ${svgHeader('جدول الصفحات', 'Page Table')}

    <!-- العنوان الافتراضي -->
    <foreignObject x="80" y="180" width="900" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 20px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">العنوان الافتراضي / Virtual Address (16-bit)</div></foreignObject>

    <rect x="200" y="240" width="220" height="60" fill="${PALETTE.bgPurpleVeryLite}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <foreignObject x="200" y="240" width="220" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 18px 'Noto Sans Arabic',system-ui;direction:rtl;">رقم الصفحة</div>
      <div style="font:600 14px 'Segoe UI',system-ui;">VPN (4 bits)</div>
      <div style="font:700 22px monospace;color:${PALETTE.bgPurpleDeep};margin-top:2px;">0011</div>
    </div></foreignObject>

    <rect x="420" y="240" width="320" height="60" fill="${PALETTE.bgBlueVeryLite}" stroke="${PALETTE.annotBlue}" stroke-width="2.5"/>
    <foreignObject x="420" y="240" width="320" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 18px 'Noto Sans Arabic',system-ui;direction:rtl;">الإزاحة</div>
      <div style="font:600 14px 'Segoe UI',system-ui;">Offset (12 bits)</div>
      <div style="font:700 18px monospace;color:${PALETTE.annotBlue};margin-top:2px;">000010101100</div>
    </div></foreignObject>

    <!-- سهم نزولاً إلى Page Table -->
    <line x1="310" y1="310" x2="310" y2="360" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <polygon points="310,365 302,353 318,353" fill="${PALETTE.bgPurpleDeep}"/>

    <!-- جدول الصفحات -->
    <rect x="200" y="370" width="380" height="280" fill="white" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <foreignObject x="200" y="375" width="380" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">جدول الصفحات / Page Table</div></foreignObject>
    <line x1="200" y1="415" x2="580" y2="415" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1.5"/>
    <line x1="390" y1="415" x2="390" y2="650" stroke="${PALETTE.bgPurpleDeep}" stroke-width="1"/>

    <!-- رؤوس الأعمدة -->
    <text x="295" y="438" text-anchor="middle" font-size="14" font-weight="700" fill="${PALETTE.bgPurpleDeep}">VPN</text>
    <text x="485" y="438" text-anchor="middle" font-size="14" font-weight="700" fill="${PALETTE.bgPurpleDeep}">Frame #</text>

    <!-- صفوف الجدول -->
    ${[
      { vpn: '0000', frame: '0101' },
      { vpn: '0001', frame: '1011' },
      { vpn: '0010', frame: '0001' },
      { vpn: '0011', frame: '0111', highlight: true },
      { vpn: '0100', frame: '1100' },
      { vpn: '0101', frame: '0010' },
    ].map((row, i) => {
      const y = 460 + i * 30;
      const bg = row.highlight ? `<rect x="200" y="${y - 18}" width="380" height="28" fill="${PALETTE.bgPurpleVeryLite}"/>` : '';
      const wt = row.highlight ? '700' : '500';
      const color = row.highlight ? PALETTE.bgPurpleDeep : PALETTE.text;
      return `${bg}<text x="295" y="${y}" text-anchor="middle" font-size="15" font-weight="${wt}" fill="${color}" font-family="monospace">${row.vpn}</text><text x="485" y="${y}" text-anchor="middle" font-size="15" font-weight="${wt}" fill="${color}" font-family="monospace">${row.frame}</text>`;
    }).join('')}

    <!-- سهم من الجدول إلى Physical Address -->
    <line x1="580" y1="490" x2="700" y2="490" stroke="${PALETTE.annotPurple}" stroke-width="2.5"/>
    <polygon points="705,490 693,484 693,496" fill="${PALETTE.annotPurple}"/>

    <!-- العنوان الفيزيائي -->
    <rect x="700" y="430" width="280" height="120" fill="${PALETTE.boxBg}" stroke="${PALETTE.annotPurple}" stroke-width="2.5" rx="8"/>
    <foreignObject x="700" y="440" width="280" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 16px 'Noto Sans Arabic',system-ui;direction:rtl;">العنوان الفيزيائي</div>
      <div style="font:600 14px 'Segoe UI',system-ui;color:${PALETTE.textMuted};">Physical Address</div>
      <div style="font:700 16px monospace;color:${PALETTE.annotPurple};margin-top:8px;">0111 | 000010101100</div>
      <div style="font:500 12px 'Segoe UI',system-ui;color:${PALETTE.textMuted};margin-top:4px;">Frame # | Offset</div>
    </div></foreignObject>

    ${svgKeyFeatures([
      { ar: 'العنوان الافتراضي = VPN + Offset', en: 'Virtual Address = VPN + Offset', icon: '⚄' },
      { ar: 'جدول الصفحات يربط VPN بـ Frame #', en: 'Page table maps VPN to Frame #', icon: '⇄' },
      { ar: 'الـ Offset لا يتغير في الترجمة', en: 'Offset stays unchanged in translation', icon: '=' },
      { ar: 'يُمكّن الذاكرة الافتراضية والحماية', en: 'Enables virtual memory and protection', icon: '🔐' },
    ])}
  `;
  return svgWrap(inner);
}

// =============================================================
// مخططات بايثون (Python)
// =============================================================

// 11) قائمة بايثون Python List
function chartPythonList() {
  const items = ['"apple"', '"banana"', '42', '3.14', '"hello"', 'True'];
  const startX = 140, y = 320, cellW = 130, cellH = 80;

  let cells = '';
  let indices = '';
  let negIndices = '';
  items.forEach((item, i) => {
    const x = startX + i * cellW;
    const colors = [PALETTE.bgBlueLite, PALETTE.bgPurpleVeryLite, PALETTE.bgPurpleLite, PALETTE.bgPurple, PALETTE.bgPurpleDeep, PALETTE.bgBlueLite];
    cells += `
      <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${colors[i % colors.length]}" opacity="0.85" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
      <text x="${x + cellW/2}" y="${y + cellH/2 + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="white" font-family="monospace" style="text-shadow:0 1px 2px rgba(0,0,0,0.3);">${item}</text>
    `;
    // Index موجب فوق
    indices += `<text x="${x + cellW/2}" y="${y - 15}" text-anchor="middle" font-size="20" font-weight="700" fill="${PALETTE.bgPurpleDeep}">${i}</text>`;
    // Index سالب تحت
    const neg = -(items.length - i);
    negIndices += `<text x="${x + cellW/2}" y="${y + cellH + 35}" text-anchor="middle" font-size="20" font-weight="700" fill="${PALETTE.annotPurple}">${neg}</text>`;
  });

  // التسميات
  const labels = `
    <text x="${startX - 80}" y="${y - 15}" text-anchor="end" font-size="16" fill="${PALETTE.bgPurpleDeep}" font-weight="600" direction="rtl">Index موجب</text>
    <text x="${startX - 80}" y="${y + cellH + 35}" text-anchor="end" font-size="16" fill="${PALETTE.annotPurple}" font-weight="600" direction="rtl">Index سالب</text>
  `;

  // أمثلة على الوصول
  const examples = `
    <rect x="100" y="500" width="880" height="130" rx="10" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <foreignObject x="110" y="510" width="860" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">أمثلة على الوصول / Access Examples</div></foreignObject>
    <line x1="120" y1="550" x2="960" y2="550" stroke="${PALETTE.boxBorder}" stroke-width="1"/>
    ${[
      { code: 'list[0]',  result: '"apple"',   ar: 'العنصر الأول' },
      { code: 'list[-1]', result: 'True',      ar: 'العنصر الأخير' },
      { code: 'list[2]',  result: '42',        ar: 'الفهرس الثاني' },
      { code: 'len(list)', result: '6',        ar: 'طول القائمة' },
    ].map((ex, i) => {
      const x = 130 + (i % 4) * 220;
      return `
        <text x="${x}" y="585" font-size="15" font-weight="700" fill="${PALETTE.bgPurpleDeep}" font-family="monospace">${ex.code}</text>
        <text x="${x}" y="608" font-size="14" fill="${PALETTE.text}" font-family="monospace">→ ${ex.result}</text>
      `;
    }).join('')}
  `;

  const code = `
    <rect x="100" y="180" width="880" height="80" rx="10" fill="#1F2937" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
    <foreignObject x="110" y="195" width="860" height="60"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 18px monospace;color:#E5E7EB;direction:ltr;text-align:left;line-height:1.4;">my_list = <span style="color:#FCD34D;">[</span><span style="color:#86EFAC;">"apple", "banana"</span>, <span style="color:#FBBF24;">42, 3.14</span>, <span style="color:#86EFAC;">"hello"</span>, <span style="color:#F472B6;">True</span><span style="color:#FCD34D;">]</span></div></foreignObject>
  `;

  const inner = `
    ${svgHeader('قائمة بايثون', 'Python List')}
    ${code}
    ${cells}
    ${indices}
    ${negIndices}
    ${labels}
    ${examples}
    ${svgKeyFeatures([
      { ar: 'مجموعة مرتبة قابلة للتعديل', en: 'Ordered, mutable collection', icon: '[]' },
      { ar: 'تستوعب أنواع بيانات مختلفة', en: 'Holds heterogeneous types', icon: '⚏' },
      { ar: 'الفهرسة موجبة (0, 1, ...) أو سالبة (-1)', en: 'Positive (0,1...) or negative (-1) indexing', icon: '#' },
      { ar: 'قابلة للقص (slicing): list[1:4]', en: 'Slicing: list[start:end]', icon: '⋮' },
    ])}
  `;
  return svgWrap(inner);
}

// 12) قاموس بايثون Python Dictionary
function chartPythonDict() {
  const pairs = [
    { key: '"name"',    value: '"Atif"',          color: PALETTE.bgPurpleDeep },
    { key: '"age"',     value: '35',              color: PALETTE.bgPurple },
    { key: '"job"',     value: '"HR Manager"',    color: PALETTE.bgPurpleLite },
    { key: '"city"',    value: '"Jeddah"',        color: PALETTE.bgBlueLite },
    { key: '"active"',  value: 'True',            color: PALETTE.annotPurple },
  ];

  const startY = 280, rowH = 70;

  let rows = '';
  pairs.forEach((p, i) => {
    const y = startY + i * rowH;
    rows += `
      <!-- Key -->
      <rect x="200" y="${y}" width="220" height="${rowH - 10}" rx="6" fill="${p.color}" opacity="0.85" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
      <text x="310" y="${y + (rowH - 10)/2 + 7}" text-anchor="middle" font-size="18" font-weight="700" fill="white" font-family="monospace" style="text-shadow:0 1px 2px rgba(0,0,0,0.3);">${p.key}</text>

      <!-- سهم → -->
      <line x1="425" y1="${y + (rowH - 10)/2}" x2="555" y2="${y + (rowH - 10)/2}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
      <polygon points="560,${y + (rowH - 10)/2} 548,${y + (rowH - 10)/2 - 6} 548,${y + (rowH - 10)/2 + 6}" fill="${PALETTE.bgPurpleDeep}"/>

      <!-- Value -->
      <rect x="565" y="${y}" width="280" height="${rowH - 10}" rx="6" fill="white" stroke="${p.color}" stroke-width="2.5"/>
      <text x="705" y="${y + (rowH - 10)/2 + 7}" text-anchor="middle" font-size="18" font-weight="700" fill="${p.color}" font-family="monospace">${p.value}</text>

      <!-- نوع القيمة -->
      <text x="870" y="${y + (rowH - 10)/2 + 5}" text-anchor="start" font-size="13" fill="${PALETTE.textMuted}" font-family="monospace">(${typeof JSON.parse(p.value.replace(/^"|"$/g, '"').replace(/True/g, 'true').replace(/False/g, 'false'))})</text>
    `;
  });

  // تسميات الأعمدة
  const headers = `
    <text x="310" y="265" text-anchor="middle" font-size="20" font-weight="700" fill="${PALETTE.bgPurpleDeep}">Key</text>
    <text x="705" y="265" text-anchor="middle" font-size="20" font-weight="700" fill="${PALETTE.bgPurpleDeep}">Value</text>
    <foreignObject x="240" y="240" width="140" height="22"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 14px 'Noto Sans Arabic',system-ui;color:${PALETTE.textMuted};text-align:center;direction:rtl;">المفتاح</div></foreignObject>
    <foreignObject x="635" y="240" width="140" height="22"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 14px 'Noto Sans Arabic',system-ui;color:${PALETTE.textMuted};text-align:center;direction:rtl;">القيمة</div></foreignObject>
  `;

  const code = `
    <rect x="100" y="180" width="880" height="50" rx="10" fill="#1F2937" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
    <foreignObject x="110" y="190" width="860" height="35"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 16px monospace;color:#E5E7EB;direction:ltr;text-align:left;">person = <span style="color:#FCD34D;">{</span><span style="color:#86EFAC;">"name"</span>: <span style="color:#86EFAC;">"Atif"</span>, <span style="color:#86EFAC;">"age"</span>: <span style="color:#FBBF24;">35</span>, <span style="color:#86EFAC;">"job"</span>: <span style="color:#86EFAC;">"HR Manager"</span><span style="color:#FCD34D;">}</span></div></foreignObject>
  `;

  const inner = `
    ${svgHeader('قاموس بايثون', 'Python Dictionary')}
    ${code}
    ${headers}
    ${rows}
    ${svgKeyFeatures([
      { ar: 'مجموعة من أزواج (مفتاح: قيمة)', en: 'Collection of (key: value) pairs', icon: '⚏' },
      { ar: 'الوصول عبر المفتاح: dict[key]', en: 'Access by key: dict[key]', icon: '🔑' },
      { ar: 'المفاتيح فريدة وغير قابلة للتغيير', en: 'Keys are unique and immutable', icon: '#' },
      { ar: 'سرعة O(1) في البحث والإدراج', en: 'O(1) lookup and insertion', icon: '⚡' },
    ])}
  `;
  return svgWrap(inner);
}

// 13) تدفق الدالة Function Flow
function chartFunctionFlow() {
  const inner = `
    ${svgHeader('تدفق الدالة', 'Function Flow')}

    <!-- Input -->
    <rect x="80" y="280" width="200" height="120" rx="60" fill="${PALETTE.bgBlueLite}" stroke="${PALETTE.annotBlue}" stroke-width="3"/>
    <foreignObject x="80" y="280" width="200" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 22px 'Noto Sans Arabic',system-ui;direction:rtl;">المدخلات</div>
      <div style="font:600 18px 'Segoe UI',system-ui;color:${PALETTE.text};">Input</div>
      <div style="font:600 14px monospace;color:${PALETTE.annotBlue};margin-top:8px;">x, y</div>
    </div></foreignObject>

    <!-- سهم -->
    <line x1="280" y1="340" x2="400" y2="340" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
    <polygon points="405,340 393,333 393,347" fill="${PALETTE.bgPurpleDeep}"/>

    <!-- Function box -->
    <rect x="400" y="240" width="280" height="200" rx="14" fill="${PALETTE.bgPurple}" opacity="0.9" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
    <foreignObject x="400" y="240" width="280" height="200"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.4);">
      <div style="font:700 24px 'Noto Sans Arabic',system-ui;direction:rtl;">الدالة</div>
      <div style="font:700 22px 'Segoe UI',system-ui;">Function</div>
      <div style="font:600 16px monospace;margin-top:14px;background:rgba(0,0,0,0.25);padding:6px 14px;border-radius:6px;">def add(x, y):</div>
      <div style="font:600 16px monospace;margin-top:6px;background:rgba(0,0,0,0.25);padding:6px 14px;border-radius:6px;">return x + y</div>
    </div></foreignObject>

    <!-- سهم -->
    <line x1="680" y1="340" x2="800" y2="340" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
    <polygon points="805,340 793,333 793,347" fill="${PALETTE.bgPurpleDeep}"/>

    <!-- Output -->
    <rect x="800" y="280" width="200" height="120" rx="60" fill="${PALETTE.bgPurpleLite}" stroke="${PALETTE.annotPurple}" stroke-width="3"/>
    <foreignObject x="800" y="280" width="200" height="120"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 22px 'Noto Sans Arabic',system-ui;direction:rtl;">المخرجات</div>
      <div style="font:600 18px 'Segoe UI',system-ui;">Output</div>
      <div style="font:600 14px monospace;color:${PALETTE.annotPurple};margin-top:8px;">x + y</div>
    </div></foreignObject>

    <!-- مثال -->
    <rect x="80" y="500" width="920" height="160" rx="14" fill="${PALETTE.boxBg}" stroke="${PALETTE.boxBorder}" stroke-width="2"/>
    <foreignObject x="90" y="510" width="900" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 18px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurpleDeep};text-align:center;direction:rtl;">مثال على الاستخدام / Usage Example</div></foreignObject>
    <line x1="100" y1="550" x2="980" y2="550" stroke="${PALETTE.boxBorder}" stroke-width="1"/>

    <foreignObject x="110" y="560" width="430" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 16px monospace;color:${PALETTE.text};direction:ltr;text-align:left;line-height:1.7;background:#1F2937;color:#E5E7EB;padding:14px;border-radius:8px;">
      <div><span style="color:#A78BFA;">def</span> <span style="color:#FBBF24;">add</span>(<span style="color:#86EFAC;">x</span>, <span style="color:#86EFAC;">y</span>):</div>
      <div>&#160;&#160;&#160;&#160;<span style="color:#A78BFA;">return</span> x + y</div>
      <div style="margin-top:6px;">result = <span style="color:#FBBF24;">add</span>(<span style="color:#FBBF24;">3</span>, <span style="color:#FBBF24;">5</span>)</div>
      <div><span style="color:#FCA5A5;">print</span>(result)  <span style="color:#94A3B8;"># 8</span></div>
    </div></foreignObject>

    <foreignObject x="560" y="560" width="430" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font:500 16px 'Noto Sans Arabic',system-ui;color:${PALETTE.text};direction:rtl;text-align:right;line-height:1.7;padding:6px;">
      <div>1. تستقبل الدالة معاملين (<span style="color:${PALETTE.bgPurpleDeep};font-weight:700;">x, y</span>)</div>
      <div>2. تُجري عملية الجمع داخلياً</div>
      <div>3. تُرجع نتيجة الجمع عبر <span style="color:${PALETTE.annotPurple};font-weight:700;font-family:monospace;">return</span></div>
      <div>4. النتيجة تُسند إلى المتغير <span style="color:${PALETTE.bgPurpleDeep};font-weight:700;font-family:monospace;">result</span></div>
    </div></foreignObject>

    ${svgKeyFeatures([
      { ar: 'الدالة كتلة من الكود قابلة لإعادة الاستخدام', en: 'Reusable block of code', icon: 'fn' },
      { ar: 'تستقبل معاملات (parameters) وتُرجع قيمة', en: 'Takes parameters, returns value', icon: '⤳' },
      { ar: 'تُعرَّف بـ def وتُنفَّذ بـ call', en: 'Defined with def, executed via call', icon: '()' },
      { ar: 'تجعل الكود أنظف وأسهل في الصيانة', en: 'Makes code cleaner and maintainable', icon: '✓' },
    ])}
  `;
  return svgWrap(inner);
}

// 14) مخطط الشرط If-Else
function chartIfElseFlow() {
  const inner = `
    ${svgHeader('مخطط الشرط', 'If-Else Flowchart')}

    <!-- Start -->
    <ellipse cx="540" cy="200" rx="80" ry="35" fill="${PALETTE.bgPurpleDeep}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
    <text x="540" y="207" text-anchor="middle" font-size="20" font-weight="700" fill="white">Start / بداية</text>

    <!-- خط -->
    <line x1="540" y1="235" x2="540" y2="280" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <polygon points="540,285 533,273 547,273" fill="${PALETTE.bgPurpleDeep}"/>

    <!-- Decision diamond -->
    <polygon points="540,290 700,395 540,500 380,395" fill="${PALETTE.bgPurpleVeryLite}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="3"/>
    <foreignObject x="380" y="350" width="320" height="90"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:${PALETTE.text};">
      <div style="font:700 18px 'Noto Sans Arabic',system-ui;direction:rtl;">هل الشرط صحيح؟</div>
      <div style="font:600 16px 'Segoe UI',system-ui;color:${PALETTE.textMuted};">Is condition true?</div>
      <div style="font:700 14px monospace;color:${PALETTE.bgPurpleDeep};margin-top:4px;">if x &gt; 10:</div>
    </div></foreignObject>

    <!-- True path يسار -->
    <line x1="380" y1="395" x2="220" y2="395" stroke="${PALETTE.bgPurple}" stroke-width="2.5"/>
    <polygon points="215,395 227,388 227,402" fill="${PALETTE.bgPurple}"/>
    <text x="300" y="385" text-anchor="middle" font-size="16" font-weight="700" fill="${PALETTE.bgPurple}">True ✓</text>
    <foreignObject x="260" y="402" width="100" height="22"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 13px 'Noto Sans Arabic',system-ui;color:${PALETTE.bgPurple};text-align:center;direction:rtl;">صحيح</div></foreignObject>

    <!-- False path يمين -->
    <line x1="700" y1="395" x2="860" y2="395" stroke="${PALETTE.annotPurple}" stroke-width="2.5"/>
    <polygon points="865,395 853,388 853,402" fill="${PALETTE.annotPurple}"/>
    <text x="780" y="385" text-anchor="middle" font-size="16" font-weight="700" fill="${PALETTE.annotPurple}">False ✗</text>
    <foreignObject x="730" y="402" width="100" height="22"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 13px 'Noto Sans Arabic',system-ui;color:${PALETTE.annotPurple};text-align:center;direction:rtl;">خطأ</div></foreignObject>

    <!-- صندوق if (يسار) -->
    <rect x="80" y="445" width="260" height="100" rx="10" fill="${PALETTE.bgPurple}" opacity="0.85" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <foreignObject x="80" y="445" width="260" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3);">
      <div style="font:700 20px 'Noto Sans Arabic',system-ui;direction:rtl;">نفّذ كتلة if</div>
      <div style="font:600 14px monospace;margin-top:6px;background:rgba(0,0,0,0.25);padding:4px 10px;border-radius:4px;">print("Big")</div>
    </div></foreignObject>

    <!-- صندوق else (يمين) -->
    <rect x="740" y="445" width="260" height="100" rx="10" fill="${PALETTE.annotPurple}" opacity="0.85" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <foreignObject x="740" y="445" width="260" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3);">
      <div style="font:700 20px 'Noto Sans Arabic',system-ui;direction:rtl;">نفّذ كتلة else</div>
      <div style="font:600 14px monospace;margin-top:6px;background:rgba(0,0,0,0.25);padding:4px 10px;border-radius:4px;">print("Small")</div>
    </div></foreignObject>

    <!-- خطوط للـ end -->
    <line x1="210" y1="545" x2="210" y2="640" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="210" y1="640" x2="540" y2="640" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="870" y1="545" x2="870" y2="640" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="870" y1="640" x2="540" y2="640" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <line x1="540" y1="640" x2="540" y2="690" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2.5"/>
    <polygon points="540,695 533,683 547,683" fill="${PALETTE.bgPurpleDeep}"/>

    <!-- End -->
    <ellipse cx="540" cy="730" rx="80" ry="35" fill="${PALETTE.bgPurpleDeep}" stroke="${PALETTE.bgPurpleDeep}" stroke-width="2"/>
    <text x="540" y="737" text-anchor="middle" font-size="20" font-weight="700" fill="white">End / نهاية</text>

    ${svgKeyFeatures([
      { ar: 'يفحص شرطاً ويختار مساراً واحداً', en: 'Checks condition, picks one branch', icon: '?' },
      { ar: 'if: ينفّذ إذا كان الشرط صحيحاً', en: 'if: executes when condition is True', icon: '✓' },
      { ar: 'else: ينفّذ إذا كان الشرط خاطئاً', en: 'else: executes when condition is False', icon: '✗' },
      { ar: 'يمكن استخدام elif لشروط متعددة', en: 'Use elif for multiple conditions', icon: '⋮' },
    ])}
  `;
  return svgWrap(inner);
}


// =============================================================
// نظام الكشف عن نوع المخطط من رسالة المستخدم
// =============================================================
function detectChartType(query) {
  const q = (query || '').toLowerCase();
  const tests = [
    // الإحصاء
    { type: 'histogram',           keywords: ['مدرج تكراري', 'مدرج التكراري', 'هيستوغرام', 'histogram', 'مدرّج'] },
    { type: 'normal_distribution', keywords: ['توزيع طبيعي', 'التوزيع الطبيعي', 'منحنى الجرس', 'منحنى جرس', 'bell curve', 'normal distribution', 'جرسي'] },
    { type: 'scatter_plot',        keywords: ['مخطط الانتشار', 'مخطط انتشار', 'scatter', 'plot الانتشار', 'انتشار'] },
    { type: 'z_score',             keywords: ['z-score', 'z score', 'الدرجة المعيارية', 'z value', 'درجة معيارية'] },
    { type: 'linear_regression',   keywords: ['الانحدار الخطي', 'انحدار خطي', 'linear regression', 'خط الانحدار'] },
    { type: 'box_plot',            keywords: ['مخطط الصندوق', 'box plot', 'boxplot', 'الصندوق والشعيرات', 'box-and-whisker', 'صندوقي'] },

    // نظم التشغيل
    { type: 'process_states',      keywords: ['حالات العملية', 'حالات المعالجة', 'process states', 'process state', 'دورة حياة العملية', 'process diagram'] },
    { type: 'round_robin',         keywords: ['round robin', 'rr', 'دائرية', 'دوائري', 'gantt', 'مخطط جانت', 'جدولة دائرية', 'round-robin', 'gantt chart', 'الجدولة الدوائرية'] },
    { type: 'memory_layout',       keywords: ['تخطيط الذاكرة', 'بنية الذاكرة', 'memory layout', 'stack heap', 'مخطط الذاكرة', 'memory segments', 'stack and heap', 'الكومة والمكدس'] },
    { type: 'page_table',          keywords: ['جدول الصفحات', 'page table', 'ترجمة العناوين', 'address translation', 'الذاكرة الافتراضية', 'virtual memory', 'paging'] },

    // بايثون
    { type: 'python_list',         keywords: ['python list', 'قائمة بايثون', 'list في بايثون', 'ارسم list', 'ارسم القائمة', 'الفهرسة في بايثون', 'list indexing'] },
    { type: 'python_dict',         keywords: ['python dict', 'قاموس بايثون', 'dictionary بايثون', 'ارسم dict', 'ارسم القاموس', 'key value', 'مفتاح قيمة'] },
    { type: 'function_flow',       keywords: ['تدفق الدالة', 'دالة بايثون', 'function flow', 'ارسم دالة', 'function diagram', 'كيف تعمل الدالة', 'parameters return'] },
    { type: 'if_else_flow',        keywords: ['if else', 'if-else', 'مخطط الشرط', 'flowchart', 'مخطط تدفق', 'ارسم if', 'ارسم شرط', 'الجملة الشرطية', 'conditional flow'] },
  ];
  for (const t of tests) {
    if (t.keywords.some(k => q.includes(k))) return t.type;
  }
  return null;
}

function buildSVGForType(type) {
  switch (type) {
    // إحصاء
    case 'histogram':           return chartHistogram();
    case 'normal_distribution': return chartNormalDistribution();
    case 'scatter_plot':        return chartScatterPlot();
    case 'z_score':             return chartZScore(1.5);
    case 'linear_regression':   return chartLinearRegression();
    case 'box_plot':            return chartBoxPlot();
    // نظم التشغيل
    case 'process_states':      return chartProcessStates();
    case 'round_robin':         return chartGanttRoundRobin();
    case 'memory_layout':       return chartMemoryLayout();
    case 'page_table':          return chartPageTable();
    // بايثون
    case 'python_list':         return chartPythonList();
    case 'python_dict':         return chartPythonDict();
    case 'function_flow':       return chartFunctionFlow();
    case 'if_else_flow':        return chartIfElseFlow();
    default: return null;
  }
}

function wantsDrawing(question) {
  const q = question || '';
  return /ارسم|صورة|رسم بياني|مخطط|أرني|أظهر|رسماً|رسم|اعرض|draw|plot|chart|graph|visualize|تخيل|اعطني صورة|أعطني صورة|paint|illustrate|sketch|diagram/i.test(q);
}

// =============================================================
// محرك توليد الصور عبر Cloudflare Workers AI
// نستخدم flux-1-schnell (أرخص بـ 60% من flux-2) + Llama 3.1 8B
// لـ helpers (أرخص بـ 6 أضعاف من 70B) لتقليل استهلاك neurons
// =============================================================

const HELPER_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'; // 4119 in / 34868 out (vs 26668 / 204805 للـ 70B)

// كاشف الطلبات الغامضة
function isAmbiguousDrawing(userMessage) {
  const m = userMessage.trim();
  const veryShort = /^(ارسم|ارسمه|ارسمها|ارسم لي|ارسم ذلك|ارسم هذا|اعرضه|اظهرها|أرني|draw|draw it|draw that|show me)\.?\s*$/i.test(m);
  const hasOnlyPronoun = /\bhذا\b|\bذلك\b|\bتلك\b|\bهذه\b/.test(m) && m.length < 25;
  return veryShort || hasOnlyPronoun;
}

// =============================================================
// دالة موحّدة: ترجع {topic, imagePrompt, labels} باستدعاء واحد
// بدلاً من 3 استدعاءات منفصلة. توفير ~75% من neurons المساعدات.
// =============================================================
async function prepareDrawingArtifacts(env, userMessage, history, subjectName, subjectContent) {
  // نختصر المنهج المرسل من 3000 إلى 1500 حرف لتوفير input neurons
  const curriculumSnippet = subjectContent ? subjectContent.slice(0, 1500) : '';
  const ctx = (history || []).slice(-3).map(h => `${h.role === 'user' ? 'الطالب' : 'المساعد'}: ${(h.content || '').slice(0, 200)}`).join('\n');

  const systemPrompt = `أنت مساعد علمي يحضّر مواد رسم تعليمي. تستلم طلب رسم من طالب وتعيد JSON واحداً يحوي 3 حقول.

قواعد:
1. حل أي ضمير ("ارسمه"، "ارسم ذلك") من السياق المُعطى لاستخراج الموضوع الفعلي.
2. إذا كان الموضوع غامضاً تماماً (لا يوجد سياق ولا تحديد)، أعد topic = "AMBIGUOUS".
3. لا تخمّن. لا تخترع موضوعات غير موجودة في السياق.

أعد JSON صالحاً فقط، بدون أي نص خارج JSON. التنسيق:
{
  "topic": "الموضوع المحدد بالعربية",
  "imagePrompt": "English image generation prompt, 100-200 words, scientifically accurate. Must end with: 'absolutely no axis labels with words, no titles, no English words anywhere, only allowed text are small white circles each containing one digit 1 to 10 with thin black leader lines'",
  "labels": "1. الاسم العربي (English Term): شرح موجز.\\n2. ...\\n... حتى 10 عناصر"
}

${curriculumSnippet ? `المنهج المرجعي للدقة التقنية:\n${curriculumSnippet}\n` : ''}

مثال:
السياق:
الطالب: ما هو التوزيع الطبيعي؟
المساعد: التوزيع الطبيعي توزيع احتمالي متماثل...
الطلب الحالي: ارسمه

الإخراج:
{"topic":"التوزيع الطبيعي","imagePrompt":"Clean educational illustration of a normal distribution bell curve, smooth symmetric blue curve filled with light blue gradient, three pairs of vertical dashed lines marking standard deviation positions, white background, mathematical textbook style, small white circles each containing one digit 1 through 10 with thin black leader lines pointing to peak inflection points and standard deviation marks, absolutely no axis labels with words, no titles, no English words anywhere, only allowed text are small white circles each containing one digit 1 to 10 with thin black leader lines","labels":"1. منحنى الجرس (Bell Curve): الشكل المتماثل للتوزيع.\\n2. المتوسط (Mean μ): قيمة الذروة.\\n3. الانحراف المعياري (Standard Deviation σ): مقياس التشتت.\\n4. الانحراف الأول (1σ): يحتوي 68% من البيانات.\\n5. الانحراف الثاني (2σ): يحتوي 95% من البيانات.\\n6. الانحراف الثالث (3σ): يحتوي 99.7% من البيانات.\\n7. التماثل (Symmetry): توزيع متناظر حول المتوسط.\\n8. الذيول (Tails): النهايتان الممتدتان للمنحنى.\\n9. التباين (Variance σ²): مربع الانحراف المعياري.\\n10. الالتواء (Skewness): يساوي صفر للتوزيع الطبيعي."}`;

  try {
    const llmResult = await callTextLLM(env, HELPER_MODEL, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `المادة: ${subjectName}\n\nالسياق:\n${ctx || '(لا يوجد سياق سابق)'}\n\nالطلب الحالي: ${userMessage}\n\nأعد JSON فقط:` }
    ], { max_tokens: 900, temperature: 0.1 });

    let raw = (llmResult.text || '').trim();
    if (!raw) return { error: 'empty_response' };
    // استخراج JSON من النص (قد يحوي preamble رغم التعليمات)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: 'no_json' };

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // محاولة إصلاح الـ JSON البسيطة
      try {
        parsed = JSON.parse(jsonMatch[0].replace(/\n/g, '\\n').replace(/\r/g, ''));
      } catch (e2) {
        return { error: 'invalid_json' };
      }
    }

    if (!parsed.topic) return { error: 'no_topic_field' };
    if (parsed.topic === 'AMBIGUOUS') {
      // تحقق إضافي: إذا كانت الرسالة الأصلية فيها كلمة مفتاحية واضحة، تجاهل AMBIGUOUS
      // (يحدث أحياناً أن LLM يخطئ في تصنيف الطلبات الواضحة)
      const clearKeywords = /توزيع|مدرج|تشريح|خوارزمية|دالة|كود|عملية|نظام|خلية|قلب|دماغ|رئة|كبد|معدة/;
      if (clearKeywords.test(userMessage)) {
        // الطلب فيه كلمة محددة - استخدمها كـ topic
        return {
          topic: userMessage.replace(/^(ارسم لي|ارسم|اعرض|أرني)\s+/i, '').trim(),
          imagePrompt: parsed.imagePrompt || null,
          labels: filterForeignScripts(parsed.labels || '')
        };
      }
      return { ambiguous: true };
    }

    // safety net: نتأكد من وجود الجملة الواقية في الـ prompt
    let imgPrompt = parsed.imagePrompt || '';
    if (!/no axis labels with words|no English words anywhere/i.test(imgPrompt)) {
      imgPrompt += ', absolutely no axis labels with words, no titles, no English words anywhere, only allowed text are small white circles each containing one digit 1 to 10 with thin black leader lines';
    }

    // تنظيف labels من الـ filtering
    let labels = filterForeignScripts(parsed.labels || '');

    return {
      topic: parsed.topic,
      imagePrompt: imgPrompt.slice(0, 1800),
      labels: labels
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function generateImage(env, prompt) {
  // المحاولة الأولى: Cloudflare flux-1-schnell (سريع، ~43 neurons)
  try {
    const resp = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: prompt.slice(0, 2048),
      steps: 4,
      seed: Math.floor(Math.random() * 1000000)
    });
    if (resp.image) return { source: 'cloudflare', image: resp.image };
  } catch (err) {
    // إذا فشل (مثل تجاوز الكوتا 4006)، نتحول للـ fallback
    console.log('Cloudflare image failed, falling back:', err.message);
  }

  // Fallback: Pollinations.ai (مجاني تماماً، بدون مفتاح، بدون حدود)
  try {
    const cleanPrompt = encodeURIComponent(prompt.slice(0, 1500));
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;

    const resp = await fetch(url, {
      headers: { 'Accept': 'image/jpeg' }
    });

    if (!resp.ok) {
      console.log('Pollinations failed:', resp.status);
      return { source: 'failed', image: null };
    }

    const arrayBuf = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
    }
    return { source: 'pollinations', image: btoa(binary) };
  } catch (err) {
    console.log('Pollinations error:', err.message);
    return { source: 'failed', image: null };
  }
}

// =============================================================
// Wrapper مع 4 طبقات fallback للنصوص (مرتبة بالأكثر استقراراً):
//   1. Cloudflare Workers AI — الأسرع (يفشل عند نفاد الكوتا)
//   2. Pollinations.ai مباشر — مجاني، بدون مفتاح، الأكثر استقراراً
//   3. zad-proxy — chain خاص به (احتياط)
//   4. Google Gemini API — مجاني 1500/يوم (إذا env.GEMINI_API_KEY)
// =============================================================

// fetch مع timeout للحؤول دون تعليق طويل
async function fetchTimeout(url, opts, ms = 25000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(tid);
  }
}

async function callTextLLM(env, model, messages, options = {}) {
  // ━━━━━━━━━━ الطبقة 1: Cloudflare Workers AI ━━━━━━━━━━
  try {
    const resp = await env.AI.run(model, {
      messages,
      max_tokens: options.max_tokens || 800,
      temperature: options.temperature ?? 0.2,
      top_p: options.top_p || 0.9
    });
    const text = resp.response || resp.result?.response || '';
    if (text) return { source: 'cloudflare', text };
    throw new Error('empty');
  } catch (err) {
    console.log('CF text:', (err.message || '').slice(0, 60));
  }

  // نُقصّر system prompts الطويلة جداً فقط (Pollinations يفشل عند ~7000 حرف)
  // الحد 5000 يُبقي الأمثلة والتعليمات الكاملة سليمة
  const trimmedMessages = messages.map(m => {
    if (m.role === 'system' && m.content && m.content.length > 5000) {
      return { ...m, content: m.content.slice(0, 5000) + '\n[مختصر]' };
    }
    return m;
  });
  const maxTokens = Math.min(options.max_tokens || 800, 1500);

  // ━━━━━━━━━━ الطبقة 2: Google Gemini (الأكثر استقراراً وسرعة) ━━━━━━━━━━
  let geminiKey = env.GEMINI_API_KEY;
  if (!geminiKey && env.ZAD_KV) {
    try { geminiKey = await env.ZAD_KV.get('admin_gemini_key'); } catch (e) {}
  }
  if (geminiKey && geminiKey.length > 20) {
    try {
      const systemMsg = trimmedMessages.find(m => m.role === 'system');
      const conversationMsgs = trimmedMessages.filter(m => m.role !== 'system');
      const geminiContents = conversationMsgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const body = {
        contents: geminiContents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: maxTokens,
          topP: options.top_p || 0.9
        }
      };
      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg.content }] };
      }

      const resp = await fetchTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        },
        20000
      );

      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return { source: 'gemini', text };
      }
    } catch (err) {
      console.log('Gemini:', (err.message || '').slice(0, 60));
    }
  }

  // ━━━━━━━━━━ الطبقة 3: Pollinations.ai مباشر ━━━━━━━━━━
  // مجاني بدون مفتاح (احتياطي إذا فشل Gemini)
  try {
    const resp = await fetchTimeout('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://atif-alamodi.github.io'
      },
      body: JSON.stringify({
        messages: trimmedMessages,
        model: 'openai',
        seed: Math.floor(Math.random() * 99999)
      })
    }, 15000);
    if (resp.ok) {
      const text = (await resp.text() || '').trim();
      if (text && text.length > 5) {
        if (text.startsWith('{')) {
          try {
            const j = JSON.parse(text);
            const t = j.choices?.[0]?.message?.content || j.content?.[0]?.text || '';
            if (t) return { source: 'pollinations', text: t };
          } catch (e) {}
        } else {
          return { source: 'pollinations', text };
        }
      }
    }
  } catch (err) {
    console.log('Pollinations:', (err.message || '').slice(0, 60));
  }

  // ━━━━━━━━━━ الطبقة 4: zad-proxy (آخر احتياط) ━━━━━━━━━━
  if (env.ZAD_PROXY) {
    try {
      const proxyReq = new Request('https://zad-proxy/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: trimmedMessages, max_tokens: maxTokens })
      });
      const resp = await env.ZAD_PROXY.fetch(proxyReq);
      if (resp.ok) {
        const data = await resp.json();
        const text = data.content?.[0]?.text || '';
        if (text) return { source: data.source || 'zad-proxy', text };
      }
    } catch (err) {
      console.log('proxy:', (err.message || '').slice(0, 60));
    }
  }

  return { source: 'failed', text: '', error: 'all_fallbacks_failed' };
}

// =============================================================
// Worker Entry
// =============================================================
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

    // تشغيل توليد النص الرئيسي + المساعدات بالتوازي عبر callTextLLM (مع fallback لـ GROQ)
    const textPromise = callTextLLM(env, MODEL, messages, {
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.9
    });

    let imgResult = null;
    let labels = null;
    let imageSource = null;
    let svgChart = null;

    // 1) فحص: هل الموضوع له SVG جاهز؟ (الإحصاء + المخططات الشائعة)
    if (isDrawingRequest) {
      const chartType = detectChartType(userMessage);

      if (chartType) {
        // ✅ مخطط معروف - نولّد SVG احترافي بدلاً من AI image
        try {
          svgChart = buildSVGForType(chartType);
          imageSource = 'svg-builtin';
          // labels تُولَّد ضمن الـ SVG نفسه، لا حاجة لها
          labels = null;
        } catch (err) {
          console.log('SVG build failed:', err.message);
          svgChart = null;
        }
      }
    }

    // 2) إذا لم يكن مخطط معروف، نلجأ لـ AI image generation
    if (isDrawingRequest && !svgChart) {
      const artifacts = await prepareDrawingArtifacts(env, userMessage, history, subject.name, subject.content);

      if (artifacts.ambiguous) {
        return jsonResponse({
          answer: 'لم أفهم بدقة ما تريد رسمه. هل يمكنك تحديد الموضوع؟ مثلاً: "ارسم لي التوزيع الطبيعي" أو "ارسم لي تشريح القلب".',
          subject: subjectKey,
          model: HELPER_MODEL,
          image: null,
          image_svg: null
        }, request);
      }

      let imgPromptToUse;
      if (artifacts.error) {
        console.log('artifacts error, using direct prompt fallback:', artifacts.error);
        const cleaned = userMessage.replace(/^(ارسم لي|ارسم|اعرض|أرني|draw|show me)\s+/i, '').trim();
        imgPromptToUse = `Scientifically accurate educational illustration of "${cleaned}", professional textbook style, white background, clean clear lines, with small white circles each containing one digit 1 through 10 with thin black leader lines pointing to key parts, absolutely no axis labels with words, no titles, no English words anywhere, only allowed text are small white circles each containing one digit 1 to 10`;
        labels = null;
      } else {
        imgPromptToUse = artifacts.imagePrompt;
        labels = artifacts.labels;
      }

      const imgGen = await generateImage(env, imgPromptToUse);
      imgResult = { prompt: imgPromptToUse, image: imgGen.image, topic: artifacts.topic || userMessage };
      imageSource = imgGen.source;
    }

    // 3) الجواب النصي الرئيسي (Cloudflare 70B → GROQ كـ fallback)
    const aiResponse = await textPromise;

    let answer = (aiResponse.text || '').trim();
    answer = filterForeignScripts(answer);
    answer = stripAsciiArt(answer);

    // إذا الطلب رسم وحصلنا على labels، نضيفها للجواب
    if (isDrawingRequest && labels && labels.length > 30) {
      answer = `${answer || ''}\n\n**🏷️ الأجزاء الموسومة بالأرقام في الرسم:**\n\n${labels}\n\n*ملاحظة: الأرقام (1-10) داخل الدوائر البيضاء على الصورة تطابق الترقيم أعلاه. التسميات معروضة هنا نصياً لضمان دقتها العلمية الكاملة.*`.trim();
    }

    // إذا فشل النص ولكن الصورة جاءت من Pollinations، نضيف رسالة بسيطة
    if (!answer && imgResult && imgResult.image) {
      answer = `**الصورة المطلوبة معروضة أعلاه** (تم توليدها عبر مزود احتياطي مجاني).\n\n*ملاحظة: المساعد النصي مؤقتاً غير متاح بسبب نفاد الحصة المجانية اليومية لـ Cloudflare AI. الحصة تتجدد عند 3 صباحاً بتوقيت السعودية.*`;
    }

    // فشل كامل: لا نص ولا صورة
    if (!answer && !(imgResult && imgResult.image)) {
      const reason = aiResponse.error === 'no_groq_key'
        ? 'تم استنفاد الحصة المجانية لـ Cloudflare AI اليوم. الحصة تتجدد عند 3 صباحاً بتوقيت السعودية. لاستخدام مستمر دون انقطاع، يمكن إضافة مفتاح GROQ مجاني (راجع المالك).'
        : 'تعذّر توليد الإجابة من جميع المزودين. حاول مرة أخرى بعد قليل.';
      return jsonResponse({
        error: 'all_providers_failed',
        message: reason,
        cf_error: aiResponse.error
      }, request, 503);
    }

    return jsonResponse({
      answer,
      subject: subjectKey,
      model: MODEL,
      text_source: aiResponse.source,
      image: imgResult ? imgResult.image : null,
      image_prompt: imgResult ? imgResult.prompt : null,
      image_source: imageSource,
      image_svg: svgChart
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
