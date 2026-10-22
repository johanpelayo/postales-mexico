import { Link } from "react-router-dom";
import type { ElectoralDataset, PostcardContent } from "../data/types";
import { assetUrl } from "../utils/format";

export function PostcardFront({
  card,
  dataset,
  to,
  compact = false,
  className = "",
}: {
  card: PostcardContent;
  dataset: ElectoralDataset;
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <div className="postcard__correspondence">
        <span className="meta">{card.code} / MÉXICO</span>
        <span className="postcard__stamp meta">{dataset.year}</span>
      </div>
      <img
        className="postcard__art"
        src={assetUrl(card.artwork)}
        alt={card.artworkDescription}
        width="600"
        height="400"
        fetchPriority={compact ? "auto" : "high"}
      />
      <div className="postcard__name">
        <h2>{card.entityName}</h2>
        {to && <span aria-hidden="true">↗</span>}
      </div>
      <p className="postcard__caption">{card.title}</p>
      <div className="postcard__rule" />
      <p className="meta postcard__number">
        POSTAL {card.number} / 32 <span aria-hidden="true"> · </span>
        {to ? "ABRIR Y DESCUBRIR" : "ANVERSO"}
      </p>
    </>
  );
  const classes = `postcard ${compact ? "postcard--compact" : ""} ${className}`;
  return to ? (
    <Link
      to={to}
      className={`${classes} postcard--link`}
      aria-label={`Abrir la postal de ${card.entityName}`}
    >
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
