const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateProjectStructurePDF() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Studentski Forum - Project Structure Guide</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
    }

    h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 10px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }

    h2 {
      color: #1e40af;
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }

    h3 {
      color: #1e3a8a;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    p {
      margin-bottom: 12px;
      text-align: justify;
    }

    .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 30px;
    }

    .folder {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }

    .folder-name {
      font-weight: bold;
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .file {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 12px 0;
      border-radius: 4px;
    }

    .file-name {
      font-weight: bold;
      color: #92400e;
      font-size: 16px;
      margin-bottom: 6px;
    }

    .code {
      background: #1e293b;
      color: #e2e8f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    ul {
      margin: 10px 0 10px 20px;
    }

    li {
      margin: 5px 0;
    }

    .page-break {
      page-break-after: always;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Studentski Forum - Project Structure Guide</h1>
  <p class="subtitle">Kratki vodič kroz glavne foldere i važne datoteke projekta</p>

  <h2>📁 Major Folders</h2>

  <div class="folder">
    <div class="folder-name">/.claude</div>
    <p>Konfiguracijske datoteke za Claude Code CLI alat. Sadrži postavke za Claude AI asistenta koji pomaže u razvoju projekta.</p>
    <ul>
      <li><span class="code">settings.json</span> - Glavne postavke</li>
      <li><span class="code">settings.local.json</span> - Lokalne postavke (ignorirane u git-u)</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/.github</div>
    <p>GitHub konfiguracijske datoteke, uključujući CI/CD workflows. Sadrži automatizaciju za testiranje, deployment i održavanje projekta.</p>
    <ul>
      <li><span class="code">workflows/</span> - GitHub Actions workflow definicije</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/.next</div>
    <p>Next.js build output folder. Generira se automatski kod build procesa. Sadrži optimizirane production-ready fileove.</p>
    <ul>
      <li>Build cache i optimizirani bundleovi</li>
      <li>Server i client komponente</li>
      <li>Static asset-i i routing informacije</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/app</div>
    <p>Next.js 16 App Router - glavna aplikacijska logika. Koristi file-system based routing gdje svaki folder predstavlja rutu.</p>
    <ul>
      <li><span class="code">auth/</span> - Login, registracija, reset lozinke</li>
      <li><span class="code">forum/</span> - Forum stranice (sveučilišta, fakulteti, kategorije, teme)</li>
      <li><span class="code">admin/</span> - Admin panel (korisnici, moderacija, analitika)</li>
      <li><span class="code">notifications/</span> - Stranica s obavijestima</li>
      <li><span class="code">messages/</span> - Privatne poruke</li>
      <li><span class="code">api/</span> - API routes (server-side endpoints)</li>
      <li><span class="code">layout.tsx</span> - Root layout sa navbar-om i providerima</li>
      <li><span class="code">page.tsx</span> - Landing stranica</li>
      <li><span class="code">globals.css</span> - Globalni CSS stilovi i Tailwind konfiguracija</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <div class="folder">
    <div class="folder-name">/components</div>
    <p>React komponente - reusable UI building blocks. Organizirane po funkcionalnosti.</p>
    <ul>
      <li><span class="code">ui/</span> - shadcn/ui komponente (Button, Card, Dialog, itd.)</li>
      <li><span class="code">forum/</span> - Forum specifične komponente (MarkdownEditor, TopicCard, ReplyForm)</li>
      <li><span class="code">auth/</span> - Autentifikacijske forme</li>
      <li><span class="code">layout/</span> - Navigacija i layout komponente (Navbar, MobileNav)</li>
      <li><span class="code">notifications/</span> - Notification bell i lista</li>
      <li><span class="code">profile/</span> - User profil komponente</li>
      <li><span class="code">messages/</span> - Privatne poruke komponente</li>
      <li><span class="code">gamification/</span> - Achievements i leaderboards</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/hooks</div>
    <p>Custom React hooks za reusable logiku.</p>
    <ul>
      <li><span class="code">use-button-animation.ts</span> - Animacijski hook za buttone</li>
      <li><span class="code">use-view-preference.ts</span> - Hook za čuvanje user preferencija</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/lib</div>
    <p>Utility funkcije i server-side logika. Srce backend logike aplikacije.</p>
    <ul>
      <li><span class="code">supabase/</span> - Supabase client konfiguracija (SSR, client, middleware)</li>
      <li><span class="code">validations/</span> - Zod validation schemaе</li>
      <li><span class="code">utils/</span> - Utility funkcije (formatting, validation)</li>
      <li><span class="code">achievements.ts</span> - Gamification logika</li>
      <li><span class="code">email.ts</span> - Email slanje (Nodemailer)</li>
      <li><span class="code">content-moderation.ts</span> - Spam detection i moderacija</li>
      <li><span class="code">attachments.ts</span> - Upload i obrada slika</li>
      <li><span class="code">constants.ts</span> - Aplikacijske konstante</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/public</div>
    <p>Javni static asset-i dostupni direktno preko URL-a.</p>
    <ul>
      <li><span class="code">logo-email.png/svg</span> - Logo za email template</li>
      <li><span class="code">manifest.json</span> - PWA manifest</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <div class="folder">
    <div class="folder-name">/scripts</div>
    <p>Utility skripte za development i maintenance.</p>
    <ul>
      <li><span class="code">generate-project-guide.js</span> - Generira detaljni internal guide PDF</li>
      <li><span class="code">convert-to-pdf.js</span> - Konvertira HTML u PDF</li>
      <li><span class="code">apply-study-programs.ts</span> - Ažurira studijske programe u bazi</li>
      <li><span class="code">seed-study-programs.ts</span> - Seed studijskih programa</li>
      <li><span class="code">check-*.js</span> - Validation skripte za database</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/supabase</div>
    <p>Database schema, migrations i SQL skripte. PostgreSQL konfiguracija.</p>
    <ul>
      <li><span class="code">schema.sql</span> - Glavna database schema</li>
      <li><span class="code">migrations/</span> - Database migracije</li>
      <li><span class="code">universities.sql</span> - Sveučilišta i fakulteti</li>
      <li><span class="code">notifications.sql</span> - Notification system</li>
      <li><span class="code">create_bots_with_content.sql</span> - Bot korisnici za testiranje</li>
      <li><span class="code">config.toml</span> - Supabase lokalna konfiguracija</li>
    </ul>
  </div>

  <div class="folder">
    <div class="folder-name">/types</div>
    <p>TypeScript type definicije za type safety.</p>
    <ul>
      <li><span class="code">database.ts</span> - Supabase database tipovi (generirani)</li>
      <li><span class="code">index.ts</span> - Aplikacijski custom tipovi</li>
      <li><span class="code">notifications.ts</span> - Notification tipovi</li>
    </ul>
  </div>

  <h2>📄 Important Root Files</h2>

  <div class="file">
    <div class="file-name">package.json</div>
    <p>Node.js dependency management i npm scripts. Definira sve potrebne biblioteke i verzije.</p>
    <ul>
      <li>Dependencies: Next.js 16, React 19, Supabase, Tailwind CSS</li>
      <li>Scripts: <span class="code">dev</span>, <span class="code">build</span>, <span class="code">start</span>, <span class="code">lint</span></li>
      <li>DevDependencies: TypeScript, ESLint, Puppeteer</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">tsconfig.json</div>
    <p>TypeScript compiler konfiguracija. Postavlja pravila za type checking i transpilaciju.</p>
    <ul>
      <li>Strict mode enabled za type safety</li>
      <li>Path aliases: <span class="code">@/*</span> pokazuje na root</li>
      <li>Target: ES2017</li>
      <li>Module resolution: bundler</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <div class="file">
    <div class="file-name">next.config.js</div>
    <p>Next.js framework konfiguracija. Postavke za performance, images i server actions.</p>
    <ul>
      <li>Image optimization (AVIF/WebP support)</li>
      <li>Remote patterns za Supabase storage</li>
      <li>Server actions bodySizeLimit: 15mb (za image uploads)</li>
      <li>Production optimizations (compression, sourceMap removal)</li>
      <li>Package import optimizations (lucide-react, supabase)</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">tailwind.config.ts</div>
    <p>Tailwind CSS konfiguracija. Custom colors, animations i design tokens.</p>
    <ul>
      <li>Dark mode support (<span class="code">class</span> strategy)</li>
      <li>Custom color palette (primary, success, warning, info, purple)</li>
      <li>Custom animations (float, pulse-glow, shake, slide-up/down)</li>
      <li>Extended screens (xs: 475px)</li>
      <li>Gradient backgrounds</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">vercel.json</div>
    <p>Vercel deployment konfiguracija. Cron jobs za scheduled tasks.</p>
    <ul>
      <li>Cron job za refresh stats (svaki dan u 2:00)</li>
      <li>Cron job za weekly maintenance (nedjelja u 3:00)</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">.env.local</div>
    <p>Environment varijable (ne commitane u Git). Sadrži osjetljive podatke.</p>
    <ul>
      <li><span class="code">NEXT_PUBLIC_SUPABASE_URL</span> - Supabase projekt URL</li>
      <li><span class="code">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> - Supabase anon ključ</li>
      <li>Email konfiguracija za Nodemailer</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">.gitignore</div>
    <p>Definira koje fileove Git ignorira. Standardne Next.js excludes plus custom dodatci.</p>
    <ul>
      <li><span class="code">node_modules/</span> - Dependencies</li>
      <li><span class="code">.next/</span> - Build output</li>
      <li><span class="code">.env*.local</span> - Environment varijable</li>
      <li><span class="code">*.pdf</span>, <span class="code">*.html</span> - Generated docs (internal guides)</li>
    </ul>
  </div>

  <div class="file">
    <div class="file-name">README.md</div>
    <p>Glavna projektna dokumentacija. Setup upute, feature lista i deployment guide.</p>
    <ul>
      <li>Installation steps</li>
      <li>Tech stack overview</li>
      <li>Database setup upute</li>
      <li>Version history</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Studentski Forum</strong> - Next.js 16 • React 19 • TypeScript • Supabase</p>
    <p>Autori: Jan Pavić, Damjan Josip Sartori, Marino Listeš</p>
  </div>
</body>
</html>
  `;

  // Save HTML first
  const htmlPath = path.join(__dirname, '..', 'PROJECT_STRUCTURE_GUIDE.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('✅ HTML file created:', htmlPath);

  // Generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, '..', 'PROJECT_STRUCTURE_GUIDE.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });

  await browser.close();
  console.log('✅ PDF generated successfully:', pdfPath);

  // Clean up HTML
  fs.unlinkSync(htmlPath);
  console.log('🗑️  Temporary HTML file removed');
}

generateProjectStructurePDF().catch(console.error);
