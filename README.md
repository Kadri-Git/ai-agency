# Vibe-Coding Starter

You just got yourself a fully loaded website starter kit. Everything is already installed and configured. No setup headaches, no YouTube tutorials needed.

### Why do you need this?

You do not need a computer science degree to build a website anymore. But if you start from scratch, you will spend days figuring out which tools to use, how to set them up, and why things are not working. This starter kit gives you a professional setup from day one. All the best practices, all the right tools, already configured. You do not need to know everything to create a product these days.

### How does it work?

This kit is built for vibe coding. You describe what you want to an AI (like Cursor), and it writes the code for you. Your job is to have ideas and give feedback. The AI already knows how this project is structured, so it gives you better code that actually works.

Inside you will find ready-to-use buttons, cards, forms, icons, dark mode, and a bunch of other goodies. Think of it as IKEA furniture that is already assembled. You just arrange it how you want.

## Getting Started

Before you start, make sure you have [Node.js](https://nodejs.org) installed (version 20.9+ or 22.12+). Then open your terminal in the project folder.

### 1. First time setup (only once)

```bash
npm install
```

Downloads all the packages your project needs. You only run this once when you first get the project, or when someone adds new packages.

### 2. Every time you develop

```bash
npm run dev
```

Starts your website at localhost:3000. Every change you make shows up here instantly. Keep this running while you work.

```bash
npm run storybook
```

Opens the component playground at localhost:6006 (run in a second terminal). This shows all your buttons, cards, and components in isolation. Great for designing pieces without touching your main app.

### 3. When you finish a feature

```bash
npm test
```

Runs all your tests to make sure nothing broke. Do this before you share your code or deploy. Catches bugs before your users do.

### 4. When you are ready to go live

Right now your website only works on your computer. To put it on the internet where anyone can visit it, you need two things:

**GitHub** - Think of [GitHub](https://github.com) as a cloud backup for your code. You save your project there, and it keeps track of every change you make. It is free. Create an account, then use Cursor to "push" your code to GitHub.

**Vercel** - [Vercel](https://vercel.com) is like a web host, but way easier. It takes your code from GitHub and turns it into a real website with a URL anyone can visit. Also free for personal projects. Sign up with your GitHub account, click "Add New Project", pick your project, and hit "Deploy". Done.

The magic: every time you push new code to GitHub, Vercel notices and updates your website automatically. No extra steps needed.

## What's Inside

| Package | What it does |
|---------|-------------|
| [Next.js](https://nextjs.org/docs) | The Website Engine. This is what makes your website actually work. It turns your pages into a real website that loads fast and looks great on Google. |
| [TypeScript](https://www.typescriptlang.org/docs) | Error Prevention. Catches mistakes before they become problems. It also helps AI understand your code better. |
| [Tailwind CSS](https://tailwindcss.com/docs) | Styling System. How things look - colors, spacing, fonts. Just add words like "bg-blue-500" to make something blue. |
| [Shadcn/ui](https://ui.shadcn.com) | Ready-Made Components. Buttons, cards, forms, dialogs, menus - all designed and ready to use in src/components/ui/. |
| [Storybook](https://storybook.js.org/docs) | Component Playground. Run "npm run storybook" and get a visual catalog of all your components. |
| [Zustand](https://zustand.docs.pmnd.rs) | Shared Data. When different parts of your website need to know the same thing. Check src/store/ for examples. |
| [React Hook Form + Zod](https://react-hook-form.com/get-started) | Smart Forms. Forms that check if emails are real emails, passwords are long enough, and show helpful errors. |
| [ESLint + Prettier](https://eslint.org/docs/latest) | Code Cleanup. Automatically makes your code look neat and catches silly mistakes. |
| [Husky + lint-staged](https://typicode.github.io/husky) | Safety Net. Before you save your work, this checks if everything is okay. |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark Mode. Light theme, dark theme - already working. |
| [Lucide React](https://lucide.dev/icons) | Icons. Over 1000 beautiful icons included. |
| [Sonner](https://sonner.emilkowal.ski) | Toast Notifications. Those little messages that pop up to tell you something worked. |
| [Vitest + Playwright](https://vitest.dev/guide) | Testing Tools. Vitest for code logic, Playwright for testing like a real user would. |
| [Motion](https://motion.dev/docs) | Animations. Make things move smoothly. Fade, slide, animate on hover. |

## How to Prompt

The magic of vibe coding is talking to AI and getting working code back. Here is how to get the best results.

### 1. Be specific about what you want

The more details you give, the better results you get. Instead of "make a form", try:

> "Create a contact form with name, email, and message fields. Add a submit button. Show an error if email is invalid. Show a success message after submitting."

### 2. Use existing components and Tailwind

Your project uses [Shadcn/ui](https://ui.shadcn.com) components (in src/components/ui/) styled with [Tailwind CSS](https://tailwindcss.com/docs). Tell AI to use both:

> "Create a pricing card using the Card component from @/components/ui/card and Button from @/components/ui/button. Style it with Tailwind classes. Add a blue gradient background and rounded corners."

### 3. Use the playground

Run "npm run storybook" first. Then you can say things like:

> "I saw a card with a footer in Storybook. Create something similar but for a product with an image, title, price, and 'Add to cart' button."

### 4. Ask for changes step by step

Do not try to build everything at once. Start simple, then add:

> First: "Create a simple navbar with a logo and three links."
> Then: "Add a mobile menu that opens when you tap a hamburger icon."
> Then: "Add dark mode toggle to the navbar."

### 5. When something breaks, explain what you see

AI cannot see your screen. Describe the problem:

> "The button is there but nothing happens when I click it. I expected it to open a popup. Here is the code: [paste your code]"

### 6. Ask AI to explain

Do not just copy-paste. Learn as you go:

> "This code works but I do not understand what useEffect does. Can you explain it like I am 10 years old?"

### 7. Request mobile-friendly designs

Always mention mobile. Otherwise you might get desktop-only layouts:

> "Create a hero section with a headline, subtitle, and two buttons. Make sure it looks good on phones too."

### 8. Save time with "similar to"

If you see something you like on another website:

> "Create a testimonial section similar to what Stripe has on their homepage. Use the Card component and add star ratings."

### 9. Never use time to fix bugs

If AI suggests using setTimeout or "wait 100ms" to fix a problem, reject it. That is a hack that will break later:

> "This works only when I add a setTimeout. That feels wrong. Can you fix it properly? I want to wait for the actual data to load, not guess how long it takes."

### 10. Ask AI to write and run tests

Tests catch bugs before users do. Ask AI to create them for important features:

> "Write tests for my checkout function. It should calculate the correct total, apply discounts, and handle empty carts. Run the tests and fix any failures."

## License

MIT License - see [LICENSE](./LICENSE) for details.
