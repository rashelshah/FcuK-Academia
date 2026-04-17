'use client';

import React, { useState } from 'react';

import LegalModal from '@/components/ui/LegalModal';

interface HomeFooterProps {
  title: string;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Content strings — DO NOT MODIFY                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

const POLICY_CONTENT = `# FCUK ACADEMIA — PRIVACY POLICY

**Last Updated:** 16th April 2026

We're not here to spy on you. We're here to make your academic life less painful 😭

## What We Collect

Your SRM login is only used to fetch your:

* Marks
* Attendance
* Timetable

…in real-time — so you don't have to deal with that clunky portal again.

## What We Don't Do

We don't store your data. We don't sell it. We're definitely not tracking you around the internet like some weird stalker 💀

**Everything stays between you and the official system — we just make it look better.**

## What We Actually Do

* We do not permanently store your academic data
* We do not sell or share your personal data
* We do not track your activity across other websites
* We do not store your passwords beyond necessary session usage

> «fetched in real-time using user-authorized access and shown with improved UI/UX.»

## Notifications

If enabled, you'll get alerts like attendance warnings 📉, marks updates 📊, and other useful stuff. We do **NOT** send spam or promotional junk. Only useful stuff. Promise.

## Transparency Statement

FCUK Academia acts only as:

> «a visual interface layer between you and your academic system»

* No interference
* No central db
* No redistribution

## Branding

**FCUK stands for Fully Controlled University Kit.** No hidden meaning. Relax 😏

## Final Word

Your data stays yours. Always. We're just the middleman making things look cool ✨`;

const TERMS_CONTENT = `# FCUK ACADEMIA — TERMS OF USE

**Last Updated:** 17th April 2026



## 1. ACCEPTANCE OF TERMS

By accessing or using FCUK Academia ("Platform"), you agree to be bound by these Terms of Use.

If you do not agree, you must discontinue use immediately.



## 2. ELIGIBILITY

You agree that:

* You are authorized to access the academic data you view
* You are using your own valid credentials
* You will not access data belonging to others without permission



## 3. PLATFORM USAGE

You agree to use the platform only for:

* Personal academic tracking
* Informational purposes

You must NOT:

* Attempt unauthorized access to any system
* Reverse engineer or exploit the platform
* Use automation, bots, or scripts for misuse
* Perform actions that may harm institutional systems



## 4. NO AFFILIATION

FCUK Academia is:

* NOT affiliated with SRM Institute of Science and Technology (SRMIST)
* NOT endorsed by any institution

Use of this platform is independent and voluntary.



## 5. DATA ACCESS RESPONSIBILITY

You acknowledge:

* Data is accessed through **user-authorized sessions**
* The platform does **NOT generate, modify, or validate academic data**

You are responsible for:

* Verifying information via official portals
* Ensuring proper use of your credentials



## 6. THIRD-PARTY INTEGRATION (RateMyFaculty)

FCUK Academia integrates certain features from third-party platforms, including **RateMyFaculty**.

### Important Clarifications:

* All faculty reviews, ratings, and user-generated content are **owned and managed entirely by RateMyFaculty**
* FCUK Academia **does NOT create, edit, moderate, or control** such content
* We only provide a **visual interface layer** to access this information


## 7. USER-GENERATED CONTENT DISCLAIMER

You acknowledge that:

* Reviews may contain **opinions, subjective views, or informal language**
* Such content may be **blunt, critical, or expressive in nature**

FCUK Academia:

* Does **NOT endorse, verify, or take responsibility** for any review content
* Shall **NOT be held liable** for any statements made by users on third-party platforms
* Does **NOT guarantee accuracy, fairness, or appropriateness** of such content


## 8. ANONYMITY & DATA HANDLING (THIRD-PARTY)

* Reviewer identity, if any, is handled by **RateMyFaculty systems**
* Any anonymization (hashing, salting, etc.) is managed externally
* FCUK Academia does **NOT store, access, or control reviewer identity data**


## 9. PROHIBITED USE

You agree NOT to:

* Use the platform for scraping, resale, or redistribution
* Attempt to overload or disrupt services
* Circumvent authentication mechanisms
* Use the platform in violation of institutional rules


## 10. SERVICE MODIFICATIONS

We reserve the right to:

* Modify or discontinue the platform
* Add, remove, or restrict features (including third-party integrations)
* Terminate access at any time

Without prior notice.


## 11. LIMITATION OF LIABILITY

FCUK Academia shall NOT be liable for:

* Data inaccuracies
* Misinterpretation of academic or review content
* Any decisions made based on platform usage
* Any third-party content (including RateMyFaculty reviews)

Use of the platform is entirely at your own risk.


## 12. TERMINATION

We may suspend or terminate access if:

* Terms are violated
* Misuse is detected
* Security or legal risks arise


## 13. INDEMNIFICATION

You agree to indemnify and hold harmless FCUK Academia and its developers from:

* Claims arising from misuse of the platform
* Any disputes related to third-party content
* Institutional conflicts caused by user actions
* Unauthorized activities performed using your account


## 14. INTELLECTUAL PROPERTY

* Platform design, UI, and features belong to FCUK Academia developers
* Academic data belongs to respective institutions
* Third-party content belongs to its respective owners


## 15. GOVERNING LAW

These Terms are governed by the laws of India.

Jurisdiction:

**Chengalpattu, Tamil Nadu, India**


## 16. CONTACT

For queries:

📧 [rashelshah11@gmail.com](mailto:rashelshah11@gmail.com)
📧 [biswa2020jit@gmail.com](mailto:biswa2020jit@gmail.com)

---

## FINAL STATEMENT

FCUK Academia is provided:

> "as-is" and "as-available"

It is a **student utility platform**, not a replacement for official systems or third-party services.

Use responsibly.`;

const LEGAL_CONTENT = `# FCUK ACADEMIA — LEGAL DISCLAIMER

**Last Updated:** 17th April 2026



## 1. INTRODUCTION

Welcome to **FCUK Academia** ("Platform", "we", "our", "us").

This platform is a student-built informational tool designed to enhance the accessibility and usability of academic data for students.

By accessing or using this platform, you agree to this Legal Disclaimer and associated Terms of Use.



## 2. NATURE OF THE PLATFORM

FCUK Academia:

* Is an **independent student project**
* Is **NOT affiliated, associated, endorsed, or officially connected** with SRM Institute of Science and Technology (SRMIST) or any of its official systems
* Functions as a **user interface layer** to improve visibility and usability of academic information



## 3. DATA ACCESS & USAGE MODEL (IMPORTANT)

FCUK Academia does **NOT independently scrape, crawl, or extract institutional databases in an unauthorized manner**.

Instead:

* The platform operates as a **user-initiated interface layer**
* Data is accessed **only after the user provides valid credentials**
* Information is **fetched in real-time from official academic sources via user-authorized sessions**

### Legal Positioning:

* Acts strictly as a **client-side facilitator**
* Does **NOT bypass authentication mechanisms**
* Does **NOT access data without user consent**
* Does **NOT store or replicate institutional databases**

> All data access occurs strictly within the scope of what the user is already authorized to view on official platforms.



## 4. DATA SOURCE CLARIFICATION

The platform may display:

* Academic records
* Attendance details
* Timetable information

Important:

* All data originates from **official SRM academic systems**
* We do **NOT generate, modify, or fabricate academic data**
* We only present **user-specific data in an improved UI/UX format**



## 5. THIRD-PARTY SERVICES & CONTENT (CRITICAL)

FCUK Academia may integrate or provide access to third-party services, including but not limited to **RateMyFaculty**.

### Clarifications:

* All reviews, ratings, comments, and opinions are **created and owned by third-party platforms/users**
* FCUK Academia acts only as a **display/interface layer**
* We do **NOT create, edit, verify, or moderate such content**



## 6. USER-GENERATED CONTENT DISCLAIMER

You acknowledge that third-party content:

* May include **subjective opinions, criticism, satire, or informal/strong language**
* May not always be accurate, complete, or appropriate

FCUK Academia:

* Does **NOT endorse or validate** any such content
* Shall **NOT be held liable** for any statements, reviews, or opinions expressed
* Does **NOT assume responsibility for defamation, harm, or disputes arising from such content**



## 7. ANONYMITY & DATA HANDLING (THIRD-PARTY)

* Any anonymity mechanisms (including hashing, salting, or identity masking) are handled **externally by third-party platforms**
* FCUK Academia does **NOT store, access, or control reviewer identity data**
* We do **NOT maintain any database of reviewer identities**



## 8. COMPLIANCE WITH FAIR USE & DIGITAL ACCESS PRINCIPLES

FCUK Academia operates under:

* Principles of **fair use of user-authorized data**
* **Educational and non-commercial intent**
* **No redistribution of institutional datasets**

The platform:

* Does **NOT replicate or host institutional systems**
* Does **NOT interfere with official servers**
* Does **NOT perform automated bulk extraction or high-frequency requests**



## 9. USER CONSENT & RESPONSIBILITY

By using this platform, you acknowledge:

* You are accessing **your own academic data**
* You have the **rightful authorization** to access such data
* You are using the platform voluntarily

Users agree:

* Not to misuse the platform
* Not to attempt unauthorized access or exploitation
* To comply with institutional policies



## 10. NO DATA OWNERSHIP CLAIM

FCUK Academia:

* Does **NOT claim ownership** over academic or institutional data
* Recognizes such data belongs to **SRMIST or respective authorities**



## 11. PURPOSE & INTENT

This platform is created strictly for:

* Educational use
* Personal academic tracking
* Improving student accessibility

We explicitly state:

> We have **no intention to harm, misuse, disrupt, or undermine** any institution, faculty member, or individual.



## 12. NON-AFFILIATION & RESPECT CLAUSE

FCUK Academia:

* Is **NOT affiliated with SRMIST**
* Does **NOT claim endorsement or partnership**

We operate with full respect toward:

* Institutions
* Faculty
* Students



## 13. TERMINOLOGY & LANGUAGE DISCLAIMER

### 13.1 "FCUK"

> **FCUK = Fully Controlled University Kit**

This is strictly a **brand identity** and not intended to convey offensive meaning.



### 13.2 Contextual Expression ("Fucked")

Certain UI expressions are used for **humor and relatability**.

These:

* Are **non-targeted and non-defamatory**
* Do **NOT refer to any individual or institution**
* Are not intended to insult or degrade



## 14. LIMITATION OF LIABILITY

FCUK Academia shall not be liable for:

* Data discrepancies
* Misinterpretation of information
* Decisions made using the platform
* Any third-party content or reviews

Users must verify all critical information via official sources.



## 15. NO SERVICE GUARANTEE

We reserve the right to:

* Modify, suspend, or discontinue services
* Add or remove features (including integrations)

Without prior notice.



## 16. PRIVACY & DATA HANDLING

We prioritize user privacy:

* We do **NOT sell user data**
* We do **NOT share academic data with third parties**
* We do **NOT store sensitive credentials beyond necessary usage**



## 17. INDEMNIFICATION

Users agree to indemnify and hold harmless FCUK Academia and its developers from:

* Misuse of the platform
* Third-party content disputes
* Institutional conflicts arising from usage
* Any legal claims arising from user actions



## 18. JURISDICTION

This platform is governed by the laws of India.

Jurisdiction:

**Chengalpattu, Tamil Nadu, India**



## 19. CONTACT

For legal concerns:

📧 [rashelshah11@gmail.com](mailto:rashelshah11@gmail.com)
📧 [biswa2020jit@gmail.com](mailto:biswa2020jit@gmail.com)



## FINAL STATEMENT

FCUK Academia is a **student-first initiative built in good faith**.

We act only as:

> a **facilitator of information**, not a source or authority of content.

Use responsibly.`;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

type LegalDoc = 'policy' | 'terms' | 'legal' | null;

export default function HomeFooter({ title }: HomeFooterProps) {
  const [openDoc, setOpenDoc] = useState<LegalDoc>(null);

  return (
    <>
      <footer className="mt-24 px-6 pb-3">
        <div className="flex flex-col gap-4 text-left">
          <p
            className="font-headline text-[clamp(3.2rem,14vw,4.4rem)] font-bold leading-[0.88] tracking-tight"
            style={{ color: 'color-mix(in srgb, var(--text) 90%, transparent)' }}
          >
            {title}
          </p>
          <p className="max-w-sm text-sm leading-7 text-on-surface-variant">
            Crafted to make the SRM grind feel a little less brutal and a lot more alive.
          </p>

          {/* Legal links bar */}
          <div
            className="flex items-center justify-center gap-0 pt-1"
            style={{ marginTop: '8px' }}
          >
            <LegalLink label="Policy" onClick={() => setOpenDoc('policy')} />
            <Separator />
            <LegalLink label="Terms of Use" onClick={() => setOpenDoc('terms')} />
            <Separator />
            <LegalLink label="Legal Disclaimer" onClick={() => setOpenDoc('legal')} />
          </div>
        </div>
      </footer>

      {/* Policy modal */}
      <LegalModal
        open={openDoc === 'policy'}
        onClose={() => setOpenDoc(null)}
        title="privacy (no shady stuff)"
        kicker="privacy"
        content={POLICY_CONTENT}
      />

      {/* Terms of Use modal */}
      <LegalModal
        open={openDoc === 'terms'}
        onClose={() => setOpenDoc(null)}
        title="terms of use"
        kicker="terms"
        content={TERMS_CONTENT}
      />

      {/* Legal Disclaimer modal */}
      <LegalModal
        open={openDoc === 'legal'}
        onClose={() => setOpenDoc(null)}
        title="legal disclaimer"
        kicker="legal"
        content={LEGAL_CONTENT}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function LegalLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 text-[11px] font-medium transition-all duration-150"
      style={{
        color: 'var(--text-subtle)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-subtle)';
        (e.currentTarget as HTMLButtonElement).style.opacity = '';
      }}
    >
      {label}
    </button>
  );
}

function Separator() {
  return (
    <span
      className="select-none text-[11px]"
      style={{ color: 'var(--text-subtle)', opacity: 0.5 }}
      aria-hidden="true"
    >
      •
    </span>
  );
}
