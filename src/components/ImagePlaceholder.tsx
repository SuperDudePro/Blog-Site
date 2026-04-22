type Props = {
  label: string;
  detail?: string;
  tall?: boolean;
  compact?: boolean;
};

export function ImagePlaceholder({ label, detail, tall = false, compact = false }: Props) {
  const classes = [
    'image-placeholder',
    tall ? 'image-placeholder--tall' : '',
    compact ? 'image-placeholder--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="image-placeholder__frame">
        <span className="image-placeholder__label">{label}</span>
        {detail ? <p className="image-placeholder__detail">{detail}</p> : null}
      </div>
    </div>
  );
}
