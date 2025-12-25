import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'الصورة الرمزية',
    'chat.placeholder': '...',
    'tokenTag.overload': 'تجاوز',
    'tokenTag.remained': 'المتبقي',
    'tokenTag.used': 'المستخدم',
  },
  common: {
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
  },
  editableMessage: {
    'editableMessage.addProps': 'إضافة خصائص',
    'editableMessage.delete': 'حذف',
    'editableMessage.input': 'إدخال',
    'editableMessage.inputPlaceholder': 'يرجى إدخال محتوى إدخال نموذجي',
    'editableMessage.output': 'إخراج',
    'editableMessage.outputPlaceholder': 'يرجى إدخال محتوى إخراج نموذجي',
    'editableMessage.system': 'النظام',
  },
  emojiPicker: {
    'emojiPicker.delete': 'حذف',
    'emojiPicker.draggerDesc': 'انقر أو اسحب الصورة إلى هذه المنطقة للرفع',
    'emojiPicker.emoji': 'رمز تعبيري',
    'emojiPicker.fileTypeError': 'يمكنك رفع ملفات الصور فقط!',
    'emojiPicker.upload': 'رفع',
    'emojiPicker.uploadBtn': 'اقتصاص ورفع',
  },
  form: {
    'form.reset': 'إعادة ضبط',
    'form.submit': 'إرسال',
    'form.unsavedChanges': 'تغييرات غير محفوظة',
    'form.unsavedWarning': 'لديك تغييرات غير محفوظة. هل أنت متأكد أنك تريد المغادرة؟',
  },
  hotkey: {
    'hotkey.conflict': 'هذا الاختصار يتعارض مع اختصار موجود.',
    'hotkey.invalidCombination':
      'يجب أن يتضمن الاختصار مفتاح تعديل (Ctrl أو Alt أو Shift) ومفتاحًا عاديًا واحدًا فقط.',
    'hotkey.placeholder': 'اضغط الأزرار لتسجيل الاختصار',
    'hotkey.reset': 'إعادة التعيين إلى الافتراضي',
  },
  messageModal: {
    'messageModal.cancel': 'إلغاء',
    'messageModal.confirm': 'تأكيد',
    'messageModal.edit': 'تحرير',
  },
  sideNav: {
    'sideNav.collapse': 'طي الشريط الجانبي',
    'sideNav.demoActiveLabel': 'نشط',
    'sideNav.demoFeatureAutoCollapseDesc': 'اسحب أسفل الحد للطي الذكي',
    'sideNav.demoFeatureAutoCollapseTitle': 'طي تلقائي',
    'sideNav.demoFeaturePerformanceDesc': 'بدون تكلفة رسوم متحركة لأداء أفضل',
    'sideNav.demoFeaturePerformanceTitle': 'الأداء',
    'sideNav.demoFeatureResizeDesc': 'اسحب لضبط عرض اللوحة',
    'sideNav.demoFeatureResizeTitle': 'تغيير الحجم بمرونة',
    'sideNav.demoFeatureSmartHandleDesc': 'مرر لإظهار زر التبديل',
    'sideNav.demoFeatureSmartHandleTitle': 'مقبض ذكي',
    'sideNav.demoFeaturesTitle': 'الميزات',
    'sideNav.demoHint': 'جرّب سحب حافة اللوحة واستخدام زر التبديل ->',
    'sideNav.demoSubtitle': 'لوحة جانبية بنمط مساحة عمل مع تغيير حجم بالسحب',
    'sideNav.demoTitle': 'عرض DraggableSideNav',
    'sideNav.expand': 'توسيع الشريط الجانبي',
  },
} satisfies TranslationResourcesMap;

export default resources;
