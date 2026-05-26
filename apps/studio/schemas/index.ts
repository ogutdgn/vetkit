// All schema types registered with the Studio. Imported by sanity.config.ts.

import { blogPost } from './documents/blogPost';
import { service } from './documents/service';
import { address } from './objects/address';
import { contactInfo } from './objects/contactInfo';
import { cta } from './objects/cta';
import { emergencyBanner } from './objects/emergencyBanner';
import { localePortableText } from './objects/localePortableText';
import { localeSlug } from './objects/localeSlug';
import { localeString } from './objects/localeString';
import { localeText } from './objects/localeText';
import { openingHours } from './objects/openingHours';
import { seo } from './objects/seo';
import { socialLinks } from './objects/socialLinks';
import { siteSettings } from './singletons/siteSettings';

export const schemaTypes = [
  // Locale primitives.
  localeString,
  localeText,
  localeSlug,
  localePortableText,
  // Reusable objects.
  seo,
  address,
  openingHours,
  socialLinks,
  cta,
  contactInfo,
  emergencyBanner,
  // Singletons.
  siteSettings,
  // Documents.
  service,
  blogPost,
];
