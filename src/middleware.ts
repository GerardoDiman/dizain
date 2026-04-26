import { defineMiddleware } from "astro:middleware";
import { supabase } from "@lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Handle unprefixed admin routes by redirecting to default locale
  if (pathname.startsWith("/admin")) {
    return context.redirect(`/es${pathname}`);
  }

  const isAdminRoute = pathname.includes("/admin");
  const isLoginPage = pathname.endsWith("/admin/login");

  if (isAdminRoute && !isLoginPage) {
    const token = context.cookies.get("dz-admin-token")?.value;
    console.log(`[Middleware] Route: ${pathname}`);
    console.log(`[Middleware] Token present: ${!!token}`);
    
    if (!token) {
      console.log('[Middleware] ❌ No token found in cookies. Redirecting to login.');
      const locale = context.params.lang || 'es';
      return context.redirect(`/${locale}/admin/login`);
    }

    try {
      // Verify user with Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        console.log('[Middleware] Supabase Auth Error or No User:', error?.message || 'No user data');
        context.cookies.delete("dz-admin-token", { path: "/" });
        const locale = context.params.lang || 'es';
        return context.redirect(`/${locale}/admin/login`);
      }
      
      console.log(`[Middleware] Access granted for: ${data.user.email}`);
      context.locals.user = data.user;
    } catch (e) {
      console.error('[Middleware] Unexpected Exception:', e);
      const locale = context.params.lang || 'es';
      return context.redirect(`/${locale}/admin/login`);
    }
  }

  return next();
});

