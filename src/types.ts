export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind bg-color and text-color classes
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  categoryId: string;
  createdAt: string;
  clicks: number;
}
