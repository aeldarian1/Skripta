# Studentski Forum

**Autori:** Jan Pavić | Damjan Josip Sartori | Marino Listeš

Online forum za studente svih sveučilišta u Hrvatskoj. Korisnici mogu stvarati i odgovarati na threadove, glasati za odgovore, i sudjelovati u diskusijama po kategorijama.

## 🚀 Značajke

### Implementirano ✅
- ✅ **Autentifikacija** - Registracija i prijava korisnika sa Supabase Auth
- ✅ **Hijerarhijska struktura** - 4 sveučilišta, 12 fakulteta, 6 kategorija po fakultetu (72 ukupno kategorija)
- ✅ **Forum navigacija** - Odabir sveučilišta → fakulteta → kategorija
- ✅ **Teme (Topics)** - Kreiranje, pregled i listanje tema sa paginacijom
- ✅ **Odgovori (Replies)** - Komentiranje na teme sa real-time ažuriranjem
- ✅ **Glasanje** - Upvote/downvote sistem za odgovore
- ✅ **Pretraga** - Full-text pretraga kroz teme po naslovu i sadržaju
- ✅ **User profili** - Kompletni profili sa statistikama, akademskim informacijama i fakultetom
- ✅ **Editiranje profila** - Uređivanje avatara, biografije, sveučilišta, fakulteta i studijskih podataka
- ✅ **Admin panel** - Kompletan admin panel za upravljanje korisnicima, temama, odgovorima i analitiku
- ✅ **Notifikacije** - Real-time obavijesti za nove odgovore, upvote-ove i prikvačene teme
- ✅ **Markdown podrška** - Rich text editor sa live preview i syntax highlighting
- ✅ **Responsive dizajn** - Prilagođeno za mobilne uređaje
- ✅ **Dark mode podrška** - Svijetla i tamna tema
- ✅ **Loading states** - Skeleton screens za bolji UX
- ✅ **Performance optimizacije** - ISR caching, image optimization

## 🛠 Tech Stack

- **Frontend:** Next.js 16.0.7 (App Router), TypeScript, React 19.2.1
- **Styling:** Tailwind CSS 3.4.18, shadcn/ui komponente
- **Markdown:** react-markdown, remark-gfm, rehype-sanitize, react-syntax-highlighter
- **Validation:** Zod 4.1.13
- **Backend:** Supabase (PostgreSQL) sa Row-Level Security
- **Authentication:** Supabase Auth sa SSR (@supabase/ssr)
- **Deployment:** Vercel (preporučeno)

### 🎯 Performance Features
- ✅ Incremental Static Regeneration (ISR)
- ✅ Image optimization (AVIF/WebP)
- ✅ Package tree-shaking (lucide-react, supabase)
- ✅ gzip compression
- ✅ Font preloading
- ✅ 0 security vulnerabilities

## 📦 Instalacija

### 1. Preduvjeti
- Node.js 18+ i npm
- Supabase račun ([supabase.com](https://supabase.com))

### 2. Install dependencies

```bash
npm install
```

### 3. Postavi Supabase

1. Idi na [supabase.com](https://supabase.com) i kreiraj novi projekt
2. Idi na **Settings > API** i kopiraj:
   - Project URL
   - anon/public key

### 4. Environment varijable

```bash
cp .env.example .env.local
```

Dodaj svoje podatke u `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tvoj-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj-anon-key
```

### 5. Postavi bazu podataka

1. Idi u Supabase dashboard > **SQL Editor**
2. Kopiraj cijeli sadržaj iz `supabase/schema.sql`
3. Zalijepi u SQL Editor i pokreni
4. Kopiraj cijeli sadržaj iz `supabase/notifications.sql`
5. Zalijepi u SQL Editor i pokreni
6. Kopiraj cijeli sadržaj iz `supabase/universities.sql`
7. Zalijepi u SQL Editor i pokreni
8. Kopiraj cijeli sadržaj iz `supabase/categories-per-faculty.sql`
9. Zalijepi u SQL Editor i pokreni
10. Kopiraj cijeli sadržaj iz `supabase/add-profile-university-faculty.sql`
11. Zalijepi u SQL Editor i pokreni

Ovo će kreirati sve tablice, politike, triggere, funkcije, sveučilišta, fakultete i kategorije.

### 6. (Opciono) Kreiraj bot korisnike za testiranje

Za testiranje platforme sa realističnim sadržajem:

1. Idi u Supabase dashboard > **SQL Editor**
2. Kopiraj cijeli sadržaj iz `supabase/create_bots_with_content.sql`
3. Zalijepi u SQL Editor i pokreni

Ovo će kreirati 60 bot korisnika sa hrvatskim imenima koji automatski:
- Kreiraju 30-240 tema sa razgovornim hrvatskim jezikom
- Postavljaju 180-600 odgovora sa slengom i emojijima
- Glasaju na 300-900 odgovora
- Raspoređuju sadržaj preko svih sveučilišta i fakulteta

**Za brisanje bot korisnika:**
```sql
-- Pokreni supabase/delete_bot_users.sql
```

**⚠️ Važno:**
- Idi na **Authentication > Providers > Email** i **isključi** "Confirm email" ako želiš testirati registraciju bez email potvrde.
- Notifications SQL mora biti pokrenut nakon schema.sql jer ovisi o tablicama iz schema.sql
- **Za resetiranje lozinke:** MORA biti isključeno "Secure email change enabled" u Supabase. Vidi [SETUP.md](SETUP.md) za detalje.

### 7. Pokreni development server

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000)

## 👤 Kreiranje Admin Korisnika

Nakon registracije:

1. Idi u Supabase Dashboard > **Table Editor** > `profiles`
2. Pronađi svog korisnika
3. Promijeni `role` iz `student` u `admin`

## 📁 Struktura Projekta

```
/app
  /auth                           # Login, register stranice
  /forum                          # Forum stranice
    /select-university            # Odabir sveučilišta
      /[university]               # Odabir fakulteta unutar sveučilišta
    /[university]/[faculty]       # Forum stranica fakulteta
      /category/[slug]            # Kategorije fakulteta
      /topic/[slug]               # Pojedinačna tema fakulteta
      /new                        # Nova tema za fakultet
    /category/[slug]              # Legacy kategorije (deprecated)
    /topic/[slug]                 # Legacy teme (deprecated)
    /user/[username]              # User profili
      /edit                       # Uređivanje profila
    /search                       # Pretraga tema
    loading.tsx                   # Loading states
  /admin                          # Admin panel
    /users                        # Upravljanje korisnicima
    /topics                       # Moderacija tema
    /replies                      # Moderacija odgovora
    /analytics                    # Analitika i statistika
  /notifications                  # Stranica sa svim obavijestima
/components
  /ui                             # shadcn komponente
  /forum                          # Forum komponente (markdown editor/renderer, forms, cards)
  /notifications                  # Notification komponente (bell, list)
  /layout                         # Navbar, mobile nav
/lib
  /supabase                       # Supabase client (SSR & client)
  /validations                    # Zod schemas
/types                            # TypeScript types
/supabase
  schema.sql                      # Database schema
  notifications.sql               # Notification system schema
  universities.sql                # Sveučilišta i fakulteti
  categories-per-faculty.sql      # Kategorije po fakultetima
  add-profile-university-faculty.sql # Profile akademske informacije
```

## 🚀 Deployment na Vercel

1. Push na GitHub
2. Import na [vercel.com](https://vercel.com)
3. Dodaj environment varijable
4. Deploy!

## 📊 Značajke

### Autentifikacija
- Registracija i prijava korisnika
- Email potvrda (opciono)
- Server-side rendering (SSR) za sigurnost

### Forum Funkcionalnosti
- **Hijerarhijska struktura**: 4 sveučilišta → 12 fakulteta → 72 kategorije (6 po fakultetu)
- **Sveučilišta**: Zagreb, Split, Rijeka, Osijek
- **Fakulteti**: 3 fakulteta po sveučilištu (FER, PMF Split, FIDIT, FERIT, itd.)
- **Kategorije**: Opće, Pitanja, Studij, Karijera, Tehnologija, Off-topic (po fakultetu)
- **Teme**: Kreiranje novih tema unutar fakulteta, pinning, view count
- **Odgovori**: Komentiranje sa threaded replies
- **Glasanje**: Upvote/downvote sistem
- **Pretraga**: Full-text pretraga po naslovu i sadržaju
- **Markdown**: Rich text editor sa live preview, syntax highlighting i pomoć

### Notifikacije
- Real-time obavijesti (polling svake 30 sekundi)
- Obavijesti za nove odgovore na teme
- Obavijesti za odgovore na komentare
- Obavijesti za upvote-ove
- Obavijesti za prikvačene teme
- Bell icon u navbaru sa unread count
- Označi kao pročitano / Izbriši notifikaciju

### User Profile
- Statistike korisnika (teme, odgovori, reputacija)
- Najnovije teme i odgovori
- Role badges (Admin, Moderator)
- Datum pridruživanja
- Akademske informacije (sveučilište, fakultet, program, godina studija, godina završetka)
- Uređivanje profila sa dropdown odabirom sveučilišta i fakulteta

### Admin Panel
- Upravljanje korisnicima (ban, promote, role assignment)
- Moderacija tema (pin, lock, delete)
- Moderacija odgovora (delete)
- Analitika i statistika platforme
- **Napomena**: Kategorije su permanentne i generirane automatski po fakultetima

### UI/UX
- Skeleton loading states
- Responsive design (mobile-first)
- Dark mode support
- Optimizirane slike (AVIF/WebP)

## 📄 Status

**✅ Production Ready** - All core features implemented and optimized

### 🆕 Najnovija Ažuriranja (V2.6.1 - 23. prosinac 2025.)

**Najnovije značajke:**
- ✨ **Bot korisnici za testiranje** - SQL skripte za kreiranje 60 bot korisnika sa realističnim hrvatskim imenima i prezimenom
- ✨ **Automatska generacija sadržaja** - Botovi automatski kreiraju teme (30-240), odgovore (180-600) i glasove (300-900)
- ✨ **Prirodan ton komunikacije** - Razgovorna hrvatska gramatika sa slengom, tipfelerima i emojijima
- ✨ **Varijacija u stilu pisanja** - Miješano veliko/malo slovo, različiti tonovi i razine formalnosti
- ✨ **Dinamički predmeti i profesori** - 33 predmeta i 38 profesorskih referenci (formalni i nadimci) u temama

**Prethodne značajke (V2.6.0):**
- ✨ **Hijerarhijska struktura foruma** - 4 sveučilišta, 12 fakulteta, 72 kategorije
- ✨ **Navigacija sveučilište/fakultet** - Intuitivna navigacija kroz akademsku strukturu
- ✨ **Dropdown odabir fakulteta** - Cascading dropdown u profilu (sveučilište → fakultet)
- ✨ **Akademske informacije profila** - Prikaz sveučilišta, fakulteta, programa, godine studija
- ✨ **Sustav gamifikacije** - Postignuća, ljestvice (svih vremena i tjedne), praćenje aktivnosti
- ✨ **Moderacija sadržaja** - Detekcija spam-a, ograničavanje stope, filtriranje sadržaja (hrvatski)
- ✨ **Ankete i reakcije** - Kreiranje anketa i reakcijski sustav za postove
- ✨ **Vercel Analytics** - Praćenje performansi i jedinstvenih pregleda po korisniku
- ✨ **Poboljšana registracija** - Real-time provjera e-maila, brojač znakova, persisted form data
- ✨ **Email verifikacija** - Obavezna verifikacija prije pristupa forumu
- ✨ **Breadcrumb navigacija** - Navigacijski putevi kroz sve stranice foruma
- ✨ **Privatne poruke** - Sustav privatnih poruka i praćenja korisnika
- ✨ **Bookmarks** - Spremanje omiljenih tema

**Optimizacije:**
- ⚡ Masivna optimizacija performansi - 60-85% brže učitavanje stranica
- ⚡ Paralelni database upiti - 3-5x brže izvršavanje upita
- ⚡ Dark mode s dropdown birač tema
- ⚡ Responzivne animacije i vizualni feedback

**Popravci:**
- 🐛 TypeScript greške kroz cijelu aplikaciju
- 🐛 RLS pravila za server-side operacije
- 🐛 Middleware deprecation (Next.js 16)
- 🐛 Supabase client inicijalizacija
- 🐛 Email template rendering i kompatibilnost

---

**Napomena:** Za detaljne upute o postavljanju projekta, pogledaj sekciju "📦 Instalacija" iznad.
