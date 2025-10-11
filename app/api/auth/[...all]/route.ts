import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// /api/auth/signin,
// /api/auth/signout,
// /api/auth/callback/:provider,
// /api/auth/session,
// /api/auth/csrf
