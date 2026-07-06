// Mock media buyers admin endpoint
let mockBuyers = [
  { id: 1, name: 'Alex Morgan', email: 'alex@mediapro.com', avatar: 'AM', speciality: 'Meta Ads Expert', platforms: '["Meta","Google"]', experience: '5 years', spent: '$2.4M+', rate: 350, rating: 4.9, reviews: 128, orders: 156, status: 'approved', joined: 'May 1, 2024', portfolio: 'https://alexmorgan.media' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@adspro.com', avatar: 'SJ', speciality: 'Google Ads Specialist', platforms: '["Google"]', experience: '4 years', spent: '$1.8M+', rate: 320, rating: 4.8, reviews: 96, orders: 112, status: 'approved', joined: 'Apr 15, 2024', portfolio: 'https://sarahjohnson.ads' },
  { id: 3, name: 'David Lee', email: 'david@tiktokads.io', avatar: 'DL', speciality: 'TikTok Ads Expert', platforms: '["TikTok"]', experience: '3 years', spent: '$1.2M+', rate: 300, rating: 4.7, reviews: 0, orders: 0, status: 'pending', joined: 'May 20, 2024', portfolio: 'https://davidlee.io' },
]

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(mockBuyers)
    return
  }
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = req.body || {}
    const buyer = mockBuyers.find(b => b.id == (body.id || req.query.id))
    if (buyer) {
      Object.assign(buyer, body)
    }
    res.status(200).json({ success: true })
    return
  }
  res.status(405).json({ error: 'Method not allowed' })
}
