import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'avatar',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Eccesso',
    'tokenTag.remained': 'Rimanente',
    'tokenTag.used': 'Usato',
  },
  common: {
    'common.cancel': 'Annulla',
    'common.confirm': 'Conferma',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
  },
  editableMessage: {
    'editableMessage.addProps': 'Aggiungi proprietà',
    'editableMessage.delete': 'Elimina',
    'editableMessage.input': 'Input',
    'editableMessage.inputPlaceholder': 'Inserisci un contenuto di input di esempio',
    'editableMessage.output': 'Output',
    'editableMessage.outputPlaceholder': 'Inserisci un contenuto di output di esempio',
    'editableMessage.system': 'Sistema',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Elimina',
    'emojiPicker.draggerDesc': "Fai clic o trascina un'immagine in quest'area per caricare",
    'emojiPicker.emoji': 'Emoji',
    'emojiPicker.fileTypeError': 'Puoi caricare solo file immagine!',
    'emojiPicker.upload': 'Carica',
    'emojiPicker.uploadBtn': 'Ritaglia e carica',
  },
  form: {
    'form.reset': 'Reimposta',
    'form.submit': 'Invia',
    'form.unsavedChanges': 'Modifiche non salvate',
    'form.unsavedWarning': 'Hai modifiche non salvate. Sei sicuro di voler uscire?',
  },
  hotkey: {
    'hotkey.conflict': 'Questa scorciatoia è in conflitto con una esistente.',
    'hotkey.invalidCombination':
      'La scorciatoia deve includere un tasto modificatore (Ctrl, Alt, Maiusc) e solo un tasto normale.',
    'hotkey.placeholder': 'Premi i tasti per registrare la scorciatoia',
    'hotkey.reset': 'Ripristina predefinito',
  },
  messageModal: {
    'messageModal.cancel': 'Annulla',
    'messageModal.confirm': 'Conferma',
    'messageModal.edit': 'Modifica',
  },
  sideNav: {
    'sideNav.collapse': 'Comprimi barra laterale',
    'sideNav.demoActiveLabel': 'Attivo',
    'sideNav.demoFeatureAutoCollapseDesc':
      'Trascina sotto la soglia per comprimere in modo intelligente',
    'sideNav.demoFeatureAutoCollapseTitle': 'Compressione automatica',
    'sideNav.demoFeaturePerformanceDesc': 'Nessun overhead di animazione per migliori prestazioni',
    'sideNav.demoFeaturePerformanceTitle': 'Prestazioni',
    'sideNav.demoFeatureResizeDesc': 'Trascina per regolare la larghezza del pannello',
    'sideNav.demoFeatureResizeTitle': 'Ridimensionamento flessibile',
    'sideNav.demoFeatureSmartHandleDesc': 'Passa il mouse per mostrare il pulsante',
    'sideNav.demoFeatureSmartHandleTitle': 'Maniglia intelligente',
    'sideNav.demoFeaturesTitle': 'Funzionalità',
    'sideNav.demoHint': 'Prova a trascinare il bordo del pannello e usare il pulsante ->',
    'sideNav.demoSubtitle': 'Pannello laterale stile workspace con ridimensionamento trascinabile',
    'sideNav.demoTitle': 'Demo DraggableSideNav',
    'sideNav.expand': 'Espandi barra laterale',
  },
} satisfies TranslationResourcesMap;

export default resources;
