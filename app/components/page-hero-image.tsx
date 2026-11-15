import type { ShareImage } from "../share-images";
import { RecordImage } from "./record-image";

export function PageHeroImage({ image }: { image: ShareImage }) {
  return (
    <figure className="mt-8 max-w-3xl">
      <RecordImage image={image} sizes="(max-width: 768px) 100vw, 640px" className="aspect-[16/9] h-auto w-full border border-ink/15 object-cover" />
    </figure>
  );
}
