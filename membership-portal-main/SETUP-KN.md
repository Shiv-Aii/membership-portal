# 1–2 ಗಂಟೆಯ MVP Setup — ಕನ್ನಡದಲ್ಲಿ

## A. Supabase
1. https://supabase.com ಗೆ ಹೋಗಿ account ಮಾಡಿ.
2. New Project → project create ಮಾಡಿ.
3. SQL Editor → `supabase/schema.sql` file‌ನ ಸಂಪೂರ್ಣ SQL paste ಮಾಡಿ → Run.
4. Storage ನಲ್ಲಿ `member-photos` bucket create ಆಗಿದೆಯೇ ನೋಡಿ.
5. Project Settings → API ನಲ್ಲಿ:
   - Project URL
   - anon public key
   copy ಮಾಡಿ.

## B. Admin account
Supabase → Authentication → Users → Add user.
ನಿಮ್ಮ admin email/password ನೀಡಿ.

## C. Website
Computer ಇದ್ದರೆ:
```bash
npm install
cp .env.example .env.local
```
`.env.local` ನಲ್ಲಿ Supabase URL ಮತ್ತು anon key ಹಾಕಿ.

ನಂತರ:
```bash
npm run dev
```
Browser ನಲ್ಲಿ `http://localhost:3000` ತೆರೆಯಿರಿ.

## D. Vercel hosting
1. https://vercel.com → Sign up.
2. ಈ project ಅನ್ನು GitHub ಗೆ upload ಮಾಡಿ.
3. Vercel → New Project → GitHub repository select.
4. Environment Variables ನಲ್ಲಿ:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ಹಾಕಿ.
5. Deploy.

## ಮುಖ್ಯ
ಈ MVP ನಲ್ಲಿ:
- Public registration
- Photo upload
- Pending/Approved/Rejected
- Admin login
- Membership number manual entry
- Website theme/text editor
- PVC card preview
- QR code
- PDF generation
ಇವೆ.

ಮುಂದಿನ Version ನಲ್ಲಿ:
- true drag/drop Canva-style designer
- front/back independent layers
- automatic sequential membership numbering with collision protection
- face crop UI
- dynamic database-driven form schema
- Kannada/Kanglish AI command editor
- audit logs / admin roles
ಸೇರಿಸಬಹುದು.


## 10 ನಿಮಿಷದ Quick Check
Deploy ಆದ ಮೇಲೆ:
1. `/register` ತೆರೆಯಿರಿ → test application submit ಮಾಡಿ.
2. Supabase Authentication ನಲ್ಲಿ create ಮಾಡಿದ admin account ಮೂಲಕ `/admin/login` login ಮಾಡಿ.
3. Pending application → Edit ಮಾಡಿ → Approve.
4. Membership number blank ಬಿಟ್ಟರೆ 6164, ಮುಂದಿನದು 6165... ಆಗುತ್ತದೆ.
5. Approved row → Card → Generate PDF.
6. `/admin/editor` ನಲ್ಲಿ heading/description/theme colour ಬದಲಿಸಿ → Save → homepage refresh ಮಾಡಿ.
