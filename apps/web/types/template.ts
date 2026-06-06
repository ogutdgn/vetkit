// The template contract (CLAUDE.md §6). Every template in apps/web/templates/
// must export exactly these component names satisfying `ThemeComponents` —
// a template that renames `Header` or reshapes `HeroProps` is broken by
// definition. Props are typed against the QUERY-RESULT shapes pages actually
// fetch (lib/sanity/queries.ts projections), not raw document types: a card
// never receives a full document. If a template genuinely needs more data,
// extend the projection in queries.ts — never demand a schema change
// (CLAUDE.md §2.4: the schema is the lowest common denominator).

import type { ComponentType } from 'react';

import type {
  SanityImageAssetReference,
  SanityImageCrop,
  SanityImageHotspot,
  BlogPostsListQueryResult,
  ServicesListQueryResult,
  SiteSettingsQueryResult,
  TeamMembersListQueryResult,
} from '@/types/sanity';

/**
 * The shape every image field in the schema shares (asset + hotspot/crop +
 * required alt). Structurally identical to the inline image shapes in the
 * generated query-result types, so any fetched image is assignable to it.
 * Pass to `urlFor` (lib/sanity/image.ts) for rendering.
 */
export interface SanityImageWithAlt {
  _type: 'image';
  asset?: SanityImageAssetReference;
  media?: unknown;
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
  alt: string;
}

/**
 * Pages fetch siteSettings and handle the missing-document case before any
 * template component renders, so the contract takes the non-null shape.
 */
export type SiteSettings = NonNullable<SiteSettingsQueryResult>;

export type ServiceCardData = ServicesListQueryResult[number];
export type BlogCardData = BlogPostsListQueryResult[number];
export type TeamMemberData = TeamMembersListQueryResult[number];

export interface NavItem {
  label: string;
  href: string;
}

export interface HeaderProps {
  settings: SiteSettings;
  navItems: NavItem[];
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  /** The schema has no video type yet, so media is image-only for now. */
  media?: SanityImageWithAlt;
  cta?: { label: string; href: string };
}

export interface ServiceCardProps {
  service: ServiceCardData;
}

export interface BlogCardProps {
  post: BlogCardData;
}

export interface TeamSectionProps {
  members: TeamMemberData[];
}

export interface FooterProps {
  settings: SiteSettings;
  navItems: NavItem[];
}

export interface ThemeComponents {
  Header: ComponentType<HeaderProps>;
  Hero: ComponentType<HeroProps>;
  ServiceCard: ComponentType<ServiceCardProps>;
  BlogCard: ComponentType<BlogCardProps>;
  TeamSection: ComponentType<TeamSectionProps>;
  Footer: ComponentType<FooterProps>;
}
