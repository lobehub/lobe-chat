import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'Avatar',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Überlastung',
    'tokenTag.remained': 'Verbleibend',
    'tokenTag.used': 'Verwendet',
  },
  common: {
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
  },
  editableMessage: {
    'editableMessage.addProps': 'Eigenschaften hinzufügen',
    'editableMessage.delete': 'Löschen',
    'editableMessage.input': 'Eingabe',
    'editableMessage.inputPlaceholder': 'Bitte Beispiel-Eingabeinhalt eingeben',
    'editableMessage.output': 'Ausgabe',
    'editableMessage.outputPlaceholder': 'Bitte Beispiel-Ausgabeinhalt eingeben',
    'editableMessage.system': 'System',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Löschen',
    'emojiPicker.draggerDesc': 'Klicken oder Bild in diesen Bereich ziehen, um es hochzuladen',
    'emojiPicker.emoji': 'Emoji',
    'emojiPicker.fileTypeError': 'Sie können nur Bilddateien hochladen!',
    'emojiPicker.upload': 'Hochladen',
    'emojiPicker.uploadBtn': 'Zuschneiden und hochladen',
  },
  form: {
    'form.reset': 'Zurücksetzen',
    'form.submit': 'Absenden',
    'form.unsavedChanges': 'Ungespeicherte Änderungen',
    'form.unsavedWarning':
      'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?',
  },
  hotkey: {
    'hotkey.conflict': 'Diese Tastenkombination steht im Konflikt mit einer bestehenden.',
    'hotkey.invalidCombination':
      'Die Tastenkombination muss eine Modifikatortaste (Ctrl, Alt, Umschalt) und nur eine normale Taste enthalten.',
    'hotkey.placeholder': 'Tasten drücken, um die Tastenkombination aufzunehmen',
    'hotkey.reset': 'Auf Standard zurücksetzen',
  },
  messageModal: {
    'messageModal.cancel': 'Abbrechen',
    'messageModal.confirm': 'Bestätigen',
    'messageModal.edit': 'Bearbeiten',
  },
  sideNav: {
    'sideNav.collapse': 'Seitenleiste einklappen',
    'sideNav.demoActiveLabel': 'Aktiv',
    'sideNav.demoFeatureAutoCollapseDesc': 'Unter die Schwelle ziehen für intelligentes Einklappen',
    'sideNav.demoFeatureAutoCollapseTitle': 'Automatisch einklappen',
    'sideNav.demoFeaturePerformanceDesc': 'Keine Animations-Overhead für bessere Leistung',
    'sideNav.demoFeaturePerformanceTitle': 'Leistung',
    'sideNav.demoFeatureResizeDesc': 'Ziehen, um die Panelbreite anzupassen',
    'sideNav.demoFeatureResizeTitle': 'Flexibles Anpassen',
    'sideNav.demoFeatureSmartHandleDesc': 'Zum Anzeigen der Umschaltfläche darüberfahren',
    'sideNav.demoFeatureSmartHandleTitle': 'Intelligenter Griff',
    'sideNav.demoFeaturesTitle': 'Funktionen',
    'sideNav.demoHint': 'Versuchen Sie, die Panelkante zu ziehen und die Umschaltfläche zu verwenden ->',
    'sideNav.demoSubtitle': 'Eine Arbeitsbereich-Seitenleiste mit ziehbarer Größenänderung',
    'sideNav.demoTitle': 'DraggableSideNav Demo',
    'sideNav.expand': 'Seitenleiste ausklappen',
  },
} satisfies TranslationResourcesMap;

export default resources;
