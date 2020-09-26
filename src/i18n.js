import { register, init, getLocaleFromNavigator, locale as $locale } from 'svelte-i18n';
import { setCookie, getCookie } from './modules/cookie';

const INIT_OPTIONS = {
  fallbackLocale: 'en',
  initialLocale: null,
  loadingDelay: 200,
  formats: {},
  warnOnMissingMessages: true,
};

let currentLocale = null;

register('en', () => import('../translations/en.json'));
register('fr', () => import('../translations/fr.json'));

$locale.subscribe((value) => {
  if (value == null) return;

  currentLocale = value;

  // if running in the client, save the language preference in a cookie
  if (typeof window !== 'undefined') {
    setCookie('locale', value);
  }
});

// initialize the i18n library in client
export function startClient() {
  init({
    ...INIT_OPTIONS,
    initialLocale: getCookie('locale') || getLocaleFromNavigator(),
  });
}

const DOCUMENT_REGEX = /^([^.?#@]+)?([?#](.+)?)?$/;

export function i18nMiddleware() {
  init(INIT_OPTIONS);

  return (req, res, next) => {
    const isDocument = DOCUMENT_REGEX.test(req.originalUrl);
    if (!isDocument) {
      next();
      return;
    }

    let locale = getCookie('locale', req.headers.cookie);

    if (locale == null) {
      if (req.headers['accept-language']) {
        const headerLang = req.headers['accept-language'].split(',')[0].trim();
        if (headerLang.length > 1) {
          locale = headerLang;
        }
      } else {
        locale = INIT_OPTIONS.initialLocale || INIT_OPTIONS.fallbackLocale;
      }
    }

    if (locale != null && locale !== currentLocale) {
      $locale.set(locale);
    }

    next();
  };
}