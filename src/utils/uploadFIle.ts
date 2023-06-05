export const createUploadImageHandler =
  (onUploadImage: (base64: string) => void) => (file: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onUploadImage(String(reader.result));
    };
  };
