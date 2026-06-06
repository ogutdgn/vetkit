import type { ThemeComponents } from '@/types/template';

import { BlogCard } from './BlogCard';
import { Footer } from './Footer';
import { Header } from './Header';
import { Hero } from './Hero';
import { ServiceCard } from './ServiceCard';
import { TeamSection } from './TeamSection';

// Satisfying ThemeComponents is the contract (CLAUDE.md §6) — a rename or a
// prop mismatch in any component above is a compile error here.
const modern: ThemeComponents = {
  Header,
  Hero,
  ServiceCard,
  BlogCard,
  TeamSection,
  Footer,
};

export default modern;
