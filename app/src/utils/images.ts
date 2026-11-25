import { File, Paths } from 'expo-file-system';

export function persistImage(uri: string): string {
  try {
    const raw = uri.split('?')[0].split('.').pop() ?? 'jpg';
    const ext = raw.length <= 4 ? raw : 'jpg';
    const dest = new File(Paths.document, `product-${Date.now()}.${ext}`);
    new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}