// src/infrastructure/cms/orchard/client.ts
import axios, { AxiosInstance } from "axios";

// Define types for Orchard CMS
interface OrchardContentQuery {
  status?: "published" | "draft" | "latest";
  orderBy?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | undefined;
}

interface OrchardContentItem {
  contentItemId: string;
  contentItemVersionId: string;
  contentType: string;
  displayText: string;
  latest: boolean;
  published: boolean;
  modifiedUtc: string;
  publishedUtc: string;
  createdUtc: string;
  owner: string;
  author: string;
  [key: string]: unknown; // For dynamic content fields
}

interface OrchardContentResponse {
  items: OrchardContentItem[];
  totalCount: number;
}

class OrchardCMSClient {
  private baseURL: string;
  private apiKey: string;
  private client: AxiosInstance;

  constructor() {
    this.baseURL = process.env.ORCHARD_CMS_URL || "";
    this.apiKey = process.env.ORCHARD_API_KEY || "";

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getContent(
    contentType: string,
    query?: OrchardContentQuery
  ): Promise<OrchardContentResponse> {
    const response = await this.client.get<OrchardContentResponse>(
      `/api/content/${contentType}`,
      { params: query }
    );
    return response.data;
  }

  async getContentItem(contentItemId: string): Promise<OrchardContentItem> {
    const response = await this.client.get<OrchardContentItem>(
      `/api/content/${contentItemId}`
    );
    return response.data;
  }

  async createContent(
    contentType: string,
    content: Record<string, unknown>
  ): Promise<OrchardContentItem> {
    const response = await this.client.post<OrchardContentItem>(
      `/api/content/${contentType}`,
      content
    );
    return response.data;
  }

  async updateContent(
    contentItemId: string,
    content: Record<string, unknown>
  ): Promise<OrchardContentItem> {
    const response = await this.client.put<OrchardContentItem>(
      `/api/content/${contentItemId}`,
      content
    );
    return response.data;
  }

  async deleteContent(contentItemId: string): Promise<void> {
    await this.client.delete(`/api/content/${contentItemId}`);
  }
}

// Create named instance before exporting
const orchardCMSClient = new OrchardCMSClient();

export default orchardCMSClient;
export { OrchardCMSClient };
export type { OrchardContentItem, OrchardContentQuery, OrchardContentResponse };
