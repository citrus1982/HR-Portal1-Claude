export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/candidate/:path*", "/employer/:path*", "/admin/:path*"],
}
