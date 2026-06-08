import { create } from 'zustand'
import { Snapshot, CategoryType, SortType } from '@/types/index'
import { mockSnapshots } from '@/data/snapshots'

interface AppState {
  snapshots: Snapshot[]
  likedIds: Set<string>
  bookmarkedIds: Set<string>
  searchKeyword: string
  category: CategoryType
  sortType: SortType
  setSearchKeyword: (keyword: string) => void
  setCategory: (category: CategoryType) => void
  setSortType: (sortType: SortType) => void
  toggleLike: (id: string) => void
  toggleBookmark: (id: string) => void
  addSnapshot: (snapshot: Snapshot) => void
  approveSnapshot: (id: string) => void
  rejectSnapshot: (id: string) => void
  getFilteredSnapshots: () => Snapshot[]
  getPendingSnapshots: () => Snapshot[]
}

export const useAppStore = create<AppState>((set, get) => ({
  snapshots: mockSnapshots,
  likedIds: new Set(mockSnapshots.filter(s => s.isLiked).map(s => s.id)),
  bookmarkedIds: new Set(mockSnapshots.filter(s => s.isBookmarked).map(s => s.id)),
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
    return { likedIds: newLiked }
  }),

  toggleBookmark: (id) => set((state) => {
    const newBookmarked = new Set(state.bookmarkedIds)
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id)
    } else {
      newBookmarked.add(id)
    }
    return { bookmarkedIds: newBookmarked }
  }),

  addSnapshot: (snapshot) => set((state) => ({
    snapshots: [snapshot, ...state.snapshots]
  })),

  approveSnapshot: (id) => set((state) => ({
    snapshots: state.snapshots.map(s =>
      s.id === id ? { ...s, status: 'approved' as const } : s
    )
  })),

  rejectSnapshot: (id) => set((state) => ({
    snapshots: state.snapshots.map(s =>
      s.id === id ? { ...s, status: 'rejected' as const } : s
    )
  })),

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
  }
}))
