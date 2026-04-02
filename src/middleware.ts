import { withAuth } from "next-auth/middleware";

export default withAuth({ pages: { signIn: "/login" } });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trilha/:path*",
    "/lesson/:path*",
    "/revisao/:path*",
    "/prova/:path*",
    "/perfil/:path*",
  ],
};
