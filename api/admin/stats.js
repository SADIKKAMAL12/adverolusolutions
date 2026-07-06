// Mock admin stats endpoint
export default async function handler(req, res) {
  res.status(200).json({
    users: 8,
    orders: 5,
    deposits: 5,
    tickets: 0,
    totalBalance: 6840,
    structureOrders: 3,
  })
}
