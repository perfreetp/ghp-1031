import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { Snapshot, CategoryType, SortType, Community } from '@/types/index'
import { mockSnapshots } from '@/data/snapshots'
import { mockCommunities } from '@/data/communities'

const STORAGE_KEYS = {
  snapshots: 'archive_snapshots',
  likedIds: 'archive_liked',
  bookmarkedIds: 'archive_bookmarked',
  subscribedIds: 'archive_subscribed'
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('[Store] Load storage failed:', key, e)
  }
  return fallback
}

function saveToStorage(key: string, value: unknown) {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Store] Save storage failed:', key, e)
  }
}

function persistSnapshots(snapshots: Snapshot[]) {
  saveToStorage(STORAGE_KEYS.snapshots, snapshots)
}

function persistLikedIds(ids: string[]) {
  saveToStorage(STORAGE_KEYS.likedIds, ids)
}

function persistBookmarkedIds(ids: string[]) {
  saveToStorage(STORAGE_KEYS.bookmarkedIds, ids)
}

function persistSubscribedIds(ids: string[]) {
  saveToStorage(STORAGE_KEYS.subscribedIds, ids)
}

function initSnapshots(): Snapshot[] {
  const stored = loadFromStorage<Snapshot[] | null>(STORAGE_KEYS.snapshots, null)
  if (stored && stored.length > 0) return stored
  return [...mockSnapshots]
}

function initSet(key: string): Set<string> {
  const arr = loadFromStorage<string[]>(key, [])
  return new Set(arr)
}

export function getCommunityById(id: string): Community | undefined {
  return mockCommunities.find(c => c.id === id)
}

export function getCommunityByName(name: string): Community | undefined {
  return mockCommunities.find(c => c.name === name)
}

export function getAllCommunities(): Community[] {
  return mockCommunities
}

export function computeCommunityStats(communityId: string, snapshots: Snapshot[]) {
  const community = getCommunityById(communityId)
  if (!community) return { snapshotCount: 0, latestDate: '', noSnapshots: true }
  const approved = snapshots.filter(
    s => s.status === 'approved' && s.communityName === community.name
  )
  const noSnapshots = approved.length === 0
  return {
    snapshotCount: approved.length,
    latestDate: noSnapshots ? '' : approved.sort((a, b) => b.collectDate.localeCompare(a.collectDate))[0].collectDate,
    noSnapshots
  }
}

function isRecent(dateStr: string, days: number = 7): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return (now.getTime() - d.getTime()) < days * 24 * 60 * 60 * 1000
}

export interface SubscribedCommunityInfo {
  id: string
  name: string
  district: string
  snapshotCount: number
  latestDate: string
  noSnapshots: boolean
  recentlyAdded: Snapshot[]
  recentlyApproved: Snapshot[]
}

export interface SubscriptionSummary {
  totalSubscriptions: number
  recentUpdateCount: number
  recentUpdateCommunities: { id: string; name: string }[]
}

interface AppState {
  snapshots: Snapshot[]
  likedIds: Set<string>
  bookmarkedIds: Set<string>
  subscribedCommunityIds: Set<string>
  searchKeyword: string
  category: CategoryType
  sortType: SortType

  setSearchKeyword: (keyword: string, resetCategory?: boolean) => void
  setCategory: (category: CategoryType) => void
  setSortType: (sortType: SortType) => void
  toggleLike: (id: string) => void
  toggleBookmark: (id: string) => void
  toggleSubscribe: (communityId: string) => void
  isSubscribed: (communityId: string) => boolean
  addSnapshot: (snapshot: Snapshot) => void
  approveSnapshot: (id: string) => void
  rejectSnapshot: (id: string) => void
  claimSnapshot: (id: string) => void
  getFilteredSnapshots: () => Snapshot[]
  getPendingSnapshots: () => Snapshot[]
  getMyContributions: () => Snapshot[]
  getMyBookmarks: () => Snapshot[]
  getSubscribedCommunities: () => SubscribedCommunityInfo[]
  getSubscriptionSummary: () => SubscriptionSummary
  getSnapshotsByCommunity: (communityName: string) => Snapshot[]
  getSnapshotById: (id: string) => Snapshot | undefined
  getSearchMatchedCommunity: (keyword: string) => Community | undefined
}

export const useAppStore = create<AppState>((set, get) => ({
  snapshots: initSnapshots(),
  likedIds: initSet(STORAGE_KEYS.likedIds),
  bookmarkedIds: initSet(STORAGE_KEYS.bookmarkedIds),
  subscribedCommunityIds: initSet(STORAGE_KEYS.subscribedIds),
  searchKeyword: '',
  category: 'all',
  sortType: 'latest',

  setSearchKeyword: (keyword, resetCategory = false) => set((state) => {
    const updates: Partial<AppState> = { searchKeyword: keyword }
    if (resetCategory && keyword) {
      updates.category = 'all'
    }
    return updates
  }),

  setCategory: (category) => set({ category }),
  setSortType: (sortType) => set({ sortType }),

  toggleLike: (id) => set((state) => {
    const newLiked = new Set(state.likedIds)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    persistLikedIds([...newLiked])
    return { likedIds: newLiked }
  }),

  toggleBookmark: (id) => set((state) => {
    const newBookmarked = new Set(state.bookmarkedIds)
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id)
    } else {
      newBookmarked.add(id)
    }
    persistBookmarkedIds([...newBookmarked])
    return { bookmarkedIds: newBookmarked }
  }),

  toggleSubscribe: (communityId) => set((state) => {
    const newSubscribed = new Set(state.subscribedCommunityIds)
    if (newSubscribed.has(communityId)) {
      newSubscribed.delete(communityId)
    } else {
      newSubscribed.add(communityId)
    }
    persistSubscribedIds([...newSubscribed])
    return { subscribedCommunityIds: newSubscribed }
  }),

  isSubscribed: (communityId) => {
    return get().subscribedCommunityIds.has(communityId)
  },

  addSnapshot: (snapshot) => set((state) => {
    const newSnapshots = [snapshot, ...state.snapshots]
    persistSnapshots(newSnapshots)
    return { snapshots: newSnapshots }
  }),

  approveSnapshot: (id) => set((state) => {
    const newSnapshots = state.snapshots.map(s =>
      s.id === id ? { ...s, status: 'approved' as const } : s
    )
    persistSnapshots(newSnapshots)
    return { snapshots: newSnapshots }
  }),

  rejectSnapshot: (id) => set((state) => {
    const newSnapshots = state.snapshots.map(s =>
      s.id === id ? { ...s, status: 'rejected' as const } : s
    )
    persistSnapshots(newSnapshots)
    return { snapshots: newSnapshots }
  }),

  claimSnapshot: (id) => set((state) => {
    const newSnapshots = state.snapshots.map(s =>
      s.id === id ? { ...s, isClaimed: true, claimedBy: 'u_current', contributorId: 'u_current', contributorName: '我' } : s
    )
    persistSnapshots(newSnapshots)
    return { snapshots: newSnapshots }
  }),

  getFilteredSnapshots: () => {
    const { snapshots, searchKeyword, category, sortType, likedIds, bookmarkedIds } = get()
    let filtered = snapshots.filter(s => s.status === 'approved')

    if (category !== 'all') {
      filtered = filtered.filter(s => s.category === category)
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(kw) ||
        s.communityName.toLowerCase().includes(kw) ||
        s.tags.some(t => t.toLowerCase().includes(kw))
      )
    }

    filtered = filtered.map(s => ({
      ...s,
      isLiked: likedIds.has(s.id),
      isBookmarked: bookmarkedIds.has(s.id)
    }))

    if (sortType === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  },

  getPendingSnapshots: () => {
    const { snapshots } = get()
    return snapshots.filter(s => s.status === 'pending')
  },

  getMyContributions: () => {
    const { snapshots, likedIds, bookmarkedIds } = get()
    return snapshots
      .filter(s => s.contributorId === 'u_current' || s.claimedBy === 'u_current')
      .map(s => ({
        ...s,
        isLiked: likedIds.has(s.id),
        isBookmarked: bookmarkedIds.has(s.id)
      }))
  },

  getMyBookmarks: () => {
    const { snapshots, likedIds, bookmarkedIds } = get()
    return snapshots
      .filter(s => bookmarkedIds.has(s.id))
      .map(s => ({
        ...s,
        isLiked: likedIds.has(s.id),
        isBookmarked: true
      }))
  },

  getSubscribedCommunities: () => {
    const { snapshots, subscribedCommunityIds, likedIds, bookmarkedIds } = get()
    const result: SubscribedCommunityInfo[] = []
    subscribedCommunityIds.forEach(cId => {
      const community = getCommunityById(cId)
      if (!community) return
      const approved = snapshots
        .filter(s => s.status === 'approved' && s.communityName === community.name)
        .map(s => ({
          ...s,
          isLiked: likedIds.has(s.id),
          isBookmarked: bookmarkedIds.has(s.id)
        }))
        .sort((a, b) => b.collectDate.localeCompare(a.collectDate))

      const noSnapshots = approved.length === 0

      const recentlyAdded = snapshots
        .filter(s => s.communityName === community.name && isRecent(s.createdAt))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map(s => ({
          ...s,
          isLiked: likedIds.has(s.id),
          isBookmarked: bookmarkedIds.has(s.id)
        }))

      const recentlyApproved = snapshots
        .filter(s => s.status === 'approved' && s.communityName === community.name && isRecent(s.createdAt))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map(s => ({
          ...s,
          isLiked: likedIds.has(s.id),
          isBookmarked: bookmarkedIds.has(s.id)
        }))

      result.push({
        id: cId,
        name: community.name,
        district: community.district,
        snapshotCount: approved.length,
        latestDate: noSnapshots ? '' : approved[0].collectDate,
        noSnapshots,
        recentlyAdded,
        recentlyApproved
      })
    })
    return result
  },

  getSubscriptionSummary: () => {
    const { snapshots, subscribedCommunityIds } = get()
    const recentUpdateCommunities: { id: string; name: string }[] = []
    subscribedCommunityIds.forEach(cId => {
      const community = getCommunityById(cId)
      if (!community) return
      const hasRecent = snapshots.some(
        s => s.communityName === community.name && isRecent(s.createdAt)
      )
      if (hasRecent) {
        recentUpdateCommunities.push({ id: cId, name: community.name })
      }
    })
    return {
      totalSubscriptions: subscribedCommunityIds.size,
      recentUpdateCount: recentUpdateCommunities.length,
      recentUpdateCommunities
    }
  },

  getSnapshotsByCommunity: (communityName) => {
    const { snapshots, likedIds, bookmarkedIds } = get()
    return snapshots
      .filter(s => s.status === 'approved' && s.communityName === communityName)
      .map(s => ({
        ...s,
        isLiked: likedIds.has(s.id),
        isBookmarked: bookmarkedIds.has(s.id)
      }))
      .sort((a, b) => b.collectDate.localeCompare(a.collectDate))
  },

  getSnapshotById: (id) => {
    const { snapshots, likedIds, bookmarkedIds } = get()
    const s = snapshots.find(s => s.id === id)
    if (!s) return undefined
    return {
      ...s,
      isLiked: likedIds.has(s.id),
      isBookmarked: bookmarkedIds.has(s.id)
    }
  },

  getSearchMatchedCommunity: (keyword) => {
    if (!keyword) return undefined
    const kw = keyword.toLowerCase()
    return mockCommunities.find(c => c.name.toLowerCase().includes(kw))
  }
}))
