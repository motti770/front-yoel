import './SkeletonLoader.css';

/**
 * SkeletonLoader - A reusable skeleton loading placeholder component
 * Supports various types: text, card, table, avatar
 * Includes shimmer animation effect
 *
 * @param {Object} props
 * @param {'text' | 'card' | 'table' | 'avatar'} [props.type='text'] - Type of skeleton
 * @param {number} [props.count=1] - Number of skeleton items to render
 * @param {number | string} [props.width] - Custom width (number for pixels, string for any CSS unit)
 * @param {number | string} [props.height] - Custom height (number for pixels, string for any CSS unit)
 * @param {string} [props.className=''] - Additional CSS class
 */
function SkeletonLoader({
  type = 'text',
  count = 1,
  width,
  height,
  className = ''
}) {
  const renderSkeleton = (index) => {
    const baseClass = `skeleton skeleton--${type} ${className}`.trim();
    const style = {};

    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    switch (type) {
      case 'text':
        return (
          <div
            key={index}
            className={baseClass}
            style={style}
            aria-hidden="true"
          />
        );

      case 'avatar':
        return (
          <div
            key={index}
            className={baseClass}
            style={style}
            aria-hidden="true"
          />
        );

      case 'card':
        return (
          <div key={index} className={baseClass} style={style} aria-hidden="true">
            <div className="skeleton__card-header">
              <div className="skeleton skeleton--avatar skeleton--sm" />
              <div className="skeleton__card-header-text">
                <div className="skeleton skeleton--text" style={{ width: '60%' }} />
                <div className="skeleton skeleton--text skeleton--text-sm" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="skeleton__card-body">
              <div className="skeleton skeleton--text" />
              <div className="skeleton skeleton--text" style={{ width: '90%' }} />
              <div className="skeleton skeleton--text" style={{ width: '75%' }} />
            </div>
          </div>
        );

      case 'table':
        return (
          <div key={index} className={baseClass} style={style} aria-hidden="true">
            <div className="skeleton__table-row skeleton__table-header">
              {[1, 2, 3, 4].map((col) => (
                <div key={col} className="skeleton skeleton--text" style={{ width: '80%' }} />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="skeleton__table-row">
                {[1, 2, 3, 4].map((col) => (
                  <div
                    key={col}
                    className="skeleton skeleton--text"
                    style={{ width: `${Math.random() * 40 + 50}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div
            key={index}
            className={baseClass}
            style={style}
            aria-hidden="true"
          />
        );
    }
  };

  const items = Array.from({ length: count }, (_, i) => renderSkeleton(i));

  return (
    <div
      className="skeleton-wrapper"
      role="status"
      aria-label="Loading..."
      aria-busy="true"
    >
      <span className="sr-only">Loading...</span>
      {items}
    </div>
  );
}

export default SkeletonLoader;
