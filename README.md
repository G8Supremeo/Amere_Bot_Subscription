<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=FF8ACD&height=230&section=header&text=Amere%20Subscription%20Wizard&fontSize=42&fontColor=ffffff&animation=twinkling" />

<h2>✨ Multi-step Chatbot Subscription Form ✨</h2>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1200&color=FF73C9&center=true&vCenter=true&width=520&lines=Sweet+chatbot-style+subscription+flow;Feminine+UI+with+soft+animations;Mock+payments+%26+local+saving;Built+with+HTML+%2B+CSS+%2B+JS" alt="Typing intro" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-ff6f91?style=for-the-badge&logo=html5&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/CSS3-fc85ae?style=for-the-badge&logo=css3&logoColor=ffffff" />
  <img src="https://img.shields.io/badge/JavaScript-f9a8d4?style=for-the-badge&logo=javascript&logoColor=2d2a32" />
</p>

</div>

Welcome to **Amere Subscription Wizard** – a multi-step, chatbot-flavoured subscription form for an imaginary AI assistant, dressed in gradients and micro‑animations instead of plain boxes.

This README is a **visual story** of the project: what it does, how it feels to use, and how it’s built under the hood, so a human (you) can enjoy reading it and an employer can see the serious engineering hiding behind the pink gradients.

---

## Overview

### The challenge

Users should be able to:

- **Glide through steps**: Fill out personal info, pick a plan, choose add‑ons, review a summary, and complete a (mock) payment.
- **Move backward in time**: Jump back to earlier steps without losing their data.
- **See a smart summary**: Get a clear breakdown of plan, add‑ons, billing type, and total price.
- **Enjoy responsive design**: Use the form comfortably on mobile, tablet, and desktop.
- **Get helpful feedback**: See hover/focus styles and validation messages when something’s off.
- **Toggle themes**: Switch between a soft, feminine light theme and a sleek dark theme.
- **Resume later**: Have most of their data remembered thanks to local persistence.

### Chatbot-style walkthrough

```text
🧠 Amere Bot: Hey, welcome in! Ready to power up your conversations?

You: Sure, what do you need?

Step 1 – Your info
  👉 "Just your name, email, and phone so I know who I'm chatting with."

Step 2 – Choose your vibe
  👉 "Pick a plan that fits how often you want me to talk with your users."

Step 3 – Add some magic
  👉 "Toggle extra add‑ons like online service, extra storage, and a custom profile."

Step 4 – Quick recap
  👉 "Here's your plan, add‑ons, and total – change anything before we seal the deal."

Step 5 – Payment (demo)
  👉 "Type in mock card details – I validate them, but no real money moves."

Step 6 – All set
  👉 "You’re in! Your subscription is active in this demo world."
```

### Screenshot

_(Add your own screenshots here – both desktop and mobile views work great.)_

```text
📸 Pro tip:
Run the app, open the summary and payment steps,
and capture both light and dark themes for your portfolio.
```

### Links

- **Solution URL**: _https://github.com/G8Supremeo/Amere_Bot_Subscription_
- **Live Site URL**: _https://amere-bot-form.vercel.app_

---

## My process (the human + wizard collab)

### A quick visual tour

```text
Step 1 ──▶ Step 2 ──▶ Step 3 ──▶ Step 4 ──▶ Step 5 ──▶ Step 6
Your info   Plan       Add‑ons    Summary    Payment    Thank you

Theme:  light ⭢ dark ⭢ light ⭢ dark (toggle whenever you like)

Progress bar:
[■■□□□□□□] ▶ [■■■□□□□□] ▶ [■■■■■□□□] ▶ [■■■■■■■■]
   1/4           2/4            3/4           4/4
```

### Built with

- **Semantic HTML5** – Sections and headings that actually mean something.
- **CSS custom properties** – A tiny design system of pinks, purples, radii, and shadows.
- **Flexbox & CSS Grid** – Two-column desktop layout that collapses elegantly on mobile.
- **Vanilla JavaScript (no framework)** – State management, validation, and UI updates by hand.
- **LocalStorage** – So users don’t lose everything on refresh.
- **Vercel serverless function** – To log completed submissions and inspect them from the dashboard.

### What I built, step by animated step

#### 1. A form that behaves like a mini app

Behind the scenes, there’s a `formState` object that keeps track of:

- Current step (1–6).
- Billing period (monthly / yearly).
- Personal info.
- Selected plan.
- Selected add‑ons.
- Mock payment details.

Instead of scattering logic all over the DOM, the UI always reflects this single source of truth. Changing steps is just a call to `goToStep(stepNumber)`, which:

- Shows the correct `.step` section.
- Highlights the matching sidebar indicator.
- Updates the progress bar and label (`Step X of 4`).
- Manages which navigation buttons are visible/enabled.

#### 2. Pricing that actually reacts

When the user flips the billing toggle:

- Plan and add‑on prices are recalculated.
- A small “2 months free” tag appears for yearly plans.
- The summary total updates automatically.

The pricing is defined in plain JS objects (`PLANS` and `ADDONS`), so changing prices or adding a new plan is just data, not a refactor.

#### 3. A friendly but strict validator

Each step has validation that feels like a helpful reviewer:

- Step 1: Checks name, email format, and phone number.
- Step 2: Requires a plan to be selected.
- Step 3: Add‑ons are optional.
- Step 5: Validates payment fields with realistic rules:
  - Card number: 16 digits.
  - Expiry: Accepts `M/YY`, `MM/YY`, `MM/YYYY`, and checks if the date is in the future.
  - CVC: 3–4 digits.

If something’s wrong:

- The related field gets a soft red outline.
- A clear error message appears.
- The entire step gently “shakes” to draw attention without yelling.

#### 4. A payment step that feels real (but charges nobody)

The payment step:

- Collects mock card details.
- Validates them as if we were about to hit a real gateway.
- Builds a **safe payload** (only the last 4 digits of the card number are kept).
- Sends it to `/api/save-form` (a Vercel function) where it’s logged.

Then the button goes into a short `"Processing..."` state before showing the final thank‑you screen. Emotionally satisfying, technically safe.

#### 5. Persistence that quietly has your back

Every time the user:

- Types in personal info,
- Changes plan,
- Toggles add‑ons,
- Completes payment,

the current state is serialized and saved into `localStorage`. On reload, the app:

- Restores previous data into the form,
- Respects the chosen billing period,
- Keeps the theme preference.

It feels like a “real product” rather than a one‑off demo.

#### 6. A feminine, animated UI

The styling leans into:

- Soft pinks and purples for the light theme.
- A deep, cinematic dark theme for night owls.
- Animated details:
  - Step transitions that fade and slide.
  - A glowing, floating checkmark on the thank‑you screen.
  - A subtle glow around the theme toggle.
  - Progress bar that smoothly grows across steps.

```text
Micro‑interaction storyboard

Hover on plan card  ➜  card lifts up slightly and shadow deepens
Click “Next step”   ➜  current step fades out, next step fades+slides in
Validation fails    ➜  step container makes a soft left‑right shake
Theme toggle        ➜  colors cross‑fade between light and dark
Payment confirmed   ➜  checkmark pops in and gently floats
```

---

## Continued development

Things I’d like to explore next:

- **Real payment integration** – Hook the payment step up to Stripe or another provider.
- **Server-side storage** – Swap console logs for a proper database or spreadsheet export.
- **Accessibility audit** – Add more ARIA attributes and test thoroughly with screen readers.
- **Internationalization** – Support multiple languages and local currency formatting.
- **More step types** – For example, a review step where you can edit every section inline.

---

## Useful resources

- [MDN Web Docs](https://developer.mozilla.org/) – For checking HTML, CSS, and JS behavior.
- [web.dev – Form Best Practices](https://web.dev/tags/forms/) – Great guidance on accessible, user‑friendly forms.
- [Vercel Docs – Serverless Functions](https://vercel.com/docs/functions) – For wiring the `/api/save-form` endpoint.

---

## Author

- **Name** – _Supreme Oghenewoakpo_
- **Frontend Mentor** – _@G8Supremeo_
- **Twitter / X** – _@Desupreme_

---

## Acknowledgments

- Frontend Mentor for the original multi-step form challenge and design inspiration.
- Everyone who writes about form UX, accessibility, and state management – this project stands on those shoulders.

