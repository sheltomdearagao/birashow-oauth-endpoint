module.exports = (req, res) => {
  console.log("Function called", req.query);
  res.status(200).json({ message: "ok", query: req.query });
}; 