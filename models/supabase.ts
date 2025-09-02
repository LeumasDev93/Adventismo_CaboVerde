import { type GetServerSidePropsContext } from "next";
import { createBrowserClient, createServerClient, serializeCookieHeader } from "@supabase/ssr";

export const createSupabaseServerClient = ({req, res}: GetServerSidePropsContext) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] || "" }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            "Set-Cookie",
            cookiesToSet.map(({ name, value, options}) => serializeCookieHeader(name, value, options)
            )
          );
        }     
      }
    }
  );

  return supabase;
}

export const createComponentClient = () => {
  const supabase = createBrowserClient(
    "https://ltzbopxmezdanyjejfpy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0emJvcHhtZXpkYW55amVqZnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MDA2NDEsImV4cCI6MjA2NjA3NjY0MX0.lRa62f_xUBwWUpFTrtDSTF_LWANTU7Zoj9HPoTWa2k4"
  );

  return supabase;
}

export const createApiClient = () => {
  const supabase = createServerClient(
    "https://ltzbopxmezdanyjejfpy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0emJvcHhtZXpkYW55amVqZnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MDA2NDEsImV4cCI6MjA2NjA3NjY0MX0.lRa62f_xUBwWUpFTrtDSTF_LWANTU7Zoj9HPoTWa2k4",
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Não fazer nada para API routes
        }
      }
    }
  );

  return supabase;
}