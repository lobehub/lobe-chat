import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'avatar',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Excedido',
    'tokenTag.remained': 'Restante',
    'tokenTag.used': 'Usado',
  },
  common: {
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
  },
  editableMessage: {
    'editableMessage.addProps': 'Adicionar propriedades',
    'editableMessage.delete': 'Excluir',
    'editableMessage.input': 'Entrada',
    'editableMessage.inputPlaceholder': 'Digite um conteúdo de entrada de exemplo',
    'editableMessage.output': 'Saída',
    'editableMessage.outputPlaceholder': 'Digite um conteúdo de saída de exemplo',
    'editableMessage.system': 'Sistema',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Excluir',
    'emojiPicker.draggerDesc': 'Clique ou arraste uma imagem para esta área para enviar',
    'emojiPicker.emoji': 'Emoji',
    'emojiPicker.fileTypeError': 'Você só pode enviar arquivos de imagem!',
    'emojiPicker.upload': 'Enviar',
    'emojiPicker.uploadBtn': 'Recortar e enviar',
  },
  form: {
    'form.reset': 'Redefinir',
    'form.submit': 'Enviar',
    'form.unsavedChanges': 'Alterações não salvas',
    'form.unsavedWarning': 'Você tem alterações não salvas. Tem certeza de que deseja sair?',
  },
  hotkey: {
    'hotkey.conflict': 'Este atalho entra em conflito com um já existente.',
    'hotkey.invalidCombination':
      'O atalho deve incluir uma tecla modificadora (Ctrl, Alt, Shift) e apenas uma tecla normal.',
    'hotkey.placeholder': 'Pressione as teclas para gravar o atalho',
    'hotkey.reset': 'Restaurar padrão',
  },
  messageModal: {
    'messageModal.cancel': 'Cancelar',
    'messageModal.confirm': 'Confirmar',
    'messageModal.edit': 'Editar',
  },
  sideNav: {
    'sideNav.collapse': 'Recolher barra lateral',
    'sideNav.demoActiveLabel': 'Ativo',
    'sideNav.demoFeatureAutoCollapseDesc': 'Arraste abaixo do limite para recolher automaticamente',
    'sideNav.demoFeatureAutoCollapseTitle': 'Auto-recolher',
    'sideNav.demoFeaturePerformanceDesc': 'Sem sobrecarga de animação para melhor desempenho',
    'sideNav.demoFeaturePerformanceTitle': 'Desempenho',
    'sideNav.demoFeatureResizeDesc': 'Arraste para ajustar a largura do painel',
    'sideNav.demoFeatureResizeTitle': 'Redimensionamento flexível',
    'sideNav.demoFeatureSmartHandleDesc': 'Passe o mouse para revelar o botão',
    'sideNav.demoFeatureSmartHandleTitle': 'Alça inteligente',
    'sideNav.demoFeaturesTitle': 'Recursos',
    'sideNav.demoHint': 'Tente arrastar a borda do painel e usar o botão ->',
    'sideNav.demoSubtitle': 'Painel lateral estilo workspace com redimensionamento arrastável',
    'sideNav.demoTitle': 'Demo do DraggableSideNav',
    'sideNav.expand': 'Expandir barra lateral',
  },
} satisfies TranslationResourcesMap;

export default resources;
