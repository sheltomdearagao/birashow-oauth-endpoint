import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  console.log("Function called", req.query);
  return res.status(200).json({ message: "ok", query: req.query });
} 