import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/rabbi/Logo";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <div className="animate-in fade-in flex min-h-[70vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-navy">
          ወደ አካውንትዎ ይግቡ
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ወይም{" "}
          <a href="#" className="font-medium text-gold hover:text-gold/80">
            አዲስ አካውንት ይፍጠሩ
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow-card sm:rounded-lg sm:px-10 border border-gold/10">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy">
                ኢሜይል ወይም ስልክ ቁጥር
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-navy/20 px-3 py-2 placeholder-muted-foreground shadow-sm focus:border-gold focus:outline-none focus:ring-gold sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy">
                የይለፍ ቃል (Password)
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full appearance-none rounded-md border border-navy/20 px-3 py-2 placeholder-muted-foreground shadow-sm focus:border-gold focus:outline-none focus:ring-gold sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-navy/20 text-gold focus:ring-gold"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  አስታውሰኝ
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-gold hover:text-gold/80">
                  የይለፍ ቃል ረሱ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-gold px-4 py-2 text-sm font-semibold text-navy-deep shadow-sm transition-all hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 active:scale-95"
              >
                ግባ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
