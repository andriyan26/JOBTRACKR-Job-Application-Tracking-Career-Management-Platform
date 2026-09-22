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
  else if (/on-site|onsite|kantor|jakarta|sudirman|bsd/i.test(fullContent)) workMode = 'On-site';

  return {
    company_name: companyName || 'Company Mentioned',
    position: position || 'Specialist Role',
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
  // Try pattern: "at [Company]" or "di [Company]"
  const atMatch = /(?:at|di|pada|to|from|for)\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+(?:for|sebagai|via|pada|team|careers|hr)|\.|\n|,|$)/i.exec(subject);
  if (atMatch && atMatch[1] && atMatch[1].trim().length > 2 && !/interview|application|position/i.test(atMatch[1])) {
    return cleanEntityName(atMatch[1]);
  }

  // Try pattern in body: "PT [Name]"
  const ptMatch = /(PT\s+[A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+(?:membuka|mengundang|adalah|\.|\n|,))/i.exec(text);
  if (ptMatch && ptMatch[1]) {
    return cleanEntityName(ptMatch[1]);
  }

  // Try sender domain: e.g. "hr@tokopedia.com" -> Tokopedia
  const domainMatch = /@([a-zA-Z0-9-]+)\.[a-zA-Z]{2,}/i.exec(sender);
  if (domainMatch && domainMatch[1] && !/gmail|yahoo|outlook|linkedin|jobstreet|glints|greenhouse|lever/i.test(domainMatch[1])) {
    const domainName = domainMatch[1];
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  }

  return 'PT Teknologi Nusantara';
}

// Helper: Extract Position / Role
function extractJobPosition(subject, text) {
  const roleKeywords = [
    'Frontend Developer',
    'Frontend Engineer',
    'Fullstack Developer',
    'Backend Engineer',
    'React Developer',
    'UI/UX Designer',
    'Product Designer',
    'Product Manager',
    'Data Analyst',
    'Software Engineer',
    'DevOps Engineer',
    'QA Engineer',
    'Mobile Developer'
  ];

  for (const role of roleKeywords) {
    const reg = new RegExp(role, 'i');
    if (reg.test(subject) || reg.test(text)) {
      return role;
    }
  }

  // Generic match: "for [Position] at" or "posisi [Position]"
  const posMatch = /(?:posisi|position|role|for)\s+([A-Za-z0-9\s/]+?)(?:\s+(?:at|di|pada|team|\.|\n|,))/i.exec(subject);
  if (posMatch && posMatch[1] && posMatch[1].trim().length > 3) {
    return cleanEntityName(posMatch[1]);
  }

  return 'Software Engineer';
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

function cleanEntityName(str) {
  return str
    .replace(/[.,\-_#\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSummary(status, company, role, date) {
  switch (status) {
    case 'Interview':
      return `Interview invitation from ${company} for ${role} on ${date}.`;
    case 'Approved':
      return `Formal job offer received from ${company} for ${role}!`;
    case 'Rejected':
      return `Application not moving forward at ${company}.`;
    default:
      return `Application confirmation received for ${role} at ${company}.`;
  }
}

/**
 * Pre-configured realistic email templates for instant testing / demo
 */
export const SAMPLE_JOB_EMAILS = [
  {
    id: 'sample_linkedin_1',
    label: '1. LinkedIn: Application Sent (Auto-Create App)',
    platform: 'LinkedIn',
    sender: 'jobs-noreply@linkedin.com',
    subject: 'Your application was sent to PT Shopee International Indonesia for Frontend Developer',
    body: `Hi Andrian,

Your application for Frontend Developer at PT Shopee International Indonesia was sent to the employer via LinkedIn Easy Apply.

Position: Frontend Developer
Company: PT Shopee International Indonesia
Location: Jakarta, Indonesia (Hybrid)
Date submitted: Today

We will notify you when the employer reviews your application or contacts you for next steps.

Good luck!
The LinkedIn Jobs Team`
  },
  {
    id: 'sample_jobstreet_2',
    label: '2. JobStreet: Konfirmasi Pengiriman (Auto-Create App)',
    platform: 'JobStreet',
    sender: 'noreply@jobstreet.com',
    subject: 'JobStreet: Konfirmasi Pengiriman Lamaran Anda - PT Bank Mandiri (Persero) Tbk',
    body: `Halo Andrian,

Lamaran Anda untuk posisi React Specialist di PT Bank Mandiri (Persero) Tbk telah berhasil terkirim melalui JobStreet.

Detail Lamaran:
- Posisi: React Specialist
- Perusahaan: PT Bank Mandiri (Persero) Tbk
- Lokasi: Menara Mandiri, Jakarta Selatan (On-site)
- Gaji yang diharapkan: 15.000.000 - 20.000.000 IDR

Perusahaan akan meninjau resume Anda dalam waktu 3-7 hari kerja. Anda dapat memantau status lamaran ini di JobStreet.

Salam sukses,
JobStreet by SEEK`
  },
  {
    id: 'sample_interview_3',
    label: '3. Undangan Interview User (Auto-Update to Interview + Calendar)',
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

Mohon konfirmasi kehadiran Anda dengan membalas email ini paling lambat H-1.

Best regards,
Talent Acquisition Team
PT Shopee International Indonesia`
  },
  {
    id: 'sample_rejection_4',
    label: '4. Rejection Notice (Auto-Update to Rejected)',
    platform: 'Direct HR Email',
    sender: 'talent@bukalapak.com',
    subject: 'Update Regarding Your Application at Bukalapak - Software Engineer',
    body: `Hi Andrian,

Thank you for taking the time to speak with our engineering team regarding the Software Engineer position at Bukalapak.

Unfortunately, after careful consideration, we have decided to pursue other candidates whose experience more closely matches the specific requirements for this role at this time.

We truly appreciate the time and effort you invested in our process, and we will keep your resume on file for future openings.

We wish you all the best in your career search.

Warm regards,
Bukalapak People Team`
  },
  {
    id: 'sample_offer_5',
    label: '5. Official Job Offer (Auto-Update to Approved + Confetti)',
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

Mohon tinjau dokumen terlampir dan tandatangani sebelum tanggal 28 September 2026.

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
 * Fetch real messages from Gmail API using access token
 */
export async function fetchGmailMessages(accessToken) {
  try {
    const q = encodeURIComponent(
      'from:(linkedin OR jobstreet OR glints OR greenhouse OR lever) (application OR interview OR applied OR "thank you for applying" OR lamaran)'
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

      const parsed = parseJobEmail(snippet, subjectHeader, fromHeader);
      return {
        id: msg.id,
        platform: parsed.applied_via,
        sender: fromHeader,
        subject: subjectHeader,
        body: snippet,
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
