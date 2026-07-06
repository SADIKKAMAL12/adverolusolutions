import { getConnectionMeta } from '../nodes/nodeRegistry.js'

export const edgeTypeRegistry = {
  custom: {
    label: 'Custom',
    strokeDasharray: undefined,
    animated: false,
  },
}

export function getEdgeStyle(connectionType) {
  const meta = getConnectionMeta(connectionType)
  const styles = {
    admin:             { strokeDasharray: undefined, animated: false },
    partner:           { strokeDasharray: undefined, animated: false },
    advertiser_access: { strokeDasharray: '5,5',     animated: true },
    employee:          { strokeDasharray: '2,4',     animated: false },
    pixel_sharing:     { strokeDasharray: '8,4,2,4', animated: true },
    domain_sharing:    { strokeDasharray: '4,4',     animated: false },
  }
  return {
    color: meta.color,
    ...styles[connectionType],
  }
}
