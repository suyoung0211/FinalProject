export interface HotIssueDto {
  articleId: number;
  title: string;
  aiTitle: string | null;
  thumbnail: string | null;
  publishedAt: string;
  categories: string[];
}
