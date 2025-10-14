import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Create a Supabase server client (Next.js 15: cookies() is async). */
export async function createSupabaseServer() {
  const cookieStore = await cookies(); // <-- await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // In Server Components cookies are read-only, so make writes safe no-ops.
        set(_name: string, _value: string, _options: CookieOptions) {
          void _name;   // explicitly mark unused
          void _value;
          void _options;
        },
        remove(_name: string, _options: CookieOptions) {
          void _name;
          void _options;
        },
      },
    }
  );
}
