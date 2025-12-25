import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'آواتار',
    'chat.placeholder': '...',
    'tokenTag.overload': 'بیش‌ازحد',
    'tokenTag.remained': 'باقی‌مانده',
    'tokenTag.used': 'استفاده‌شده',
  },
  common: {
    'common.cancel': 'لغو',
    'common.confirm': 'تأیید',
    'common.delete': 'حذف',
    'common.edit': 'ویرایش',
  },
  editableMessage: {
    'editableMessage.addProps': 'افزودن ویژگی‌ها',
    'editableMessage.delete': 'حذف',
    'editableMessage.input': 'ورودی',
    'editableMessage.inputPlaceholder': 'لطفاً محتوای ورودی نمونه را وارد کنید',
    'editableMessage.output': 'خروجی',
    'editableMessage.outputPlaceholder': 'لطفاً محتوای خروجی نمونه را وارد کنید',
    'editableMessage.system': 'سیستم',
  },
  emojiPicker: {
    'emojiPicker.delete': 'حذف',
    'emojiPicker.draggerDesc': 'برای بارگذاری کلیک کنید یا تصویر را به اینجا بکشید',
    'emojiPicker.emoji': 'ایموجی',
    'emojiPicker.fileTypeError': 'فقط می‌توانید فایل تصویر بارگذاری کنید!',
    'emojiPicker.upload': 'بارگذاری',
    'emojiPicker.uploadBtn': 'برش و بارگذاری',
  },
  form: {
    'form.reset': 'بازنشانی',
    'form.submit': 'ارسال',
    'form.unsavedChanges': 'تغییرات ذخیره‌نشده',
    'form.unsavedWarning': 'شما تغییرات ذخیره‌نشده دارید. آیا مطمئنید می‌خواهید خارج شوید؟',
  },
  hotkey: {
    'hotkey.conflict': 'این میانبر با یک میانبر موجود تداخل دارد.',
    'hotkey.invalidCombination':
      'میانبر باید شامل یک کلید اصلاح‌کننده (Ctrl، Alt، Shift) و فقط یک کلید معمولی باشد.',
    'hotkey.placeholder': 'برای ثبت میانبر کلیدها را فشار دهید',
    'hotkey.reset': 'بازنشانی به پیش‌فرض',
  },
  messageModal: {
    'messageModal.cancel': 'لغو',
    'messageModal.confirm': 'تأیید',
    'messageModal.edit': 'ویرایش',
  },
  sideNav: {
    'sideNav.collapse': 'جمع کردن نوار کناری',
    'sideNav.demoActiveLabel': 'فعال',
    'sideNav.demoFeatureAutoCollapseDesc': 'برای جمع شدن هوشمند، به زیر آستانه بکشید',
    'sideNav.demoFeatureAutoCollapseTitle': 'جمع‌شدن خودکار',
    'sideNav.demoFeaturePerformanceDesc': 'بدون سربار انیمیشن برای عملکرد بهتر',
    'sideNav.demoFeaturePerformanceTitle': 'عملکرد',
    'sideNav.demoFeatureResizeDesc': 'برای تنظیم عرض پنل بکشید',
    'sideNav.demoFeatureResizeTitle': 'تغییر اندازه انعطاف‌پذیر',
    'sideNav.demoFeatureSmartHandleDesc': 'برای نمایش دکمه، نشانگر را نگه دارید',
    'sideNav.demoFeatureSmartHandleTitle': 'دستگیره هوشمند',
    'sideNav.demoFeaturesTitle': 'ویژگی‌ها',
    'sideNav.demoHint': 'لبه پنل را بکشید و از دکمه تغییر وضعیت استفاده کنید ->',
    'sideNav.demoSubtitle': 'پنل کناری سبک workspace با تغییر اندازه کشیدنی',
    'sideNav.demoTitle': 'دموی DraggableSideNav',
    'sideNav.expand': 'باز کردن نوار کناری',
  },
} satisfies TranslationResourcesMap;

export default resources;
