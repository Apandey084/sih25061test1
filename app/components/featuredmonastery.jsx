// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";

// export default function Featuredmonastery() {
//   const [tours, setTours] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);

//   const router = useRouter();

//   useEffect(() => {
//     const fetchTours = async () => {
//       try {
//         const res = await fetch("/api/vr-tours", { cache: "no-store" });
//         const data = await res.json();

//         let parsed = [];

//         // 🔥 Robustly detect return shape:
//         if (Array.isArray(data)) {
//           parsed = data;
//         } else if (Array.isArray(data?.tours)) {
//           parsed = data.tours;
//         } else if (data?.ok && Array.isArray(data?.tours)) {
//           parsed = data.tours;
//         } else {
//           console.warn("Unexpected API format:", data);
//         }

//         setTours(parsed);
//       } catch (e) {
//         console.error("Failed to fetch tours:", e);
//         setErr("Failed to load tours");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTours();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white text-xl">
//         Loading tours…
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
//         {err}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen  text-white p-10">
//       <h1 className="text-4xl font-bold mb-8 text-center">
//         🎧 Featured Monasteries
//       </h1>

//       {tours.length === 0 ? (
//         <div className="text-center text-gray-400">No tours available</div>
//       ) : (
//         <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {tours.map((tour, index) => {
//             const img =
//               tour?.monastery?.image ||
//               tour?.rooms?.[0]?.imageUrl ||
//               "/placeholder.jpg";

//             return (
//               <motion.div
//                 key={tour._id ?? tour.id ?? index}
//                 className="cursor-pointer bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg hover:bg-gray-700 transition"
//                 whileHover={{ scale: 1.05 }}
//                 onClick={() => {
//                   if (!tour?._id) return;
//                   router.push(`/viewer/${tour._id}`);
//                 }}
//               >
//                 <img
//                   src={img}
//                   alt={tour?.title || "Monastery Tour"}
//                   onError={(e) => (e.target.src = "/placeholder.jpg")}
//                   className="rounded-xl w-full h-48 object-cover mb-3"
//                 />

//                 <h2 className="text-xl font-semibold">
//                   {tour?.title || "Untitled Tour"}
//                 </h2>

//                 <p className="text-sm text-gray-400 line-clamp-2">
//                   {tour?.description || "Explore this monastery tour"}
//                 </p>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Featuredmonastery() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("/api/vr-tours", { cache: "no-store" });
        const data = await res.json();

        let parsed = [];

        // 🔥 Robustly detect return shape:
        if (Array.isArray(data)) {
          parsed = data;
        } else if (Array.isArray(data?.tours)) {
          parsed = data.tours;
        } else if (data?.ok && Array.isArray(data?.tours)) {
          parsed = data.tours;
        } else {
          console.warn("Unexpected API format:", data);
        }

        setTours(parsed);
      } catch (e) {
        console.error("Failed to fetch tours:", e);
        setErr("Failed to load tours");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // track images that errored so we can show placeholder via next/image
  const [badImages, setBadImages] = useState({});

  function markBadImage(key) {
    setBadImages((s) => ({ ...s, [key]: true }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading tours…
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
        {err}
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">🎧 Featured Monasteries</h1>

      {tours.length === 0 ? (
        <div className="text-center text-gray-400">No tours available</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tours.map((tour, index) => {
            const img =
              tour?.monastery?.image ||
              tour?.rooms?.[0]?.imageUrl ||
              "/placeholder.jpg";

            const key = tour._id ?? tour.id ?? index;
            const src = badImages[key] ? "/placeholder.jpg" : img;

            return (
              <motion.div
                key={key}
                className="cursor-pointer bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg hover:bg-gray-700 transition"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  if (!tour?._id) return;
                  router.push(`/viewer/${tour._id}`);
                }}
              >
                <div className="relative rounded-xl w-full h-48 mb-3 overflow-hidden bg-gray-700">
                  <Image
                    src={src}
                    alt={tour?.title || "Monastery Tour"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    style={{ objectFit: "cover" }}
                    onError={() => markBadImage(key)}
                  />
                </div>

                <h2 className="text-xl font-semibold">{tour?.title || "Untitled Tour"}</h2>

                <p className="text-sm text-gray-400 line-clamp-2">
                  {tour?.description || "Explore this monastery tour"}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
