const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB || 5)) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PNG/JPEG/WebP allowed"), ok);
  },
});

// POST /image/summarize (protected)
router.post("/summarize", auth, upload.single("image"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    if (!req.file) return res.status(400).json({ error: "Missing image file (field name: image)" });

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const prompt =
      "Summarize this image in 4 to 5 lines, then give 1 sentence alt-text. Be concise.";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json().catch(() => null);
    if (!geminiRes.ok) {
      const message = data?.error?.message || "Gemini request failed";
      return res.status(geminiRes.status).json({ error: message });
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) return res.status(502).json({ error: "Gemini returned no summary text" });
    return res.json({ summary: text });
  } catch {
    return res.status(500).json({ error: "Gemini summarize failed" });
  }
});

module.exports = router;
