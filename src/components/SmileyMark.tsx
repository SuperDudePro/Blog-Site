type Props = {
  size?: number;
};

export function SmileyMark({ size = 32 }: Props) {
  return (
    <span
      className="smiley-mark"
      aria-hidden="true"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="smiley-mark__eye smiley-mark__eye--left" />
      <span className="smiley-mark__eye smiley-mark__eye--right" />
      <span className="smiley-mark__smile" />
    </span>
  );
}
