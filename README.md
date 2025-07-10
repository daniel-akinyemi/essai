# Essai

**Essai** is a modern, AI-powered essay writing and analysis platform. Designed for everyone—from students to professionals—it offers a beautiful, intuitive interface and a suite of smart tools to help you write, analyze, and improve your essays.

---

## ✨ Features

- **Essay Generator:** Instantly create high-quality essays with AI assistance.
- **Essay Rewriter:** Improve and rephrase your writing for clarity and impact.
- **Paragraph Analyzer:** Get detailed feedback on paragraph relevance and coherence.
- **Score Essay:** Submit essays for instant AI-powered scoring and feedback.
- **Essay History:** View, manage, and clear your essay history.
- **Writing Guide:** Access tips and best practices for effective writing.
- **Settings Panel:**  
  - Profile picture upload  
  - Writing preferences (style, type, length)  
  - Auto-save frequency  
  - Notifications (email, push, writing tips)  
  - Privacy & analytics controls  
  - Appearance (theme, language)  
  - User info and sign out
- **Modern UI:**  
  - Beautiful gradients, glassmorphism, and responsive design  
  - Smooth animations and intuitive navigation  
  - Split layouts for auth pages with feature highlights

---

## 🚀 Getting Started

### 1. **Clone the repository**
```bash
git clone https://github.com/your-username/essai.git
cd essai/essai
```

### 2. **Install dependencies**
```bash
pnpm install
```

### 3. **Set up environment variables**
- Copy `.env.example` to `.env` and fill in your credentials (Supabase, NextAuth, etc.)

### 4. **Set up the database**
```bash
pnpm prisma db push
pnpm prisma generate
```

### 5. **Run the development server**
```bash
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Prisma ORM** (PostgreSQL/Supabase)
- **NextAuth.js** (Google & Credentials)
- **Tailwind CSS** (with custom gradients and glassmorphism)
- **Supabase** (database & storage)
- **Lucide Icons**
- **TypeScript**

---

## 📝 Customization

- **Settings Panel:**  
  All user preferences are saved to the database and applied across the platform.
- **Profile Picture:**  
  Uses a placeholder avatar service by default; can be extended to use Supabase Storage, S3, or Cloudinary.
- **Auth Pages:**  
  Feature-rich split layouts with gradients and feature highlights.

---

## 📦 Project Structure

```
essai/
  ├── src/
  │   ├── app/                # Next.js app directory (routes, layouts, pages)
  │   ├── components/         # Reusable UI components
  │   ├── lib/                # Utility libraries (Prisma, Supabase, etc.)
  │   ├── prisma/             # Prisma schema
  │   └── public/             # Static assets (SVGs, favicon, etc.)
  ├── .env.example            # Environment variable template
  ├── package.json
  └── README.md
```

---

## 🧑‍💻 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [Supabase](https://supabase.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Essai** — Write smarter, analyze deeper, and grow as a writer. 