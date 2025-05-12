export interface DeleteFilesResponse {
  errors?: { message: string; path: string }[];
  success: boolean;
}
