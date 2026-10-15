import { ApplicationStatus, DocumentItem, BlogPost, FAQItem, Testimonial } from '../types';
import { applicationService } from './applicationService';
import { documentService } from './documentService';
import { notificationService } from './notificationService';
import { blogPostsData } from '../data/blog';
import { faqsData } from '../data/faqs';

let mockBlogStore: BlogPost[] = [...blogPostsData];
let mockFaqStore: FAQItem[] = [...faqsData];

export const adminService = {
  /**
   * Change application pipeline status and notify applicant
   */
  async changeApplicationStatus(
    applicationId: string,
    studentUserId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) {
    const res = await applicationService.updateStatus(applicationId, newStatus, note);
    await notificationService.createNotification({
      userId: studentUserId,
      title: `Application Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: note || `Your application pipeline stage has been updated to ${newStatus}.`,
      type: 'application',
    });
    return res;
  },

  /**
   * Request document correction with mandatory note
   */
  async requestDocumentCorrection(
    applicationId: string,
    documentId: string,
    documentTitle: string,
    studentUserId: string,
    adminNote: string
  ) {
    await documentService.updateStatus({
      applicationId,
      documentId,
      status: 'correction_required',
      adminNote,
    });

    await notificationService.createNotification({
      userId: studentUserId,
      title: `Action Required: ${documentTitle}`,
      message: `Counselor note: "${adminNote}". Please upload a revised document.`,
      type: 'document',
    });
  },

  /**
   * Content Management: Blog Posts
   */
  async getBlogPosts(): Promise<BlogPost[]> {
    return mockBlogStore;
  },

  async createBlogPost(post: BlogPost): Promise<BlogPost> {
    mockBlogStore = [post, ...mockBlogStore];
    return post;
  },

  async deleteBlogPost(id: string): Promise<boolean> {
    mockBlogStore = mockBlogStore.filter(p => p.id !== id);
    return true;
  },

  /**
   * Content Management: FAQs
   */
  async getFAQs(): Promise<FAQItem[]> {
    return mockFaqStore;
  },

  async createFAQ(item: FAQItem): Promise<FAQItem> {
    mockFaqStore = [...mockFaqStore, item];
    return item;
  },

  async deleteFAQ(id: string): Promise<boolean> {
    mockFaqStore = mockFaqStore.filter(f => f.id !== id);
    return true;
  },
};
