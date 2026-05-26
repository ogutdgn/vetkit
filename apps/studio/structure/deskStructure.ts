import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureBuilder, StructureResolver } from 'sanity/structure';

const SITE_SETTINGS_ID = 'siteSettings';

const siteSettingsItem = (S: StructureBuilder) =>
  S.listItem()
    .title('Klinik Bilgileri')
    .id(SITE_SETTINGS_ID)
    .child(S.editor().id(SITE_SETTINGS_ID).schemaType('siteSettings').documentId(SITE_SETTINGS_ID));

export const deskStructure: StructureResolver = (S, context) =>
  S.list()
    .title('İçerik')
    .items([
      siteSettingsItem(S),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'service',
        title: 'Hizmetler',
        S,
        context,
      }),
      S.documentTypeListItem('blogPost').title('Blog Yazıları'),
      orderableDocumentListDeskItem({
        type: 'teamMember',
        title: 'Ekip',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'faq',
        title: 'Sıkça Sorulan Sorular',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'galleryImage',
        title: 'Galeri',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'testimonial',
        title: 'Görüşler',
        S,
        context,
      }),
      S.documentTypeListItem('page').title('Sayfalar'),
    ]);
