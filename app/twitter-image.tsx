import { createSocialImage, socialImageSize } from "@/lib/social-image";

export const alt = "Marters & Co. — automation implementation partner";
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
