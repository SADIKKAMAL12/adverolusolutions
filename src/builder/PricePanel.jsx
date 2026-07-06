import { useState } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { ShoppingCart, Save, Send, ChevronUp, ChevronDown, Package, Clock } from 'lucide-react'

export default function PricePanel({
  priceBreakdown, onSaveDraft, onSubmit, isSubmitting,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [collapsed, setCollapsed] = useState(false)

  const { items, total, nodeCount, edgeCount } = priceBreakdown

  // Estimated delivery: base 1 day + 0.5 day per 5 nodes
  const deliveryDays = Math.max(1, Math.ceil(1 + nodeCount / 5))

  return (
    <div style={{
      width: collapsed ? 52 : 280,
      minWidth: collapsed ? 52 : 280,
      background: TC.card,
      borderLeft: `1px solid ${TC.g200}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width .2s',
    }}>
      {/* Collapse toggle */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 40, cursor: 'pointer', borderBottom: `1px solid ${TC.g200}`,
        }}
      >
        {collapsed ? <ChevronUp size={16} color={TC.g500} /> : <ChevronDown size={16} color={TC.g500} />}
      </div>

      {!collapsed && (
        <>
          {/* Total */}
          <div style={{ padding: '20px 18px', borderBottom: `1px solid ${TC.g200}` }}>
            <div style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
              Total Estimate
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: TC.primary, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Package size={12} color={TC.g500} />
                <span style={{ fontSize: 11, color: TC.g500 }}>{nodeCount} nodes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={TC.g500} />
                <span style={{ fontSize: 11, color: TC.g500 }}>{deliveryDays} day{deliveryDays > 1 ? 's' : ''} delivery</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: TC.g400, fontSize: 12 }}>
                <ShoppingCart size={28} color={TC.g300} style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                Add assets to see pricing
              </div>
            )}
            {items.map(item => (
              <div key={item.type} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 6,
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
                border: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : TC.g200}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: `${item.subtotal > 0 ? TC.primary : TC.g300}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: item.subtotal > 0 ? TC.primary : TC.g400, fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}>
                  ×{item.count}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TC.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: TC.g500, marginTop: 1 }}>
                    ${item.unitPrice} each
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TC.text, flexShrink: 0 }}>
                  ${item.subtotal}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${TC.g200}` }}>
            <button
              onClick={onSaveDraft}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 0', borderRadius: 10, border: `1px solid ${TC.g300}`,
                background: TC.g100, color: TC.g700,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8,
              }}
            >
              <Save size={14} />
              Save Draft
            </button>
            <button
              onClick={onSubmit}
              disabled={nodeCount === 0 || isSubmitting}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 0', borderRadius: 10, border: 'none',
                background: nodeCount === 0 ? TC.g300 : TC.primary,
                color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: nodeCount === 0 ? 'not-allowed' : 'pointer',
                opacity: nodeCount === 0 ? 0.6 : 1,
                transition: 'opacity .15s',
              }}
            >
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : 'Submit Structure'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
