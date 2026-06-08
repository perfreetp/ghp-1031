import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { Snapshot, CategoryType, SortType } from '@/types/index'
import { mockSnapshots } from '@/data/snapshots'

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

interface AppState {
  snapshots: Snapshot[]
  likedIds: Set<string>
  bookmarkedIds: Set<string>
  subscribedCommunityIds: Set<string>
  searchKeyword: string
  category: CategoryType
  sortType: SortType

  setSearchKeyword: (keyword: string) => void
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
  getSubscribedCommunities: () => { id: string; name: string; latestDate: string }[]
  getSnapshotsByCommunity: (communityName: string) => Snapshot[]
}

export const useAppStore = create<AppState>((set, get) => ({
  snapshots: initSnapshots(),
  likedIds: initSet(STORAGE_KEYS.likedIds),
  bookmarkedIds: initSet(STORAGE_KEYS.bookmarkedIds),
  subscribedCommunityIds: initSet(STORAGE_KEYS.subscribedIds),
  searchKeyword: '',
  category: 'all',
  sortType: 'latest',

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
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
    const { snapshots, subscribedCommunityIds } = get()
    const communityMap = new Map<string, { name: string; latestDate: string }>()
    snapshots.filter(s => s.status === 'approved').forEach(s => {
      const existing = communityMap.get(s.communityName)
      if (!existing || s.collectDate > existing.latestDate) {
        communityMap.set(s.communityName, { name: s.communityName, latestDate: s.collectDate })
      }
    })
    const result: { id: string; name: string; latestDate: string }[] = []
    subscribedCommunityIds.forEach(cId => {
      const match = [...communityMap.entries()].find(([name]) => {
        const communityName = name
        return communityName.includes(cId.replace('c', '社区')) || cId !== ''
      })
      if (match) {
        result.push({ id: cId, name: match[1].name, latestDate: match[1].latestDate })
      }
    })
    return result
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
  }
}))
