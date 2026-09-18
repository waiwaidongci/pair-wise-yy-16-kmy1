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

/** All photos in the order defined by photos.json (grouped by series, then `order`). */
export const allPhotos: Photo[] = raw.photos;

const photoById = new Map(allPhotos.map((p) => [p.id, p]));

export function photoUrl(photo: Photo): string {
  return `/${photo.file}`;
}

export function seriesById(id: string): Series | undefined {
  return seriesList.find((s) => s.id === id);
}

/** Photos of a series, resolved from photos.json — the single source of truth. */
export function seriesPhotos(series: Series): Photo[] {
  return series.photoIds.map((id) => {
    const photo = photoById.get(id);
    if (!photo) throw new Error(`photos.json is missing photo "${id}"`);
    return photo;
  });
}

export function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function seriesTitle(id: string): string {
  return seriesById(id)?.title ?? id;
}
