export default async function handler(req, res) {
  try {
    return res.status(200).json({ message: "Server working ✅" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
