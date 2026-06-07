// All schema types registered with the Studio. Imported by sanity.config.ts.

import { blogPost } from './documents/blogPost';
import { faq } from './documents/faq';
import { galleryImage } from './documents/galleryImage';
import { page } from './documents/page';
import { service } from './documents/service';
import { teamMember } from './documents/teamMember';
import { testimonial } from './documents/testimonial';
import { address } from './objects/address';
import { blockContent } from './objects/blockContent';
import { contactInfo } from './objects/contactInfo';
import { cta } from './objects/cta';
import { emergencyBanner } from './objects/emergencyBanner';
import { heroSlide } from './objects/heroSlide';
import { openingHours } from './objects/openingHours';
import { seo } from './objects/seo';
import { socialLinks } from './objects/socialLinks';
import { siteSettings } from './singletons/siteSettings';

export const schemaTypes = [
  // Reusable objects.
  blockContent,
  seo,
  address,
  openingHours,
  socialLinks,
  cta,
  heroSlide,
  contactInfo,
  emergencyBanner,
  // Singletons.
  siteSettings,
  // Documents.
  service,
  blogPost,
  teamMember,
  faq,
  galleryImage,
  page,
  testimonial,
];
