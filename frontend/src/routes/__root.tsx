
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PopupVideoWidget } from "@/components/rabbi/PopupVideoWidget";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/language";
import { Toaster } from "sonner";

// ============================================
// RABBI DIGITAL - HOMEPAGE SEO CONFIGURATION
// ============================================

const SITE_URL = "https://www.rabbidigital.com";

const SEO_TITLE =
  "RABBI Digital | መንፈሳዊ ዲጂታል ምርቶችና የክርስቲያን ትምህርት";

const SEO_DESCRIPTION =
  "RABBI Digital መንፈሳዊ ዲጂታል ምርቶችን፣ የመጽሐፍ ቅዱስ ጥናት መርጃዎችን፣ የክርስቲያን መጻሕፍትንና የእምነት ማጠናከሪያ ትምህርቶችን በቀላሉ የሚያገኙበት የኢትዮጵያ ዲጂታል መድረክ ነው።";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: ErrorComponentProps) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          to the home page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ROOT ROUTE
// ============================================

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        // Basic SEO
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },

        { title: SEO_TITLE },

        {
          name: "description",
          content: SEO_DESCRIPTION,
        },

        {
          name: "robots",
          content: "index, follow, max-image-preview:large",
        },

        {
          name: "googlebot",
          content: "index, follow, max-image-preview:large",
        },

        {
          name: "application-name",
          content: "RABBI Digital",
        },

        // Open Graph - Facebook, WhatsApp, Telegram
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "RABBI Digital",
        },
        {
          property: "og:title",
          content: SEO_TITLE,
        },
        {
          property: "og:description",
          content: SEO_DESCRIPTION,
        },
        {
          property: "og:locale",
          content: "am_ET",
        },

        // Twitter / X
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: SEO_TITLE,
        },
        {
          name: "twitter:description",
          content: SEO_DESCRIPTION,
        },
      ],

      links: [
        // NOTE: canonical is intentionally omitted here.
        // Each route declares its own canonical via head().

        // Stylesheet
        {
          rel: "stylesheet",
          href: appCss,
        },

        // Google Fonts
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=Noto+Serif+Ethiopic:wght@400;600;700&display=swap",
        },

        // Favicon
        {
          rel: "icon",
          href: "/favicon.ico",
          type: "image/x-icon",
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.rabbidigital.com/#organization",
                "name": "RABBI Digital",
                "url": "https://www.rabbidigital.com",
                "description": "RABBI Digital — የኢትዮጵያ ዲጂታል ክርስቲያን መድረክ። መጻሕፍት፣ ኮርሶች፣ ሚዲያ፣ ጽሑፎችና ጸሎት በአንድ ቦታ።",
                "inLanguage": ["am", "or", "en"],
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.rabbidigital.com/favicon.ico"
                },
                "sameAs": [
                  "https://www.facebook.com/rabbidigital",
                  "https://www.youtube.com/@rabbidigital",
                  "https://t.me/rabbi_admin"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://www.rabbidigital.com/#website",
                "url": "https://www.rabbidigital.com",
                "name": "RABBI Digital",
                "publisher": {
                  "@id": "https://www.rabbidigital.com/#organization"
                },
                "inLanguage": "am",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.rabbidigital.com/books?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          })
        }
      ],

    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

// ============================================
// ROOT HTML SHELL
// ============================================

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="am">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ============================================
// ROOT APPLICATION COMPONENT
// ============================================

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen w-full bg-cream font-body flex gap-0 flex-col overflow-x-hidden">
            {!isAdmin && <Header />}

            <main className="flex-1">
              <Outlet />
            </main>

            {!isAdmin && <Footer />}

            {!isAdmin && <PopupVideoWidget />}

            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={5000}
              toastOptions={{
                classNames: {
                  toast: "font-body text-sm",
                  title: "font-bold",
                  description: "text-xs opacity-80",
                },
              }}
            />
          </div>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
