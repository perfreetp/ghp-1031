import React, { useState, useEffect } from 'react'
import { View, Text, Input, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, getCommunityById } from '@/store/useAppStore'
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
    claimSnapshot,
    getFilteredSnapshots,
    getSearchMatchedCommunity
  } = useAppStore()

  const [localKeyword, setLocalKeyword] = useState(searchKeyword)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.keyword) {
      const kw = decodeURIComponent(params.keyword)
      setSearchKeyword(kw, true)
      setLocalKeyword(kw)
    }
  }, [])

  useEffect(() => {
    setLocalKeyword(searchKeyword)
  }, [searchKeyword])

  const handleSearchConfirm = () => {
    setSearchKeyword(localKeyword, true)
  }

  const handleSortChange = (type: SortType) => {
    setSortType(type)
  }

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  const handleClaim = (id: string) => {
    claimSnapshot(id)
    Taro.showToast({ title: '认领成功', icon: 'success' })
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setLocalKeyword('')
  }

  const filteredSnapshots = getFilteredSnapshots()
  const matchedCommunity = searchKeyword ? getSearchMatchedCommunity(searchKeyword) : undefined

  const handleCommunityEntry = () => {
    if (matchedCommunity) {
      Taro.navigateTo({ url: `/pages/topic/index?id=${matchedCommunity.id}` })
    }
  }

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
          confirmType="search"
        />
        {searchKeyword && (
          <View className={styles.clearBtn} onClick={handleClearSearch}>
            <Text className={styles.clearText}>✕</Text>
          </View>
        )}
      </View>

      {searchKeyword && (
        <View className={styles.searchHint}>
          <Text className={styles.searchHintText}>
            搜索「{searchKeyword}」找到 {filteredSnapshots.length} 个结果
          </Text>
        </View>
      )}

      {matchedCommunity && searchKeyword && (
        <View className={styles.communityEntry} onClick={handleCommunityEntry}>
          <Image className={styles.communityEntryAvatar} src={matchedCommunity.coverUrl} mode="aspectFill" />
          <View className={styles.communityEntryInfo}>
            <Text className={styles.communityEntryName}>{matchedCommunity.name}</Text>
            <Text className={styles.communityEntryDistrict}>{matchedCommunity.district}</Text>
          </View>
          <Text className={styles.communityEntryArrow}>查看时间线 ›</Text>
        </View>
      )}

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
              onClaim={handleClaim}
              showClaim={true}
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
