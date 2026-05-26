import type { StructureBuilder, StructureResolver } from 'sanity/structure';

const SITE_SETTINGS_ID = 'siteSettings';

const siteSettingsItem = (S: StructureBuilder) =>
  S.listItem()
    .title('Klinik Bilgileri')
    .id(SITE_SETTINGS_ID)
    .child(S.editor().id(SITE_SETTINGS_ID).schemaType('siteSettings').documentId(SITE_SETTINGS_ID));

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('İçerik')
    .items([siteSettingsItem(S), S.divider()]);
