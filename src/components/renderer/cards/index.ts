// Barrel for the public render cards. Each card lives in its own file so
// it can be ported to the NextJS app one-by-one (just copy the .tsx — the
// only external dep is `getSectionColor` for the dynamic section accent and
// the `articleHref` helper, which the NextJS app should replace with its
// own router-based URL builder).
<<<<<<< HEAD
export { default as NotaPrincipal } from "./NotaPrincipal";
=======
export { default as HeroArticle } from "./HeroArticle";
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
export { default as MainLeftArticle } from "./MainLeftArticle";
export { default as MainRightArticle } from "./MainRightArticle";
export { default as SecondaryPhotoArticle } from "./SecondaryPhotoArticle";
export { default as SecondarySmallArticle } from "./SecondarySmallArticle";
export { default as SecondaryTextArticle } from "./SecondaryTextArticle";
export { default as BannerCard } from "./BannerCard";
