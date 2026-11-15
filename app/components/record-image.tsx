import Image from "next/image";
import type { ShareImage } from "../share-images";

export function RecordImage({ image, className, priority = false, sizes = "(max-width: 1024px) 100vw, 480px" }: { image: ShareImage; className?: string; priority?: boolean; sizes?: string }) {
  return <Image src={image.url} alt={image.alt} width={image.width} height={image.height} sizes={sizes} className={className} priority={priority} />;
}
