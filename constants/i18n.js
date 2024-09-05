import { NativeModules } from 'react-native'
import { I18n } from 'i18n-js';
import { en } from './locales/en';
import { fr_ca } from './locales/fr';

const traductions = {
    "en_US": en,
    "en_CA": en,
    "fr_CA": fr_ca,
    "fr_FR": fr_ca,
};

const i18n = new I18n(traductions);
i18n.locale = NativeModules.I18nManager.localeIdentifier || "en-CA";

console.log(i18n.t("message"));

export default i18n;