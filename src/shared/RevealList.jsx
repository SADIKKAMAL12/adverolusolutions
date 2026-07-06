import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

/**
 * Wraps a flat list of elements and applies a staggered revealUp animation.
 * Usage:
 *   <RevealList stagger={55} watch={someList}>
 *     {items.map(i => <Row key={i.id} ... />)}
 *   </RevealList>
 *
 * - stagger: delay between items in ms (default 55)
 * - watch:   any value — when it changes, animation re-plays
 * - as:      wrapper element tag (default 'div', use 'tbody' for tables)
 * - className / style: forwarded to the wrapper
 */
export default function RevealList({ children, stagger = 55, watch, as: Tag = 'div', className, style }) {
  const [key, setKey] = useState(0);
  const prev = useRef(watch);

  useEffect(() => {
    if (prev.current !== watch) {
      prev.current = watch;
      setKey(k => k + 1);
    }
  }, [watch]);

  return (
    <Tag className={className} style={style}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return cloneElement(child, {
          key: child.key ?? i,
          className: [child.props.className, 'reveal-item'].filter(Boolean).join(' '),
          style: {
            ...child.props.style,
            animationDelay: `${i * stagger}ms`,
          },
        });
      })}
    </Tag>
  );
}
