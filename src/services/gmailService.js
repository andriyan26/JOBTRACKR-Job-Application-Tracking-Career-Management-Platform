/**
 * Smart Gmail Sync & AI Email Job Parser Service
 * Parses incoming emails from LinkedIn, JobStreet, Glints, and HR recruiters.
 * Automatically classifies status, extracts company & role, and handles calendar events.
 */

// Common platform detection patterns
const PLATFORM_PATTERNS = [
  { name: 'LinkedIn', regex: /linkedin\.com|linkedin\s*jobs|easy\s*apply/i },
  { name: 'JobStreet', regex: /jobstreet\.co|jobstreet\.com|jobstreet/i },
  { name: 'Glints', regex: /glints\.com|glints/i },
  { name: 'Kalibrr', regex: /kalibrr\.com|kalibrr/i },
  { name: 'Karir.com', regex: /karir\.com|karir/i },
  { name: 'Greenhouse', regex: /greenhouse\.io|gh_mail/i },
  { name: 'Lever', regex: /lever\.co|jobs\.lever/i },
  { name: 'Workday', regex: /myworkdayjobs|workday/i }
];

// Status detection patterns
const STATUS_PATTERNS = {
  Approved: [
    /offering\s*letter/i,
    /job\s*offer/i,
    /congratulations.*offer/i,
    /pleased\s*to\s*offer/i,
    /selamat.*bergabung/i,
    /surat\s*penawaran\s*kerja/i,
    /resmi\s*diterima/i
  ],
  Interview: [
    /interview\s*invitation/i,
    /undangan\s*interview/i,
    /jadwal\s*wawancara/i,
    /undangan\s*psikotes/i,
    /technical\s*(test|assessment|interview)/i,
    /user\s*interview/i,
    /hr\s*interview/i,
    /google\s*meet\s*link/i,
    /zoom\s*meeting/i,
    /schedule\s*a\s*call/i,
    /invitation\s*to\s*meet/i
  ],
  Rejected: [
    /unfortunately/i,
    /not\s*moving\s*forward/i,
    /pursue\s*other\s*candidates/i,
    /other\s*applicants/i,
    /belum\s*dapat\s*melanjutkan/i,
    /mohon\s*maaf.*kualifikasi/i,
    /belum\s*bisa\s*memproses/i,
    /lain\s*kesempatan/i,
    /regret\s*to\s*inform/i,
    /decided\s*not\s*to\s*proceed/i
  ],
  Applied: [
    /application\s*received/i,
    /thank\s*you\s*for\s*applying/i,
    /lamaran\s*(anda\s*)?telah\s*terkirim/i,
    /application\s*was\s*sent/i,
    /konfirmasi\s*pengiriman\s*lamaran/i,
    /successfully\s*submitted/i,
    /berhasil\s*melamar/i,
    /terima\s*kasih\s*telah\s*melamar/i
  ]
};

// Blacklist of words that should never be identified as a company name
const BLACKLISTED_COMPANY_WORDS = [
  'jobstreet', 'linkedin', 'glints', 'email', 'lamaran', 'lowongan',
  'google', 'karir', 'notification', 'noreply', 'berhasil', 'terkirim',
  'account', 'security', 'alert', 'message', 'update', 'status', 'aplikasi'
];

function isCleanCompany(name) {
  if (!name || typeof name !== 'string') return false;
  const cleaned = cleanEntityName(name);
  if (cleaned.length < 3) return false; // Never accept 1 or 2 letter words like "E"
  const lower = cleaned.toLowerCase();
  if (BLACKLISTED_COMPANY_WORDS.some((w) => lower === w || lower.startsWith(w + ' '))) return false;
  return true;
}

function cleanEntityName(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/[.,\-_#\(\)\|:;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Email Parser
 * Analyzes email text, subject, and sender to extract job metadata.
 */
export function parseJobEmail(emailText, subject = '', sender = '') {
  const fullContent = `${subject}\n${sender}\n${emailText}`;

  // 1. Detect Platform
  let detectedPlatform = 'Company Career Portal';
  for (const p of PLATFORM_PATTERNS) {
    if (p.regex.test(fullContent)) {
      detectedPlatform = p.name;
      break;
    }
  }

  // 2. Detect Status
  let detectedStatus = 'Applied';
  if (STATUS_PATTERNS.Approved.some((r) => r.test(fullContent))) {
    detectedStatus = 'Approved';
  } else if (STATUS_PATTERNS.Interview.some((r) => r.test(fullContent))) {
    detectedStatus = 'Interview';
  } else if (STATUS_PATTERNS.Rejected.some((r) => r.test(fullContent))) {
    detectedStatus = 'Rejected';
  } else if (STATUS_PATTERNS.Applied.some((r) => r.test(fullContent))) {
    detectedStatus = 'Applied';
  }

  // 3. Extract Company Name
  let companyName = extractCompanyName(subject, emailText, sender);

  // 4. Extract Job Position
  let position = extractJobPosition(subject, emailText);

  // 5. Extract Date (especially for interviews)
  let detectedDate = extractDate(fullContent);

  // 6. Extract Location or Work Mode
  let workMode = 'Remote';
  if (/hybrid/i.test(fullContent)) workMode = 'Hybrid';
  else if (/on-site|onsite|kantor|jakarta|sudirman|bsd|tangerang|surabaya/i.test(fullContent)) workMode = 'On-site';

  return {
    company_name: companyName || 'Perusahaan Terdaftar',
    position: position || 'Junior Developer',
    applied_via: detectedPlatform,
    current_status: detectedStatus,
    work_mode: workMode,
    interview_date: detectedDate,
    raw_subject: subject,
    summary: buildSummary(detectedStatus, companyName, position, detectedDate)
  };
}

// Helper: Extract Company Name
function extractCompanyName(subject, text, sender) {
  const fullText = `${subject}\n${text}`;

  // Priority 1: LinkedIn specific Indonesian pattern:
  // "Andrian, lamaran Anda sudah dikirim ke Sinarmas World Academy"
  const sentMatch = /(?:lamaran Anda (?:sudah|telah) dikirim ke|dikirim ke|sent to|applied to)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s+(?:untuk|sebagai|via|pada|team|careers|hr|telah|sudah|berhasil|\.|\n|,|$))/i.exec(fullText);
  if (sentMatch && isCleanCompany(sentMatch[1])) {
    return cleanEntityName(sentMatch[1]);
  }

  // Priority 2: Pipe delimiter in subject: e.g. "Junior Developer | Sinarmas World Academy"
  const pipeMatch = /^(.*?)\s*\|\s*(.*)$/m.exec(subject);
  if (pipeMatch) {
    const p1 = pipeMatch[1].trim();
    const p2 = pipeMatch[2].trim();
    if (isCleanCompany(p2)) return cleanEntityName(p2);
    if (isCleanCompany(p1) && !/developer|engineer|staff|specialist|analyst|designer|lamaran/i.test(p1)) {
      return cleanEntityName(p1);
    }
  }

  // Priority 3: JobStreet explicit labels: "Perusahaan: [Name]" or "Company: [Name]"
  const labelMatch = /(?:Perusahaan|Company|Employer|Pemberi Kerja)\s*:\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|\r|,|<|$)/i.exec(fullText);
  if (labelMatch && isCleanCompany(labelMatch[1])) {
    return cleanEntityName(labelMatch[1]);
  }

  // Priority 4: JobStreet phrase: "Lamaranmu untuk [Posisi] di [Perusahaan] berhasil dikirim"
  const jsMatch = /(?:lamaran(?:mu| Anda)? (?:untuk|pada)\s+[^\n\r]+?\s+di)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s+(?:berhasil|telah|sukses|terkirim)|\.|\n|,|<|$)/i.exec(fullText);
  if (jsMatch && isCleanCompany(jsMatch[1])) {
    return cleanEntityName(jsMatch[1]);
  }

  // Priority 5: Pattern "PT [Name]"
  const ptMatch = /(PT\s+[A-Za-z0-9\s&.,'-]+?)(?:\s+(?:membuka|mengundang|adalah|tbk|persero|\.|\n|,|<|$))/i.exec(fullText);
  if (ptMatch && isCleanCompany(ptMatch[1])) {
    return cleanEntityName(ptMatch[1]);
  }

  // Priority 6: Standard "di [Company]" or "at [Company]"
  const atMatch = /(?:at|di|pada)\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+(?:for|sebagai|via|pada|team|careers|hr|telah|berhasil)|\.|\n|,|<|$)/i.exec(fullText);
  if (atMatch && isCleanCompany(atMatch[1])) {
    return cleanEntityName(atMatch[1]);
  }

  // Priority 7: Sender domain e.g. "recruitment@shopee.co.id" -> Shopee
  const domainMatch = /@([a-zA-Z0-9-]+)\.[a-zA-Z]{2,}/i.exec(sender);
  if (domainMatch && domainMatch[1] && !/gmail|yahoo|outlook|linkedin|jobstreet|glints|greenhouse|lever/i.test(domainMatch[1])) {
    const domainName = domainMatch[1];
    if (isCleanCompany(domainName)) {
      return domainName.charAt(0).toUpperCase() + domainName.slice(1);
    }
  }

  return 'Perusahaan Terdaftar';
}

// Helper: Extract Position / Role
function extractJobPosition(subject, text) {
  const fullText = `${subject}\n${text}`;

  // Priority 1: Explicit labels: "Posisi: [Name]" or "Position: [Name]" or "Role: [Name]"
  const labelMatch = /(?:Posisi|Position|Role|Job Title|Pekerjaan)\s*:\s*([A-Za-z0-9\s/&.,'-]+?)(?:\n|\r|,|<|$)/i.exec(fullText);
  if (labelMatch && labelMatch[1] && labelMatch[1].trim().length > 2) {
    const cleaned = cleanEntityName(labelMatch[1]);
    if (!/perusahaan|company|jobstreet|linkedin|lamaran/i.test(cleaned)) {
      return cleaned;
    }
  }

  // Priority 2: Pipe delimiter "Junior Developer | Sinarmas World Academy"
  const pipeMatch = /^(.*?)\s*\|\s*(.*)$/m.exec(subject);
  if (pipeMatch) {
    const p1 = pipeMatch[1].trim();
    if (/developer|engineer|staff|specialist|analyst|designer|manager|programmer|junior|senior|intern/i.test(p1)) {
      return cleanEntityName(p1);
    }
  }

  // Priority 3: Pattern "Lamaran Anda untuk [Posisi] di [Perusahaan]"
  const untukMatch = /(?:lamaran(?: Anda|mu)? (?:untuk|pada)|melamar posisi)\s+([A-Za-z0-9\s/&.,'-]+?)\s+(?:di|pada|ke)\s+/i.exec(fullText);
  if (untukMatch && untukMatch[1] && untukMatch[1].trim().length > 2) {
    const cleaned = cleanEntityName(untukMatch[1]);
    if (!/perusahaan|company|jobstreet|linkedin/i.test(cleaned)) {
      return cleaned;
    }
  }

  // Priority 4: Standard role keyword scan
  const roleKeywords = [
    'Junior Software Engineer',
    'Junior Developer',
    'Senior Software Engineer',
    'Senior Developer',
    'Frontend Developer',
    'Frontend Engineer',
    'Fullstack Developer',
    'Fullstack Engineer',
    'Backend Developer',
    'Backend Engineer',
    'React Specialist',
    'React Developer',
    'Web Developer',
    'Software Engineer',
    'Software Developer',
    'IT Support Specialist',
    'IT Support',
    'IT Staff',
    'DevOps Engineer',
    'QA Engineer',
    'Quality Assurance',
    'UI/UX Designer',
    'Product Designer',
    'Product Manager',
    'Data Analyst',
    'Data Scientist',
    'Mobile Developer',
    'Android Developer',
    'iOS Developer'
  ];

  for (const role of roleKeywords) {
    const reg = new RegExp(`\\b${role.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (reg.test(fullText)) {
      return role;
    }
  }

  // Priority 5: Pattern "posisi [Position]" or "role [Position]"
  const posMatch = /(?:posisi|position|role|sebagai)\s+([A-Za-z0-9\s/]+?)(?:\s+(?:di|at|pada|ke|team|telah|berhasil|\.|\n|,))/i.exec(fullText);
  if (posMatch && posMatch[1] && posMatch[1].trim().length > 3) {
    return cleanEntityName(posMatch[1]);
  }

  return 'Junior Developer';
}

// Helper: Extract Date
function extractDate(text) {
  // Format: YYYY-MM-DD
  const isoMatch = /\b(\d{4}-\d{2}-\d{2})\b/.exec(text);
  if (isoMatch) return isoMatch[1];

  // Format: 25 September 2026 or 25 Sep 2026
  const indoMatch = /(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i.exec(text);
  if (indoMatch) {
    const day = indoMatch[1].padStart(2, '0');
    const monthName = indoMatch[2].toLowerCase();
    const year = indoMatch[3];
    const monthMap = {
      jan: '01', januari: '01',
      feb: '02', februari: '02',
      mar: '03', maret: '03',
      apr: '04', april: '04',
      may: '05', mei: '05',
      jun: '06', juni: '06',
      jul: '07', juli: '07',
      aug: '08', agustus: '08',
      sep: '09', september: '09',
      oct: '10', oktober: '10',
      nov: '11', november: '11',
      dec: '12', desember: '12'
    };
    const mm = monthMap[monthName.substring(0, 3)] || '09';
    return `${year}-${mm}-${day}`;
  }

  // Default to tomorrow for interview
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  return tomorrow.toISOString().slice(0, 10);
}

function buildSummary(status, company, role, date) {
  switch (status) {
    case 'Interview':
      return `Undangan interview dari ${company} untuk posisi ${role} pada ${date}.`;
    case 'Approved':
      return `Penawaran kerja resmi (Job Offer) diterima dari ${company} untuk posisi ${role}!`;
    case 'Rejected':
      return `Lamaran kerja di ${company} belum dapat dilanjutkan.`;
    default:
      return `Konfirmasi lamaran kerja untuk posisi ${role} di ${company}.`;
  }
}

/**
 * Pre-configured realistic email templates for instant testing / demo
 */
export const SAMPLE_JOB_EMAILS = [
  {
    id: 'sample_linkedin_sinarmas',
    label: '1. LinkedIn: Sinarmas World Academy (Junior Developer)',
    platform: 'LinkedIn',
    sender: 'jobs-noreply@linkedin.com',
    subject: 'Andrian, lamaran Anda sudah dikirim ke Sinarmas World Academy',
    body: `Hi Andrian,

Lamaran Anda untuk posisi Junior Developer di Sinarmas World Academy sudah berhasil dikirim via LinkedIn Easy Apply.

Detail Lamaran:
- Posisi: Junior Developer
- Perusahaan: Sinarmas World Academy
- Lokasi: Tangerang / BSD (On-site)
- Tanggal Dikirim: Hari ini

Kami akan memberi tahu Anda jika pihak Sinarmas World Academy meninjau lamaran Anda atau menjadwalkan tahap selanjutnya.

Salam hangat,
Tim LinkedIn Jobs`
  },
  {
    id: 'sample_jobstreet_mandiri',
    label: '2. JobStreet: Bank Mandiri (React Specialist)',
    platform: 'JobStreet',
    sender: 'noreply@jobstreet.com',
    subject: 'Lamaran terkirim | Jobstreet - PT Bank Mandiri (Persero) Tbk',
    body: `Halo Andrian,

Lamaranmu untuk posisi React Specialist di PT Bank Mandiri (Persero) Tbk berhasil dikirim melalui JobStreet.

Informasi Lamaran:
Perusahaan: PT Bank Mandiri (Persero) Tbk
Posisi: React Specialist
Status: Terkirim ke Rekruter

Pemberi kerja akan meninjau kualifikasi dan resume Anda. Pantau terus status lamaran Anda di JobStreet.

Salam sukses,
Jobstreet by SEEK`
  },
  {
    id: 'sample_interview_shopee',
    label: '3. Undangan Interview: PT Shopee International',
    platform: 'Direct HR Email',
    sender: 'recruitment@shopee.co.id',
    subject: 'Undangan Interview User - Frontend Developer (PT Shopee International Indonesia)',
    body: `Dear Andrian,

Terima kasih atas minat Anda melamar posisi Frontend Developer di PT Shopee International Indonesia.

Berdasarkan hasil seleksi berkas, kami mengundang Anda untuk mengikuti sesi User Technical Interview yang akan dilaksanakan pada:

- Hari / Tanggal: Kamis, 25 September 2026
- Waktu: 14:00 - 15:00 WIB
- Media: Google Meet (link terlampir: meet.google.com/xyz-shopee)
- Pewawancara: Lead Frontend Engineer & Engineering Manager

Mohon konfirmasi kehadiran Anda dengan membalas email ini.

Best regards,
Talent Acquisition Team
PT Shopee International Indonesia`
  },
  {
    id: 'sample_rejection_bukalapak',
    label: '4. Status Update: Bukalapak (Ditolak)',
    platform: 'Direct HR Email',
    sender: 'talent@bukalapak.com',
    subject: 'Update Regarding Your Application at Bukalapak - Software Engineer',
    body: `Hi Andrian,

Thank you for taking the time to speak with our engineering team regarding the Software Engineer position at Bukalapak.

Unfortunately, after careful consideration, we have decided to pursue other candidates whose experience more closely matches the specific requirements for this role at this time.

We truly appreciate the time and effort you invested in our process.

Warm regards,
Bukalapak People Team`
  },
  {
    id: 'sample_offer_mandiri',
    label: '5. Official Job Offer: Bank Mandiri (Diterima)',
    platform: 'Direct HR Email',
    sender: 'hr-offers@bankmandiri.co.id',
    subject: 'Job Offer & Offering Letter - React Specialist (PT Bank Mandiri)',
    body: `Selamat siang Andrian,

Congratulations!

Kami dengan senang hati menyampaikan bahwa Anda dinyatakan LULUS dari seluruh rangkaian proses seleksi posisi React Specialist di PT Bank Mandiri (Persero) Tbk.

Bersama ini kami lampirkan Official Offering Letter dengan detail kompensasi dan benefit:
- Position: React Specialist
- Base Salary: Rp 18.500.000 / bulan + Tunjangan & Asuransi
- Start Date: 01 Oktober 2026

Selamat bergabung di keluarga besar Bank Mandiri!

Salam hangat,
Human Capital Group
PT Bank Mandiri (Persero) Tbk`
  }
];

export const DEFAULT_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '799731913117-eropponv0doam15k4hultsgkdrhs92ld.apps.googleusercontent.com';

/**
 * Request real Gmail access token using Google Identity Services (GIS)
 */
export function requestGoogleAccessToken(clientId, onTokenReceived, onError) {
  if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
    if (onError) onError('Google Identity Services library is still loading. Please try again.');
    return;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId || DEFAULT_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      callback: (response) => {
        if (response.error) {
          if (onError) onError(response.error_description || response.error);
        } else if (response.access_token) {
          if (onTokenReceived) onTokenReceived(response.access_token);
        }
      }
    });
    client.requestAccessToken();
  } catch (err) {
    if (onError) onError(err.message || 'Failed to initialize Google login');
  }
}

/**
 * Helper to recursively decode and extract clean text from Gmail payload
 */
function extractEmailBodyText(payload) {
  if (!payload) return '';
  let bodyText = '';

  if (payload.body && payload.body.data) {
    try {
      bodyText += ' ' + atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {}
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.body && part.body.data) {
        try {
          bodyText += ' ' + atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } catch {}
      }
      if (part.parts) {
        bodyText += ' ' + extractEmailBodyText(part);
      }
    }
  }

  // Remove HTML tags & multiple spaces
  return bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Fetch real messages from Gmail API using access token
 */
export async function fetchGmailMessages(accessToken) {
  try {
    const q = encodeURIComponent(
      'from:(linkedin OR jobstreet OR glints OR greenhouse OR lever) (application OR interview OR applied OR "thank you for applying" OR lamaran OR dikirim)'
    );
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${q}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!listRes.ok) {
      throw new Error(`Gmail API error: ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Fetch individual messages details
    const messagePromises = listData.messages.slice(0, 8).map(async (msg) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();

      const headers = detail.payload?.headers || [];
      const subjectHeader = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '';
      const fromHeader = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
      const snippet = detail.snippet || '';
      const decodedBody = extractEmailBodyText(detail.payload);
      const fullContent = `${snippet}\n${decodedBody}`.trim();

      const parsed = parseJobEmail(fullContent, subjectHeader, fromHeader);
      return {
        id: msg.id,
        platform: parsed.applied_via,
        sender: fromHeader,
        subject: subjectHeader,
        body: fullContent,
        parsed
      };
    });

    const results = await Promise.all(messagePromises);
    return results.filter(Boolean);
  } catch (err) {
    console.error('Error fetching real Gmail messages:', err);
    throw err;
  }
}
