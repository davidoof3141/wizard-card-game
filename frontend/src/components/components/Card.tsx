interface CardProps {
  card: string;
  xclass?: string;
  onClick?: (card: string) => void;
  custom_style?: React.CSSProperties;
}

function Card({ card, xclass = "", onClick, custom_style = {} }: CardProps) {
  return (
    <>
      <div
        className={`card-${card} ${xclass}`}
        onDoubleClick={() => onClick?.(card)}
        style={custom_style}
      ></div>
    </>
  );
}

export default Card;
