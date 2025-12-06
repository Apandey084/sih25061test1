// "use client"

// import { useRouter } from "next/navigation";
// import { useVRTour } from "@/context/VRTourContext";

//   export default function VRTourCard({ tour }) {
//   const router = useRouter();
//   const { setCurrentTour, setRoom } = useVRTour();

//   const handleOpenViewer = () => {
//     setCurrentTour(tour);
//     setRoom(tour.rooms[0]); // Load first room
//     router.push("/viewer");
//   };

//   return (
//     <div
//       onClick={handleOpenViewer}
//       className="bg-gray-800 text-white rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
//     >
//       <h3 className="text-lg font-semibold">{tour.title}</h3>
//       <p className="text-sm text-gray-400">{tour.description}</p>
//     </div>
//   );
// }

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useVRTour } from "@/context/VRTourContext";

export default function VRTourCard({ tour }) {
  const router = useRouter();
  const { setCurrentTour, setRoom } = useVRTour();

  // Defensive: if tour missing, render placeholder and avoid errors
  if (!tour || typeof tour !== "object") {
    return (
      <div className="bg-gray-800 text-white rounded-lg p-4">
        <div className="text-sm text-gray-400">Untitled / missing tour data</div>
      </div>
    );
  }

  const title = tour.title ?? tour.name ?? "Untitled Tour";
  const description = tour.description ?? "";
  const id = tour._id ?? tour.id ?? null;

  const handleOpenViewer = () => {
    try {
      if (typeof setCurrentTour === "function") setCurrentTour(tour);
      if (typeof setRoom === "function") {
        const firstRoom = Array.isArray(tour.rooms) ? tour.rooms[0] ?? null : null;
        setRoom(firstRoom);
      }

      // Prefer stable URL (works on reload). If id present, go to /viewer/{id}
      if (id) {
        router.push(`/viewer/${id}`);
      } else {
        // fallback to context-based viewer if you rely on context only
        router.push("/viewer");
      }
    } catch (err) {
      console.error("Failed to open viewer:", err);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenViewer}
      onKeyDown={(e) => { if (e.key === "Enter") handleOpenViewer(); }}
      className="bg-gray-800 text-white rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
