// // // app/admin/signin/page.jsx
// // "use client";

// // import { useState } from "react";
// // import { signIn } from "next-auth/react";
// // import { useSearchParams } from "next/navigation";

// // export default function AdminSignInPage() {
// //   const search = useSearchParams();
// //   const from = search?.get("from") || "/admin/dashboard";

// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [msg, setMsg] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   async function handleSubmit(e) {
// //     e.preventDefault();
// //     setMsg("");
// //     setLoading(true);

// //     const res = await signIn("credentials", {
// //       redirect: false,
// //       email,
// //       password,
// //       callbackUrl: from,
// //     });

// //     setLoading(false);

// //     if (res?.error) {
// //       setMsg(res.error || "Invalid credentials");
// //       return;
// //     }

// //     // res.url contains callbackUrl when redirect:false
// //     const dest = res?.url || from || "/admin/dashboard";
// //     window.location.href = dest;
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center p-6">
// //       <div className="w-full max-w-md p-6 rounded shadow">
// //         <h2 className="text-xl font-semibold mb-4">Admin Sign In</h2>
// //         <form onSubmit={handleSubmit} className="flex flex-col gap-3">
// //           <input
// //             type="email"
// //             className="p-2 border rounded"
// //             placeholder="admin@example.com"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //           />
// //           <input
// //             type="password"
// //             className="p-2 border rounded"
// //             placeholder="Password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //           <button className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
// //             {loading ? "Signing in..." : "Sign in as Admin"}
// //           </button>
// //           {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }

// // app/admin/signin/page.jsx
// "use client";

// import React, { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function AdminSignInPage() {
//   const search = useSearchParams();
//   const router = useRouter();
//   const from = search?.get("from") ?? "/admin/dashboard";

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setMsg("");
//     setLoading(true);

//     try {
//       const res = await signIn("credentials", {
//         redirect: false,
//         email,
//         password,
//         callbackUrl: from,
//       });

//       setLoading(false);

//       // signIn returns an object when redirect: false
//       // If server returned an error, show it
//       if (res?.error) {
//         setMsg(res.error || "Invalid credentials");
//         return;
//       }

//       // If server provided a URL, navigate there safely using next/router
//       const dest = res?.url ?? from ?? "/admin/dashboard";
//       // prefer router.replace so user can't go "back" to signin
//       router.replace(dest);
//     } catch (err) {
//       console.error("Sign in error:", err);
//       setMsg("Network or server error — try again");
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
//       <div className="w-full max-w-md p-6 rounded shadow bg-white">
//         <h2 className="text-xl font-semibold mb-4">Admin Sign In</h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//           <input
//             type="email"
//             className="p-2 border rounded"
//             placeholder="admin@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             autoComplete="email"
//           />
//           <input
//             type="password"
//             className="p-2 border rounded"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             autoComplete="current-password"
//           />
//           <button
//             type="submit"
//             className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
//             disabled={loading}
//           >
//             {loading ? "Signing in..." : "Sign in as Admin"}
//           </button>

//           {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
//         </form>
//       </div>
//     </div>
//   );
// }

// // app/admin/signin/page.jsx
// "use client";

// import React from "react";
// import ClientSignIn from "./ClientSignIn";

// export default function AdminSignInPage() {
//   return <ClientSignIn />;
// }
// app/admin/signin/page.jsx
"use client";

import React from "react";
import ClientSignIn from "./ClientSignIn";

// Prevent Next from trying to statically prerender this page
export const dynamic = "force-dynamic";

export default function Page() {
  return <ClientSignIn />;
}


