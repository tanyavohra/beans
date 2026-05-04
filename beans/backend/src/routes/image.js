const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt =
      "Summarize this image in  4 to 5 lines, then give 1 sentence alt-text. Be concise.";

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const text = result.response.text();
    return res.json({ summary: text });
  } catch {
    return res.status(500).json({ error: "Gemini summarize failed" });
  }
});

module.exports = router;
