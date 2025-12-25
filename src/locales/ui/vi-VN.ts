import type { TranslationResourcesMap } from '@lobehub/ui/i18n';

const resources = {
  chat: {
    'chat.avatar': 'ảnh đại diện',
    'chat.placeholder': '...',
    'tokenTag.overload': 'Vượt',
    'tokenTag.remained': 'Còn lại',
    'tokenTag.used': 'Đã dùng',
  },
  common: {
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
    'common.delete': 'Xóa',
    'common.edit': 'Chỉnh sửa',
  },
  editableMessage: {
    'editableMessage.addProps': 'Thêm thuộc tính',
    'editableMessage.delete': 'Xóa',
    'editableMessage.input': 'Đầu vào',
    'editableMessage.inputPlaceholder': 'Vui lòng nhập nội dung đầu vào mẫu',
    'editableMessage.output': 'Đầu ra',
    'editableMessage.outputPlaceholder': 'Vui lòng nhập nội dung đầu ra mẫu',
    'editableMessage.system': 'Hệ thống',
  },
  emojiPicker: {
    'emojiPicker.delete': 'Xóa',
    'emojiPicker.draggerDesc': 'Nhấp hoặc kéo ảnh vào khu vực này để tải lên',
    'emojiPicker.emoji': 'Emoji',
    'emojiPicker.fileTypeError': 'Bạn chỉ có thể tải lên tệp hình ảnh!',
    'emojiPicker.upload': 'Tải lên',
    'emojiPicker.uploadBtn': 'Cắt và tải lên',
  },
  form: {
    'form.reset': 'Đặt lại',
    'form.submit': 'Gửi',
    'form.unsavedChanges': 'Thay đổi chưa lưu',
    'form.unsavedWarning': 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời đi không?',
  },
  hotkey: {
    'hotkey.conflict': 'Phím tắt này xung đột với phím tắt hiện có.',
    'hotkey.invalidCombination':
      'Phím tắt phải bao gồm phím bổ trợ (Ctrl, Alt, Shift) và chỉ một phím thường.',
    'hotkey.placeholder': 'Nhấn phím để ghi phím tắt',
    'hotkey.reset': 'Đặt lại về mặc định',
  },
  messageModal: {
    'messageModal.cancel': 'Hủy',
    'messageModal.confirm': 'Xác nhận',
    'messageModal.edit': 'Chỉnh sửa',
  },
  sideNav: {
    'sideNav.collapse': 'Thu gọn thanh bên',
    'sideNav.demoActiveLabel': 'Đang hoạt động',
    'sideNav.demoFeatureAutoCollapseDesc': 'Kéo xuống dưới ngưỡng để tự thu gọn thông minh',
    'sideNav.demoFeatureAutoCollapseTitle': 'Tự thu gọn',
    'sideNav.demoFeaturePerformanceDesc': 'Không tốn chi phí hoạt ảnh, hiệu năng tốt hơn',
    'sideNav.demoFeaturePerformanceTitle': 'Hiệu năng',
    'sideNav.demoFeatureResizeDesc': 'Kéo để điều chỉnh độ rộng bảng',
    'sideNav.demoFeatureResizeTitle': 'Thay đổi kích thước linh hoạt',
    'sideNav.demoFeatureSmartHandleDesc': 'Di chuột để hiện nút chuyển',
    'sideNav.demoFeatureSmartHandleTitle': 'Tay cầm thông minh',
    'sideNav.demoFeaturesTitle': 'Tính năng',
    'sideNav.demoHint': 'Hãy thử kéo cạnh bảng và dùng nút chuyển ->',
    'sideNav.demoSubtitle': 'Bảng bên phong cách workspace với thay đổi kích thước bằng kéo',
    'sideNav.demoTitle': 'Demo DraggableSideNav',
    'sideNav.expand': 'Mở rộng thanh bên',
  },
} satisfies TranslationResourcesMap;

export default resources;
