module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    console.log("Multi-step form submission:", JSON.stringify(body));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to log submission", err);
    return res.status(500).json({ error: "Failed to save submission" });
  }
};

