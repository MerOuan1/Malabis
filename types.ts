
export interface ImagePart {
  data: string;
  mimeType: string;
}

export interface EditedImageResult {
  newImage: ImagePart;
  responseText?: string;
}

export type Theme = 'light' | 'dark';
