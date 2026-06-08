export interface Snapshot {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  communityName: string;
  district: string;
  collectDate: string;
  tags: string[];
  description: string;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  category: 'official' | 'notice' | 'activity' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  contributorId: string;
  contributorName: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  snapshotCount: number;
  latestSnapshotDate: string;
  isSubscribed: boolean;
  coverUrl: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  snapshotIds: string[];
  createdAt: string;
  announcementCount: number;
}

export interface ReviewItem {
  id: string;
  snapshotId: string;
  snapshotTitle: string;
  snapshotImageUrl: string;
  communityName: string;
  contributorName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  contributionCount: number;
  bookmarkCount: number;
  subscriptionCount: number;
  reviewCount: number;
}

export type TabType = 'contributions' | 'bookmarks' | 'subscriptions';
export type SortType = 'latest' | 'popular';
export type CategoryType = 'all' | 'official' | 'notice' | 'activity' | 'other';
