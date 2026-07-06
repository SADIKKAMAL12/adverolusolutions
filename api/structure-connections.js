export default async function handler(req, res) {
  const connections = [
    { key: 'admin', label: 'Admin', edge_color: '#ef4444', dash_array: null, animated: 0, description: 'Full administrative control over the connected asset.', sort_order: 1 },
    { key: 'partner', label: 'Partner', edge_color: '#3b82f6', dash_array: null, animated: 0, description: 'Partner access with shared asset management.', sort_order: 2 },
    { key: 'advertiser_access', label: 'Advertiser Access', edge_color: '#f59e0b', dash_array: '5,5', animated: 1, description: 'Limited advertiser access for campaign management.', sort_order: 3 },
    { key: 'employee', label: 'Employee', edge_color: '#10b981', dash_array: '2,4', animated: 0, description: 'Employee-level access within the organization.', sort_order: 4 },
    { key: 'pixel_sharing', label: 'Pixel Sharing', edge_color: '#8b5cf6', dash_array: '8,4,2,4', animated: 1, description: 'Shared pixel data between connected assets.', sort_order: 5 },
    { key: 'domain_sharing', label: 'Domain Sharing', edge_color: '#06b6d4', dash_array: '4,4', animated: 0, description: 'Shared verified domain across accounts.', sort_order: 6 },
  ]
  res.status(200).json({ connections })
}
