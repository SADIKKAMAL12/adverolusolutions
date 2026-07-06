import BaseNode from './BaseNode.jsx'
import { NODE_REGISTRY } from './nodeRegistry.js'

// Generate a nodeTypes map for React Flow: { [key]: Component }
export const nodeTypes = Object.fromEntries(
  Object.keys(NODE_REGISTRY).map(key => [
    key,
    (props) => <BaseNode {...props} />
  ])
)
