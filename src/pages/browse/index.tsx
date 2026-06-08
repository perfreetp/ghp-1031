import React, { useState, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { CategoryType, SortType } from '@/types/index'
import TagFilter from '@/components/TagFilter'
import SnapshotCard from '@/components/SnapshotCard'
import styles from './index.module.scss'

const BrowsePage: React.FC = () => {
  const {
    searchKeyword,
    category,
    sortType,
    setSearchKeyword,
    setCategory,
    setSortType,
    toggleLike,
    toggleBookmark,
    getFilteredSnapshots
  } = useAppStore()

  const [localKeyword, setLocalKeyword] = useState(searchKeyword)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.keyword) {
      setSearchKeyword(decodeURIComponent(params.keyword))
      setLocalKeyword(decodeURIComponent(params.keyword))
    }
  }, [])

  const handleSearchConfirm = () => {
    setSearchKeyword(localKeyword)
  }

  const handleSortChange = (type: SortType) => {
    setSortType(type)
  }

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const filteredSnapshots = getFilteredSnapshots()

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索活动名称、社区名称..."
          placeholderClass="searchPlaceholder"
          value={localKeyword}
          onInput={(e) => setLocalKeyword(e.detail.value)}
          onConfirm={handleSearchConfirm}
        />
      </View>

      <View className={styles.filterRow}>
        <TagFilter selected={category} onChange={setCategory} />
      </View>

      <View className={styles.filterRow}>
        <View className={styles.sortTabs}>
          <View className={styles.sortTab} onClick={() => handleSortChange('latest')}>
            <Text className={classnames(styles.sortText, sortType === 'latest' && styles.sortActive)}>
              最新
            </Text>
            {sortType === 'latest' && <View className={styles.sortIndicator} />}
          </View>
          <View className={styles.sortTab} onClick={() => handleSortChange('popular')}>
            <Text className={classnames(styles.sortText, sortType === 'popular' && styles.sortActive)}>
              最热
            </Text>
            {sortType === 'popular' && <View className={styles.sortIndicator} />}
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.listWrap} style={{ height: 'calc(100vh - 300rpx)' }}>
        {filteredSnapshots.length > 0 ? (
          filteredSnapshots.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              onShare={handleShare}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无匹配的快照</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default BrowsePage
