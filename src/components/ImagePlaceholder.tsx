type Props = {
  label: string;
  detail?: string;
  tall?: boolean;
};

export function ImagePlaceholder({ label, detail, tall = false }: Props) {
  return (
    <div className={`image-placeholder ${tall ? 'image-placeholder--tall' : ''}`}>
      <div className="image-placeholder__frame">
        <span className="image-placeholder__label">{label}</span>
        {detail ? <p className="image-placeholder__detail">{detail}</p> : null}
      </div>
    </div>
  );
}
