

// // app/admin/monasteries/[id]/page.jsx
// import connectDB from "@/lib/mongodb";
// import Monastery from "@/lib/models/Monastery";
// import MonasteryForm from "@/app/components/MonasteryForm";

// export default async function EditMonasteryPage(props) {
//   const params = await (props?.params ?? props?.route?.params ?? null);
//   const id = params?.id ?? null;

//   if (!id) {
//     return (
//       <div className="p-6">
//         <h2 className="text-xl font-semibold">Edit Monastery</h2>
//         <p className="mt-2 text-gray-600">Missing id in URL.</p>
//       </div>
//     );
//   }

//   let doc = null;
//   let fetchError = null;

//   try {
//     await connectDB();
//     const found = await Monastery.findById(id).lean();
//     if (found) {
//       doc = JSON.parse(JSON.stringify(found));
//     }
//   } catch (err) {
//     console.error("Error loading monastery:", err);
//     fetchError = err;
//   }

//   // All JSX returns happen *after* the try/catch to satisfy the lint rule
//   if (fetchError) {
//     return (
//       <div className="p-6">
//         <h2 className="text-xl font-semibold">Edit Monastery</h2>
//         <p className="mt-2 text-red-600">Failed to load monastery.</p>
//       </div>
//     );
//   }

//   if (!doc) {
//     return (
//       <div className="p-6">
//         <h2 className="text-xl font-semibold">Edit Monastery</h2>
//         <p className="mt-2 text-gray-600">Monastery not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Edit Monastery</h2>
//       <MonasteryForm existing={doc} />
//     </div>
//   );
// }

// app/admin/monasteries/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminMonasteriesPage() {
  const router = useRouter();
  const [monasteries, setMonasteries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch monasteries from API
  async function fetchMonasteries() {
    try {
      const res = await fetch("/api/monasteries", { cache: "no-store" });
      const data = await res.json();
      setMonasteries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch monasteries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonasteries();
  }, []);

  // ✅ Delete monastery
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this monastery?")) return;
    try {
      const res = await fetch("/api/monasteries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Monastery deleted successfully");
      fetchMonasteries(); // refresh list
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + err.message);
    }
  }

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading monasteries...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Monasteries Management</h1>
        <button
          onClick={() => router.push("/admin/monasteries/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New
        </button>
      </div>

      {monasteries.length === 0 ? (
        <p className="text-gray-500">No monasteries found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {monasteries.map((m) => (
            <div
              key={m._id}
              className="border rounded-lg p-4 bg-white shadow-sm flex flex-col"
            >
              {/* ✅ Image Preview (Next.js Image) */}
              {m.image ? (
                <div className="relative w-full h-40 rounded-md mb-3 overflow-hidden bg-gray-50">
                  <Image
                    src={m.image}
                    alt={m.name || "Monastery image"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded mb-3">
                  No Image
                </div>
              )}

              {/* ✅ Content */}
              <h2 className="text-lg font-semibold">{m.name}</h2>
              <p className="text-gray-500 text-sm mb-1">{m.location}</p>
              <p className="text-gray-600 text-sm line-clamp-2">
                {m.description || "No description"}
              </p>

              {/* ✅ Actions */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => router.push(`/admin/monasteries/${m._id}`)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
