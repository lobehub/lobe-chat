import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'Аватар',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Превишено',
    'tokenTag.remained': 'Остава',
    'tokenTag.used': 'Използвано',
  },
  common: {
    'common.cancel': 'Отказ',
    'common.confirm': 'Потвърди',
    'common.delete': 'Изтрий',
    'common.edit': 'Редактирай',
  },
  editableMessage: {
    'editableMessage.addProps': 'Добави свойства',
    'editableMessage.delete': 'Изтрий',
    'editableMessage.input': 'Вход',
    'editableMessage.inputPlaceholder': 'Въведете примерен вход',
    'editableMessage.output': 'Изход',
    'editableMessage.outputPlaceholder': 'Въведете примерен изход',
    'editableMessage.system': 'Система',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Изтрий',
    'emojiPicker.draggerDesc': 'Кликнете или плъзнете изображение тук за качване',
    'emojiPicker.emoji': 'Емоджи',
    'emojiPicker.fileTypeError': 'Можете да качвате само изображения!',
    'emojiPicker.upload': 'Качване',
    'emojiPicker.uploadBtn': 'Изрежи и качи',
  },
  form: {
    'form.reset': 'Нулиране',
    'form.submit': 'Изпрати',
    'form.unsavedChanges': 'Незапазени промени',
    'form.unsavedWarning': 'Имате незапазени промени. Сигурни ли сте, че искате да напуснете?',
  },
  hotkey: {
    'hotkey.conflict': 'Тази клавишна комбинация е в конфликт със съществуваща.',
    'hotkey.invalidCombination':
      'Комбинацията трябва да включва модификатор (Ctrl, Alt, Shift) и само един обикновен клавиш.',
    'hotkey.placeholder': 'Натиснете клавишите, за да запишете комбинацията',
    'hotkey.reset': 'Възстанови по подразбиране',
  },
  messageModal: {
    'messageModal.cancel': 'Отказ',
    'messageModal.confirm': 'Потвърди',
    'messageModal.edit': 'Редактирай',
  },
  sideNav: {
    'sideNav.collapse': 'Свий страничната лента',
    'sideNav.demoActiveLabel': 'Активно',
    'sideNav.demoFeatureAutoCollapseDesc': 'Плъзнете под прага за интелигентно свиване',
    'sideNav.demoFeatureAutoCollapseTitle': 'Автоматично свиване',
    'sideNav.demoFeaturePerformanceDesc': 'Без анимационен overhead за по-добра производителност',
    'sideNav.demoFeaturePerformanceTitle': 'Производителност',
    'sideNav.demoFeatureResizeDesc': 'Плъзнете, за да настроите ширината на панела',
    'sideNav.demoFeatureResizeTitle': 'Гъвкаво оразмеряване',
    'sideNav.demoFeatureSmartHandleDesc': 'Задръжте курсора, за да се покаже бутонът',
    'sideNav.demoFeatureSmartHandleTitle': 'Интелигентна дръжка',
    'sideNav.demoFeaturesTitle': 'Функции',
    'sideNav.demoHint': 'Опитайте да плъзнете ръба на панела и да използвате бутона ->',
    'sideNav.demoSubtitle': 'Страничен панел тип работно пространство с плъзгащо оразмеряване',
    'sideNav.demoTitle': 'Демо DraggableSideNav',
    'sideNav.expand': 'Разгъни страничната лента',
  },
} satisfies TranslationResourcesMap;

export default resources;
