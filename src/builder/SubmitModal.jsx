import { useState } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { X, CheckCircle, Send, ShieldCheck, Package, Clock, AlertCircle } from 'lucide-react'

export default function SubmitModal({
  isOpen, onClose,
  priceBreakdown, draftName,
  onConfirm, isSubmitting,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { items, total, nodeCount, edgeCount } = priceBreakdown
  const deliveryDays = Math.max(1, Math.ceil(1 + nodeCount / 5))

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setAgreed(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 460, maxWidth: '90vw',
        background: TC.card,
        borderRadius: 16,
        border: `1px solid ${TC.g200}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${TC.g200}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {submitted ? (
              <CheckCircle size={22} color={TC.green} />
            ) : (
              <Send size={20} color={TC.primary} />
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: TC.text, letterSpacing: '-0.01em' }}>
              {submitted ? 'Order Submitted!' : 'Submit Structure'}
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={TC.g500} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: `${TC.green}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={28} color={TC.green} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, marginBottom: 6 }}>
              Your structure has been submitted
            </div>
            <div style={{ fontSize: 13, color: TC.g500, lineHeight: 1.6 }}>
              Our team will review your order and contact you shortly.
            </div>
            <button
              onClick={handleClose}
              style={{
                marginTop: 20, padding: '10px 28px', borderRadius: 10,
                border: 'none', background: TC.primary, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TC.g200}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TC.text, marginBottom: 10 }}>
                {draftName}
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} color={TC.g500} />
                  <span style={{ fontSize: 12, color: TC.g500 }}>{nodeCount} nodes, {edgeCount} connections</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={TC.g500} />
                  <span style={{ fontSize: 12, color: TC.g500 }}>{deliveryDays} day delivery</span>
                </div>
              </div>

              {/* Breakdown mini */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
                borderRadius: 10, padding: '10px 12px',
              }}>
                {items.slice(0, 5).map(item => (
                  <div key={item.type} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, padding: '3px 0',
                  }}>
                    <span style={{ color: TC.g600 }}>{item.count}× {item.label}</span>
                    <span style={{ color: TC.text, fontWeight: 600 }}>${item.subtotal}</span>
                  </div>
                ))}
                {items.length > 5 && (
                  <div style={{ fontSize: 11, color: TC.g400, textAlign: 'center', marginTop: 4 }}>
                    + {items.length - 5} more items
                  </div>
                )}
                <div style={{
                  borderTop: `1px solid ${TC.g200}`, marginTop: 8, paddingTop: 8,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: TC.primary, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div style={{ padding: '14px 20px' }}>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, color: TC.g600, lineHeight: 1.5 }}>
                  I agree to the structure order terms. Pricing is an estimate and may be adjusted based on availability and verification requirements.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: 10,
              padding: '0 20px 18px',
            }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  border: `1px solid ${TC.g300}`, background: TC.g100,
                  color: TC.g700, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!agreed || isSubmitting}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  border: 'none', background: agreed ? TC.primary : TC.g300,
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: agreed ? 'pointer' : 'not-allowed',
                  opacity: agreed ? 1 : 0.6,
                  transition: 'all .15s',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
