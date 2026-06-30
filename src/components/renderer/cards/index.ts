// Barrel for the public render cards. Each card lives in its own file so
// it can be ported to the NextJS app one-by-one (just copy the .tsx — the
// only external dep is `getSectionColor` for the dynamic section accent).
export { default as NotaPrincipal } from "./NotaPrincipal";
export { default as MainLeftArticle } from "./MainLeftArticle";
export { default as MainRightArticle } from "./MainRightArticle";
export { default as SecondaryPhotoArticle } from "./SecondaryPhotoArticle";
export { default as SecondarySmallArticle } from "./SecondarySmallArticle";
export { default as SecondaryTextArticle } from "./SecondaryTextArticle";
export { default as NotaEDM } from "./NotaEDM";
export { default as NotaEDMVertical } from "./NotaEDMVertical";
export { default as BannerCard } from "./BannerCard";
