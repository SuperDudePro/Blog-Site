import type { ContentBlock } from "../types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return <p key={`${block.text}-${index}`} className="doc-section-text">{block.text}</p>;
        }

        if (block.type === "subheading") {
          const levelClass = block.level && block.level >= 3 ? "doc-subheading doc-subheading-small" : "doc-subheading";
          return <h3 key={`${block.text}-${index}`} className={levelClass}>{block.text}</h3>;
        }

        return (
          <ul key={`list-${index}`} className="doc-list">
            {block.items.map((item) => (
              <li key={item} className="doc-list-item"><span className="doc-list-dot" /><span>{item}</span></li>
            ))}
          </ul>
        );
      })}
    </>
  );
}
