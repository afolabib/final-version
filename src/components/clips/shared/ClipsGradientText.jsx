export default function ClipsGradientText({ children, as: Tag = 'span', className = '' }) {
  return (
    <Tag className={`clips-gradient-text ${className}`}>
      {children}
    </Tag>
  );
}
