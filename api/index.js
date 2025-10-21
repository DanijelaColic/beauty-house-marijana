// Simple Vercel serverless function
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Beauty House Marijana API is running!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
