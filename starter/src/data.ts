import raw from "./photos.json";

export interface Category {
  id: string;
  label: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  summary: string;
  photoIds: string[];
}

export interface Photo {
  id: string;
  category: string;
  seriesId: string;
  file: string;
  title: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  order: number;
}

export const categories: Category[] = raw.categories;
export const seriesList: Series[] = raw.series;
export const photos: Photo[] = raw.photos;

const photosById = new Map(photos.map((p) => [p.id, p]));

export const ALL_FILTER = "all";

export function photoUrl(photo: Photo): string {
  return `/${photo.file}`;
}

export function getSeries(seriesId: string): Series | undefined {
  return seriesList.find((s) => s.id === seriesId);
}

/** Photos of a series, in the order defined by the series' photoIds list. */
export function seriesPhotos(seriesId: string): Photo[] {
  const series = getSeries(seriesId);
  if (!series) return [];
  return series.photoIds
    .map((id) => photosById.get(id))
    .filter((p): p is Photo => p !== undefined);
}

/** Photos matching a category filter ("all" returns every photo). */
export function filterPhotos(category: string): Photo[] {
  if (category === ALL_FILTER) return photos;
  return photos.filter((p) => p.category === category);
}

export function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function seriesForPhoto(photo: Photo): Series | undefined {
  return getSeries(photo.seriesId);
}
