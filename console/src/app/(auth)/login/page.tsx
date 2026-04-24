import Link from "next/link";
import { StatisMark } from "@/components/auth/StatisMark";
import { signInWithOAuth, signInWithEmail } from "./actions";

export const metadata = { title: "Sign in · Statis" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[340px] bg-paper border border-rule rounded-[4px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_6px_16px_-8px_rgba(60,40,20,0.1)]">
      <div className="flex items-center justify-center gap-2.5 mb-[22px]">
        <StatisMark />
        <span className="font-sans font-semibold text-[17px] tracking-[-0.035em] text-ink">Statis</span>
      </div>

      <h1 className="font-sans font-medium text-[20px] tracking-[-0.025em] leading-tight text-center text-ink">Sign in.</h1>
      <div className="mb-[22px]" />

      <form action={async () => { "use server"; await signInWithOAuth("GoogleOAuth"); }}>
        <button type="submit" className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-paper border border-rule rounded-[3px] text-[13px] text-ink tracking-[-0.005em] hover:bg-bg hover:border-ink-muted transition-colors mb-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <form action={async () => { "use server"; await signInWithOAuth("GitHubOAuth"); }}>
        <button type="submit" className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-paper border border-rule rounded-[3px] text-[13px] text-ink tracking-[-0.005em] hover:bg-bg hover:border-ink-muted transition-colors mb-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#111" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          Continue with GitHub
        </button>
      </form>

      <div className="flex items-center gap-2.5 my-4 before:content-[''] before:flex-1 before:h-px before:bg-rule after:content-[''] after:flex-1 after:h-px after:bg-rule">
        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">or with email</span>
      </div>

      <form action={signInWithEmail}>
        <div className="mb-3">
          <label htmlFor="email" className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
          />
        </div>
        <div className="mb-3 text-right">
          <Link
            href="/forgot"
            className="text-[11px] text-ink-soft tracking-[-0.005em] border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity mt-2"
        >
          Continue
        </button>
      </form>

      <div className="text-center text-[12px] text-ink-muted mt-[18px] tracking-[-0.005em]">
        New to Statis? <Link href="/signup" className="text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent">Create an account</Link>
      </div>
    </div>
  );
}
