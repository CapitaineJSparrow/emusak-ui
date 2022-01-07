import trad from "./en.json";
import { i18n } from '../app';

export type I18nKeys = keyof typeof trad;

const useTranslation = () => ({
    t: (t: I18nKeys): string => i18n.t(t)
});

export default useTranslation;
