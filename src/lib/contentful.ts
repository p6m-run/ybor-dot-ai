import type { EdeProductPage, Homepage } from '@/types/contentful';
import { createClient } from 'contentful';


// Contentful configuration
const spaceId = import.meta.env.CONTENTFUL_SPACE_ID;
const previewToken = import.meta.env.CONTENTFUL_PREVIEW_TOKEN;
const deliveryToken = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;

// Debug: Check if env vars are loaded
console.log('🔐 Contentful env check:', {
  hasSpaceId: !!spaceId,
  hasPreviewToken: !!previewToken,
  hasDeliveryToken: !!deliveryToken,
  isDev: import.meta.env.DEV,
});

const config = {
  space: spaceId,
  accessToken: import.meta.env.DEV ? previewToken : deliveryToken,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
};

// Create Contentful client
export const contentfulClient = createClient(config);

// Type definitions for common Contentful fields
export interface ContentfulAsset {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

export interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    contentType: {
      sys: {
        id: string;
        linkType: string;
        type: string;
      };
    };
  };
  fields: Record<string, any>;
}

// Utility function to get asset URL
export function getAssetUrl(asset: ContentfulAsset): string {
  return `https:${asset.fields.file.url}`;
}

// Utility function to get optimized image URL
export function getOptimizedImageUrl(
  asset: ContentfulAsset,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  const baseUrl = getAssetUrl(asset);
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', 'webp');
  
  return `${baseUrl}?${params.toString()}`;
}

// Homepage-specific functions
export async function getHomepageData(): Promise<any> {
  try {
    // First, try to get any homepage entry (in case the ID is different)
    const { items } = await contentfulClient.getEntries<{
      contentTypeId: "homepage",
      fields: Homepage
    }>({
      content_type: 'homepage',
      limit: 1,
    });
    
    if (items.length === 0) {
      console.warn('No homepage entries found in Contentful');
      return null;
    }
    
    const homepageEntry = items[0];
    
    // Process all the sections with their nested content
      const processedHomepage = {
        id: homepageEntry.sys.id,
        title: homepageEntry.fields.title || '',
        heroSection: await processSection(homepageEntry.fields.heroSection),
        missionSection: await processSection(homepageEntry.fields.missionSection),
        challengesSection: await processSection(homepageEntry.fields.challengesSection),
        platformSection: await processSection(homepageEntry.fields.platformSection),
        businessImpactSection: await processSection(homepageEntry.fields.businessImpactSection),
        productSuiteSection: await processSection(homepageEntry.fields.productSuiteSection),
        testimonialsSection: await processSection(homepageEntry.fields.testimonialsSection),
        certificationsSection: await processSection(homepageEntry.fields.certificationsSection),
        contactSection: await processSection(homepageEntry.fields.contactSection),
      };
    
    return processedHomepage;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null; // Return null instead of throwing to allow fallback content
  }
}

// EDE-specific functions
export async function getEdePageData(): Promise<any> {
  try {
    // First, try to get any homepage entry (in case the ID is different)
    const { items } = await contentfulClient.getEntries<{
      contentTypeId: "edeProductPage",
      fields: EdeProductPage
    }>({
      content_type: 'edeProductPage',
      limit: 1,
    });
    
    if (items.length === 0) {
      console.warn('No edeProductPage entries found in Contentful');
      return null;
    }
    
    const edeProductPageEntry = items[0];
    
    // Process all the sections with their nested content
      const processedEdeProductPage = {
        id: edeProductPageEntry.sys.id,
        title: edeProductPageEntry.fields.title || '',
        edeHeroSection: await processSection(edeProductPageEntry.fields.edeHeroSection),
        capabilitiesSection: await processSection(edeProductPageEntry.fields.capabilities),
        contactSection: await processSection(edeProductPageEntry.fields.contactSection),
      };
    
    return processedEdeProductPage;
  } catch (error) {
    console.error('Error fetching edeProductPage data:', error);
    return null; // Return null instead of throwing to allow fallback content
  }
}

// Helper function to process sections with their nested content
async function processSection(sectionRef: any): Promise<any> {
  if (!sectionRef || !sectionRef.sys) return null;
  
  try {
    const section = await contentfulClient.getEntry<any>(sectionRef.sys.id, { include: 10 });
    return section;
  } catch (error) {
    console.error(`Error processing section ${sectionRef.sys.id}:`, error);
    return null;
  }
}
