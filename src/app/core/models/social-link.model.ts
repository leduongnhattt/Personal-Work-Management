export interface SocialLink {
  socialLinkId: string;
  userId: string;
  platform: string;
  url: string;
  createdAt: string;
}

export interface CreateMultipleSocialLinksDTO {
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

export interface UpdateSocialLinkDTO {
  url: string;
}
