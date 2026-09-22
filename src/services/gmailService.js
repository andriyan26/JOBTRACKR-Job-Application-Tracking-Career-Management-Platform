/**
 * Smart Gmail Sync & AI Email Job Parser Service
 * Parses incoming emails from LinkedIn, JobStreet, Glints, and HR recruiters.
 * Automatically classifies status, extracts company & role, and handles calendar events.
 */

// Common platform detection patterns
const PLATFORM_PATTERNS = [
  { name: 'LinkedIn', regex: /linkedin\.com|linkedin\s*jobs|easy\s*apply|linkedin/i },
  { name: 'JobStreet', regex: /jobstreet\.co|jobstreet\.com|jobstreet/i },
  { name: 'Kalibrr', regex: /kalibrr\.com|kalibrr/i },
  { name: 'Dealls', regex: /dealls\.com|dealls/i },
  { name: 'Glints', regex: /glints\.com|glints/i },
  { name: 'KitaLulus', regex: /kitalulus\.com|kitalulus/i },
  { name: 'Karir.com', regex: /karir\.com|karir/i },
  { name: 'Tech in Asia', regex: /techinasia\.com|techinasia/i },
  { name: 'BCA Finance', regex: /bca\s*finance|bcafinance/i },
  { name: 'I2S Mailer', regex: /i2s|istidata/i },
  { name: 'Greenhouse', regex: /greenhouse\.io|gh_mail/i },
  { name: 'Lever', regex: /lever\.co|jobs\.lever/i },
  { name: 'Workday', regex: /myworkdayjobs|workday/i },
  { name: 'Direct Company Mailer', regex: /mailer|recruitment|rekrutmen|hrd|talent/i }
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
    /terima\s*kasih\s*telah\s*melamar/i,
    /application\s*sent/i,
    /submitting\s*your\s*application/i
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
  const fullText = `${subject}\n${sender}\n${text}`;

  // Kalibrr: "Application sent to Data Management Officer at Indonesia Stock Exchange!"
  const kalibrrMatch = /(?:Application sent to .*? at|sent to .*? at|to .*? at)\s+([A-Za-z0-9\s&.,'-]+?)(?:!|\.|\n|,|$)/i.exec(fullText);
  if (kalibrrMatch && isCleanCompany(kalibrrMatch[1]) && !/kalibrr/i.test(kalibrrMatch[1])) {
    return cleanEntityName(kalibrrMatch[1]);
  }
  const kalibrrMatch2 = /Talent Acquisition Team\s+([A-Za-z0-9\s&.,'-]+?)\s+at\s+Kalibrr/i.exec(fullText);
  if (kalibrrMatch2 && isCleanCompany(kalibrrMatch2[1])) {
    return cleanEntityName(kalibrrMatch2[1]);
  }
  const kalibrrMatch3 = /([A-Za-z0-9\s&.,'-]+?)\s+at\s+Kalibrr/i.exec(fullText);
  if (kalibrrMatch3 && isCleanCompany(kalibrrMatch3[1])) {
    return cleanEntityName(kalibrrMatch3[1]);
  }

  // I2S Mailer: "Thanks for submitting your application for a job at PT. Istidata Indopacific Solution Center"
  const i2sMatch = /(?:for a job at|application at|job at|submitting your application.*?at)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s+(?:team|careers|hr|hiring)|\.|\n|,|<|$)/i.exec(fullText);
  if (i2sMatch && isCleanCompany(i2sMatch[1])) {
    return cleanEntityName(i2sMatch[1]);
  }

  // BCA Finance: "BCA Finance Rekrutmen"
  if (/BCA\s*Finance/i.test(fullText)) {
    return 'BCA Finance';
  }

  // LinkedIn specific Indonesian pattern:
  // "Andrian, lamaran Anda sudah dikirim ke Sinarmas World Academy"
  const sentMatch = /(?:lamaran Anda (?:sudah|telah) dikirim ke|dikirim ke|sent to|applied to)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s+(?:untuk|sebagai|via|pada|team|careers|hr|telah|sudah|berhasil|\.|\n|,|$))/i.exec(fullText);
  if (sentMatch && isCleanCompany(sentMatch[1])) {
    return cleanEntityName(sentMatch[1]);
  }

  // JobStreet: "lamaranmu untuk posisi IT Support berhasil dikirimkan ke PT. [Company]"
  const jsDikirimKe = /(?:berhasil dikirimkan ke|dikirimkan ke|dikirim ke)\s+([A-Za-z0-9\s&.,'-]+?)(?:\.|\n|,|<|$)/i.exec(fullText);
  if (jsDikirimKe && isCleanCompany(jsDikirimKe[1])) {
    return cleanEntityName(jsDikirimKe[1]);
  }

  // Pipe delimiter in subject: e.g. "Junior Developer | Sinarmas World Academy"
  const pipeMatch = /^(.*?)\s*\|\s*(.*)$/m.exec(subject);
  if (pipeMatch) {
    const p1 = pipeMatch[1].trim();
    const p2 = pipeMatch[2].trim();
    if (isCleanCompany(p2)) return cleanEntityName(p2);
    if (isCleanCompany(p1) && !/developer|engineer|staff|specialist|analyst|designer|lamaran|support/i.test(p1)) {
      return cleanEntityName(p1);
    }
  }

  // JobStreet explicit labels: "Perusahaan: [Name]" or "Company: [Name]"
  const labelMatch = /(?:Perusahaan|Company|Employer|Pemberi Kerja)\s*:\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|\r|,|<|$)/i.exec(fullText);
  if (labelMatch && isCleanCompany(labelMatch[1])) {
    return cleanEntityName(labelMatch[1]);
  }

  // JobStreet phrase: "Lamaranmu untuk [Posisi] di [Perusahaan] berhasil dikirim"
  const jsMatch = /(?:lamaran(?:mu| Anda)? (?:untuk|pada)\s+[^\n\r]+?\s+di)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s+(?:berhasil|telah|sukses|terkirim)|\.|\n|,|<|$)/i.exec(fullText);
  if (jsMatch && isCleanCompany(jsMatch[1])) {
    return cleanEntityName(jsMatch[1]);
  }

  // Pattern "PT [Name]" or "PT. [Name]"
  const ptMatch = /(PT\.?\s+[A-Za-z0-9\s&.,'-]+?)(?:\s+(?:membuka|mengundang|adalah|tbk|persero|\.|\n|,|<|$))/i.exec(fullText);
  if (ptMatch && isCleanCompany(ptMatch[1])) {
    return cleanEntityName(ptMatch[1]);
  }

  // Standard "di [Company]" or "at [Company]"
  const atMatch = /(?:at|di|pada)\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+(?:for|sebagai|via|pada|team|careers|hr|telah|berhasil)|\.|\n|,|<|$)/i.exec(fullText);
  if (atMatch && isCleanCompany(atMatch[1])) {
    return cleanEntityName(atMatch[1]);
  }

  // Sender domain e.g. "recruitment@shopee.co.id" -> Shopee
  const domainMatch = /@([a-zA-Z0-9-]+)\.[a-zA-Z]{2,}/i.exec(sender);
  if (domainMatch && domainMatch[1] && !/gmail|yahoo|outlook|linkedin|jobstreet|glints|greenhouse|lever|mailer/i.test(domainMatch[1])) {
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

  // Kalibrr: "Application sent to Data Management Officer at Indonesia Stock Exchange!"
  const kalibrrPos = /Application sent to ([A-Za-z0-9\s/&.,'-]+?)\s+at\s+/i.exec(fullText);
  if (kalibrrPos && kalibrrPos[1] && kalibrrPos[1].trim().length > 2) {
    return cleanEntityName(kalibrrPos[1]);
  }

  // JobStreet: "lamaranmu untuk posisi IT Support berhasil"
  const jsPos = /(?:posisi|position|role)\s+([A-Za-z0-9\s/&.,'-]+?)\s+(?:berhasil|telah|sukses|terkirim|di|ke)/i.exec(fullText);
  if (jsPos && jsPos[1] && jsPos[1].trim().length > 2) {
    return cleanEntityName(jsPos[1]);
  }

  // Explicit labels: "Posisi: [Name]" or "Position: [Name]" or "Role: [Name]"
  const labelMatch = /(?:Posisi|Position|Role|Job Title|Pekerjaan)\s*:\s*([A-Za-z0-9\s/&.,'-]+?)(?:\n|\r|,|<|$)/i.exec(fullText);
  if (labelMatch && labelMatch[1] && labelMatch[1].trim().length > 2) {
    const cleaned = cleanEntityName(labelMatch[1]);
    if (!/perusahaan|company|jobstreet|linkedin|lamaran/i.test(cleaned)) {
      return cleaned;
    }
  }

  // Pipe delimiter "Junior Developer | Sinarmas World Academy"
  const pipeMatch = /^(.*?)\s*\|\s*(.*)$/m.exec(subject);
  if (pipeMatch) {
    const p1 = pipeMatch[1].trim();
    if (/developer|engineer|staff|specialist|analyst|designer|manager|programmer|junior|senior|intern|support|officer/i.test(p1)) {
      return cleanEntityName(p1);
    }
  }

  // Pattern "Lamaran Anda untuk [Posisi] di [Perusahaan]"
  const untukMatch = /(?:lamaran(?: Anda|mu)? (?:untuk|pada)|melamar posisi)\s+([A-Za-z0-9\s/&.,'-]+?)\s+(?:di|pada|ke)\s+/i.exec(fullText);
  if (untukMatch && untukMatch[1] && untukMatch[1].trim().length > 2) {
    return cleanEntityName(untukMatch[1]);
  }

  // Standard role keyword scan
  const roleKeywords = [
    'Data Management Officer',
    'IT Support Specialist',
    'IT Staff Support',
    'IT Support',
    'IT Staff',
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

  // Pattern "posisi [Position]" or "role [Position]"
  const posMatch = /(?:posisi|position|role|sebagai)\s+([A-Za-z0-9\s/]+?)(?:\s+(?:di|at|pada|ke|team|telah|berhasil|\.|\n|,))/i.exec(fullText);
  if (posMatch && posMatch[1] && posMatch[1].trim().length > 3) {
    return cleanEntityName(posMatch[1]);
  }

  return 'IT Support';
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
    id: 'sample_kalibrr_idx',
    label: '1. Kalibrr: Indonesia Stock Exchange (Data Management Officer)',
    platform: 'Kalibrr',
    sender: 'Talent Acquisition Team <notifications@kalibrr.com>',
    subject: 'Application sent to Data Management Officer at Indonesia Stock Exchange!',
    body: `Hi Andrian,

Your application for the position Data Management Officer at Indonesia Stock Exchange has been successfully submitted via Kalibrr!

Application Details:
- Role: Data Management Officer
- Employer: Indonesia Stock Exchange (PT Bursa Efek Indonesia)
- Location: Jakarta, Indonesia (Hybrid / On-site)
- Submitted: Today

The talent acquisition team will review your qualifications. We will notify you once there is an update on your application.

Best regards,
Kalibrr Talent Team`
  },
  {
    id: 'sample_i2s_istidata',
    label: '2. I2S Mailer: PT. Istidata Indopacific Solution Center (IT Support)',
    platform: 'I2S Mailer',
    sender: 'I2S Mailer <noreply@istidata.co.id>',
    subject: 'Thanks for submitting your application for a job at PT. Istidata Indopacific Solution Center',
    body: `Dear Andrian,

Thanks for submitting your application for a job at PT. Istidata Indopacific Solution Center.

Position Applied: IT Support Specialist
Department: Technical Infrastructure & Support
Office: Wisma Istidata, Jakarta

We have received your resume and our recruitment team is currently reviewing your profile against our current opening. If your profile matches our requirements, we will contact you for the next interview stage.

Sincerely,
Recruitment Team
PT. Istidata Indopacific Solution Center`
  },
  {
    id: 'sample_bca_finance',
    label: '3. BCA Finance: Rekrutmen Staff',
    platform: 'BCA Finance',
    sender: 'BCA Finance <rekrutmen@bcafinance.co.id>',
    subject: 'BCA Finance Rekrutmen - Konfirmasi Lamaran',
    body: `Haii Andrian,

Terima kasih atas ketertarikan kamu bergabung bersama BCA Finance.

Lamaran kamu untuk posisi IT Staff di BCA Finance telah kami terima di dalam sistem e-Recruitment BCA Finance. Data diri dan portfolio kamu akan segera diverifikasi oleh tim Human Capital.

Pantau terus email kamu untuk informasi jadwal seleksi atau psikotes berikutnya.

Salam hangat,
HC Recruitment BCA Finance`
  },
  {
    id: 'sample_jobstreet_itsupport',
    label: '4. JobStreet: IT Support (Lamaran Berhasil Dikirim)',
    platform: 'JobStreet',
    sender: 'Lamaran Jobstreet <noreply@jobstreet.com>',
    subject: 'Lamaranmu berhasil dikirim - IT Support',
    body: `Hai Andrian,

Lamaranmu untuk posisi IT Support berhasil dikirimkan ke PT. Global Solusi Teknologi melalui JobStreet.

Ringkasan:
- Posisi: IT Support
- Perusahaan: PT. Global Solusi Teknologi
- Status: Berhasil dikirimkan ke perekrut

Semoga berhasil dalam proses seleksi!
JobStreet by SEEK`
  },
  {
    id: 'sample_linkedin_sinarmas',
    label: '5. LinkedIn: Sinarmas World Academy (Junior Developer)',
    platform: 'LinkedIn',
    sender: 'LinkedIn Jobs <jobs-noreply@linkedin.com>',
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
    id: 'sample_interview_shopee',
    label: '6. Undangan Interview: PT Shopee International',
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
    // Broad search query to capture ALL job emails (Kalibrr, I2S Mailer, BCA Finance, JobStreet, LinkedIn, Glints, Dealls, etc.)
    const q = encodeURIComponent(
      '(subject:(lamaran OR application OR applied OR rekrutmen OR interview OR wawancara OR "submitting your application" OR "thank you for applying" OR "terima kasih" OR "application sent" OR "telah dikirim" OR "berhasil dikirim" OR "job at") OR from:(jobstreet OR linkedin OR kalibrr OR glints OR dealls OR greenhouse OR lever OR workday OR recruit OR talent OR mailer OR hrd OR bca OR istidata OR i2s))'
    );
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=${q}`,
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

    // Fetch individual messages details (up to 25 messages)
    const messagePromises = listData.messages.slice(0, 25).map(async (msg) => {
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
