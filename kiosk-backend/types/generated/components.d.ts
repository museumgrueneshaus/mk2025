import type { Schema, Struct } from '@strapi/strapi';

export interface KioskBuchKonfiguration extends Struct.ComponentSchema {
  collectionName: 'components_kiosk_buch_konfigurationen';
  info: {
    displayName: 'Buch-Konfiguration';
    icon: 'book';
  };
  attributes: {
    blaettereffekt: Schema.Attribute.Boolean;
    seiten: Schema.Attribute.Media<'images' | 'files', true>;
    startseite: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
  };
}

export interface KioskExplorerKonfiguration extends Struct.ComponentSchema {
  collectionName: 'components_kiosk_explorer_konfigurationen';
  info: {
    displayName: 'Explorer-Konfiguration';
    icon: 'layer';
  };
  attributes: {
    darstellungsmodus: Schema.Attribute.Enumeration<['grid', 'liste']>;
    exponate: Schema.Attribute.Relation<'oneToMany', 'api::exponat.exponat'>;
  };
}

export interface KioskSlideshowKonfiguration extends Struct.ComponentSchema {
  collectionName: 'components_kiosk_slideshow_konfigurationen';
  info: {
    displayName: 'Slideshow-Konfiguration';
    icon: 'picture';
  };
  attributes: {
    exponate: Schema.Attribute.Relation<'oneToMany', 'api::exponat.exponat'>;
    intervall: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5000>;
    uebergangseffekt: Schema.Attribute.Enumeration<['fade', 'slide', 'zoom']>;
  };
}

export interface KioskVideoplayerKonfiguration extends Struct.ComponentSchema {
  collectionName: 'components_kiosk_videoplayer_konfigurationen';
  info: {
    displayName: 'VideoPlayer-Konfiguration';
    icon: 'play';
  };
  attributes: {
    autoplay: Schema.Attribute.Boolean;
    lautstaerke: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    schleife: Schema.Attribute.Boolean;
    videos: Schema.Attribute.Media<'videos', true>;
  };
}

export interface KioskWebsiteKonfiguration extends Struct.ComponentSchema {
  collectionName: 'components_kiosk_website_konfigurationen';
  info: {
    displayName: 'Website-Konfiguration';
    icon: 'link';
  };
  attributes: {
    url: Schema.Attribute.String & Schema.Attribute.Required;
    vollbild: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'kiosk.buch-konfiguration': KioskBuchKonfiguration;
      'kiosk.explorer-konfiguration': KioskExplorerKonfiguration;
      'kiosk.slideshow-konfiguration': KioskSlideshowKonfiguration;
      'kiosk.videoplayer-konfiguration': KioskVideoplayerKonfiguration;
      'kiosk.website-konfiguration': KioskWebsiteKonfiguration;
    }
  }
}
