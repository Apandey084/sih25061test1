

// // app/api/vr-tours/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import mongoose from "mongoose";

// /**
//  * Provide a fallback VRTour model if project doesn't define one at lib/models/VRTour.
//  * Schema:
//  *  - title (required)
//  *  - description
//  *  - monastery (ObjectId -> Monastery)
//  *  - rooms: [{ title, imageUrl, audioUrl, order }]
//  */
// function getVRTourModel() {
//   try {
//     // prefer project's model if present
//     // works with both CJS require or ESM dynamic import (try require first)
//     // (we purposely don't throw if it doesn't exist)
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     const mod = require?.("@/lib/models/VRTour");
//     const m = mod?.default ?? mod;
//     if (m) return m;
//   } catch (e) {
//     // ignore
//   }

//   const RoomSchema = new mongoose.Schema(
//     {
//       title: { type: String, default: "" },
//       imageUrl: { type: String, default: "" },
//       audioUrl: { type: String, default: "" },
//       order: { type: Number, default: 0 },
//     },
//     { _id: false }
//   );

//   const VRTourSchema = new mongoose.Schema(
//     {
//       title: { type: String, required: true },
//       slug: { type: String, index: true },
//       description: { type: String, default: "" },
//       monastery: { type: mongoose.Schema.Types.ObjectId, ref: "Monastery", default: null },
//       rooms: { type: [RoomSchema], default: [] },
//       createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
//       published: { type: Boolean, default: true },
//     },
//     { timestamps: true }
//   );

//   return mongoose.models.VRTour || mongoose.model("VRTour", VRTourSchema);
// }

// const VRTour = getVRTourModel();

// function isValidId(id) {
//   return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
// }

// function normalizeRooms(rooms) {
//   if (!Array.isArray(rooms)) return [];
//   return rooms.map((r, i) => ({
//     title: (r && (r.title || r.name)) ? String(r.title || r.name) : `Room ${i + 1}`,
//     imageUrl: r?.imageUrl || r?.image || "",
//     audioUrl: r?.audioUrl || r?.audio || "",
//     order: typeof r?.order === "number" ? r.order : i,
//   }));
// }

// /* ---------------- GET: list or single ---------------- */
// export async function GET(req) {
//   try {
//     await connectDB();

//     const url = new URL(req.url);
//     const id = url.searchParams.get("id");

//     if (id) {
//       if (!isValidId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
//       const one = await VRTour.findById(id).lean();
//       if (!one) return NextResponse.json({ error: "Not found" }, { status: 404 });
//       return NextResponse.json(one);
//     }

//     // pagination-friendly list
//     const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
//     const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)));
//     const q = (url.searchParams.get("q") || "").trim();

//     const filter = {};
//     if (q) {
//       filter.$or = [
//         { title: { $regex: q, $options: "i" } },
//         { description: { $regex: q, $options: "i" } },
//         { "rooms.title": { $regex: q, $options: "i" } },
//       ];
//     }

//     const total = await VRTour.countDocuments(filter);
//     const items = await VRTour.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     return NextResponse.json({ ok: true, total, page, limit, tours: items });
//   } catch (err) {
//     console.error("GET /api/vr-tours error:", err);
//     return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
//   }
// }

// /* ---------------- POST: create ---------------- */
// /**
//  * Body expected (JSON):
//  * {
//  *   title: "string",               // required
//  *   description?: "string",
//  *   monastery?: "<monasteryId>" or null,
//  *   rooms?: [{ title,imageUrl,audioUrl,order }, ...]
//  * }
//  */
// export async function POST(req) {
//   try {
//     await connectDB();

//     let body;
//     try {
//       body = await req.json();
//     } catch {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }

//     const { title, description = "", monastery = null, rooms = [] } = body || {};

//     if (!title || typeof title !== "string") {
//       return NextResponse.json({ error: "Missing title" }, { status: 400 });
//     }

//     if (monastery && !isValidId(monastery)) {
//       return NextResponse.json({ error: "Invalid monastery id" }, { status: 400 });
//     }

//     const normalizedRooms = normalizeRooms(rooms);

//     const doc = await VRTour.create({
//       title: String(title).trim(),
//       slug: (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
//       description: description || "",
//       monastery: monastery || null,
//       rooms: normalizedRooms,
//       published: true,
//     });

//     return NextResponse.json({ ok: true, tour: doc }, { status: 201 });
//   } catch (err) {
//     console.error("POST /api/vr-tours error:", err);
//     return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
//   }
// }

// /* ---------------- PUT: update ---------------- */
// /**
//  * Accepts:
//  * - query param ?id=...  OR body.id
//  * Body fields allowed: title, description, monastery, rooms, published
//  */
// export async function PUT(req) {
//   try {
//     await connectDB();

//     let body;
//     try {
//       body = await req.json();
//     } catch {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }

//     const url = new URL(req.url);
//     const qid = url.searchParams.get("id");
//     const id = (body && body.id) || qid;
//     if (!id || !isValidId(id)) {
//       return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
//     }

//     const update = {};
//     if (body.title) update.title = String(body.title).trim();
//     if (body.description !== undefined) update.description = String(body.description);
//     if (body.published !== undefined) update.published = !!body.published;
//     if (body.monastery !== undefined) {
//       if (body.monastery && !isValidId(body.monastery)) {
//         return NextResponse.json({ error: "Invalid monastery id" }, { status: 400 });
//       }
//       update.monastery = body.monastery || null;
//     }
//     if (body.rooms) update.rooms = normalizeRooms(body.rooms);

//     update.updatedAt = new Date();

//     const updated = await VRTour.findByIdAndUpdate(id, update, { new: true }).lean();
//     if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

//     return NextResponse.json({ ok: true, tour: updated });
//   } catch (err) {
//     console.error("PUT /api/vr-tours error:", err);
//     return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
//   }
// }

// /* ---------------- DELETE: delete by id ---------------- */
// export async function DELETE(req) {
//   try {
//     await connectDB();

//     const url = new URL(req.url);
//     const qid = url.searchParams.get("id");
//     let body = null;
//     try {
//       body = await req.json();
//     } catch {
//       body = null;
//     }
//     const id = (body && body.id) || qid;
//     if (!id || !isValidId(id)) return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });

//     const deleted = await VRTour.findByIdAndDelete(id);
//     if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

//     return NextResponse.json({ ok: true, deletedId: id });
//   } catch (err) {
//     console.error("DELETE /api/vr-tours error:", err);
//     return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
//   }
// }

// app/api/vr-tours/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * Provide a fallback VRTour model if project doesn't define one at lib/models/VRTour.
 * Schema:
 *  - title (required)
 *  - description
 *  - monastery (ObjectId -> Monastery)
 *  - rooms: [{ title, imageUrl, audioUrl, order }]
 */
async function getVRTourModel() {
  // try dynamic import of project's model (ESM). If it exists, prefer it.
  try {
    // dynamic import won't throw for missing files in some bundlers, so we catch errors.
    const mod = await import("@/lib/models/VRTour").catch(() => null);
    const m = mod?.default ?? mod;
    if (m) return m;
  } catch (e) {
    // ignore — fallback to local schema
  }

  const RoomSchema = new mongoose.Schema(
    {
      title: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
      audioUrl: { type: String, default: "" },
      order: { type: Number, default: 0 },
    },
    { _id: false }
  );

  const VRTourSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, index: true },
      description: { type: String, default: "" },
      monastery: { type: mongoose.Schema.Types.ObjectId, ref: "Monastery", default: null },
      rooms: { type: [RoomSchema], default: [] },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      published: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  return mongoose.models.VRTour || mongoose.model("VRTour", VRTourSchema);
}

function isValidId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

function normalizeRooms(rooms) {
  if (!Array.isArray(rooms)) return [];
  return rooms.map((r, i) => ({
    title: (r && (r.title || r.name)) ? String(r.title || r.name) : `Room ${i + 1}`,
    imageUrl: r?.imageUrl || r?.image || "",
    audioUrl: r?.audioUrl || r?.audio || "",
    order: typeof r?.order === "number" ? r.order : i,
  }));
}

/* ---------------- GET: list or single ---------------- */
export async function GET(req) {
  try {
    await connectDB();
    const VRTour = await getVRTourModel();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      if (!isValidId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      const one = await VRTour.findById(id).lean();
      if (!one) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(one);
    }

    // pagination-friendly list
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)));
    const q = (url.searchParams.get("q") || "").trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "rooms.title": { $regex: q, $options: "i" } },
      ];
    }

    const total = await VRTour.countDocuments(filter);
    const items = await VRTour.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ ok: true, total, page, limit, tours: items });
  } catch (err) {
    console.error("GET /api/vr-tours error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

/* ---------------- POST: create ---------------- */
export async function POST(req) {
  try {
    await connectDB();
    const VRTour = await getVRTourModel();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { title, description = "", monastery = null, rooms = [] } = body || {};

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    if (monastery && !isValidId(monastery)) {
      return NextResponse.json({ error: "Invalid monastery id" }, { status: 400 });
    }

    const normalizedRooms = normalizeRooms(rooms);

    const doc = await VRTour.create({
      title: String(title).trim(),
      slug: (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: description || "",
      monastery: monastery || null,
      rooms: normalizedRooms,
      published: true,
    });

    return NextResponse.json({ ok: true, tour: doc }, { status: 201 });
  } catch (err) {
    console.error("POST /api/vr-tours error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

/* ---------------- PUT: update ---------------- */
export async function PUT(req) {
  try {
    await connectDB();
    const VRTour = await getVRTourModel();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const url = new URL(req.url);
    const qid = url.searchParams.get("id");
    const id = (body && body.id) || qid;
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const update = {};
    if (body.title) update.title = String(body.title).trim();
    if (body.description !== undefined) update.description = String(body.description);
    if (body.published !== undefined) update.published = !!body.published;
    if (body.monastery !== undefined) {
      if (body.monastery && !isValidId(body.monastery)) {
        return NextResponse.json({ error: "Invalid monastery id" }, { status: 400 });
      }
      update.monastery = body.monastery || null;
    }
    if (body.rooms) update.rooms = normalizeRooms(body.rooms);

    update.updatedAt = new Date();

    const updated = await VRTour.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, tour: updated });
  } catch (err) {
    console.error("PUT /api/vr-tours error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

/* ---------------- DELETE: delete by id ---------------- */
export async function DELETE(req) {
  try {
    await connectDB();
    const VRTour = await getVRTourModel();

    const url = new URL(req.url);
    const qid = url.searchParams.get("id");
    let body = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }
    const id = (body && body.id) || qid;
    if (!id || !isValidId(id)) return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });

    const deleted = await VRTour.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /api/vr-tours error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

