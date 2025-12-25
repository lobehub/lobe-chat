import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'avatar',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Aşım',
    'tokenTag.remained': 'Kalan',
    'tokenTag.used': 'Kullanılan',
  },
  common: {
    'common.cancel': 'İptal',
    'common.confirm': 'Onayla',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
  },
  editableMessage: {
    'editableMessage.addProps': 'Özellik ekle',
    'editableMessage.delete': 'Sil',
    'editableMessage.input': 'Girdi',
    'editableMessage.inputPlaceholder': 'Örnek girdi içeriği girin',
    'editableMessage.output': 'Çıktı',
    'editableMessage.outputPlaceholder': 'Örnek çıktı içeriği girin',
    'editableMessage.system': 'Sistem',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Sil',
    'emojiPicker.draggerDesc': 'Yüklemek için tıklayın veya resmi bu alana sürükleyin',
    'emojiPicker.emoji': 'Emoji',
    'emojiPicker.fileTypeError': 'Yalnızca resim dosyası yükleyebilirsiniz!',
    'emojiPicker.upload': 'Yükle',
    'emojiPicker.uploadBtn': 'Kırp ve yükle',
  },
  form: {
    'form.reset': 'Sıfırla',
    'form.submit': 'Gönder',
    'form.unsavedChanges': 'Kaydedilmemiş değişiklikler',
    'form.unsavedWarning': 'Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinizden emin misiniz?',
  },
  hotkey: {
    'hotkey.conflict': 'Bu kısayol mevcut bir kısayolla çakışıyor.',
    'hotkey.invalidCombination':
      'Kısayol bir değiştirici tuş (Ctrl, Alt, Shift) içermeli ve yalnızca bir normal tuş olmalıdır.',
    'hotkey.placeholder': 'Kısayolu kaydetmek için tuşlara basın',
    'hotkey.reset': 'Varsayılana sıfırla',
  },
  messageModal: {
    'messageModal.cancel': 'İptal',
    'messageModal.confirm': 'Onayla',
    'messageModal.edit': 'Düzenle',
  },
  sideNav: {
    'sideNav.collapse': 'Kenar çubuğunu daralt',
    'sideNav.demoActiveLabel': 'Aktif',
    'sideNav.demoFeatureAutoCollapseDesc': 'Akıllı daraltma için eşiğin altına sürükleyin',
    'sideNav.demoFeatureAutoCollapseTitle': 'Otomatik daraltma',
    'sideNav.demoFeaturePerformanceDesc': 'Daha iyi performans için animasyon yükü yok',
    'sideNav.demoFeaturePerformanceTitle': 'Performans',
    'sideNav.demoFeatureResizeDesc': 'Panel genişliğini ayarlamak için sürükleyin',
    'sideNav.demoFeatureResizeTitle': 'Esnek yeniden boyutlandırma',
    'sideNav.demoFeatureSmartHandleDesc': 'Anahtar düğmesini göstermek için üzerine gelin',
    'sideNav.demoFeatureSmartHandleTitle': 'Akıllı tutamak',
    'sideNav.demoFeaturesTitle': 'Özellikler',
    'sideNav.demoHint': 'Panel kenarını sürükleyip düğmeyi kullanmayı deneyin ->',
    'sideNav.demoSubtitle': 'Sürüklenebilir yeniden boyutlandırmalı çalışma alanı tarzı yan panel',
    'sideNav.demoTitle': 'DraggableSideNav Demo',
    'sideNav.expand': 'Kenar çubuğunu genişlet',
  },
} satisfies TranslationResourcesMap;

export default resources;
