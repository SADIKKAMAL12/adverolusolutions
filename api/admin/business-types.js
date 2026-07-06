// Mock business types admin endpoint
let types = [
  { id: 1, name: 'Marketing Agency' },
  { id: 2, name: 'E-Commerce Brand' },
  { id: 3, name: 'Freelancer' },
  { id: 4, name: 'Startup' },
  { id: 5, name: 'Enterprise' },
  { id: 6, name: 'Other' },
]

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(types.map(t => t.name))
    return
  }
  if (req.method === 'POST') {
    const name = req.body.name || req.body
    if (!types.find(t => t.name === name)) {
      types.push({ id: types.length + 1, name })
    }
    res.status(201).json({ success: true })
    return
  }
  if (req.method === 'DELETE') {
    types = types.filter(t => t.id != req.query.id)
    res.status(200).json({ success: true })
    return
  }
  res.status(405).json({ error: 'Method not allowed' })
}
