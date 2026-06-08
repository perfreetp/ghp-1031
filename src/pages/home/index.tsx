import React, { useState } from 'react'
import { View, Text, Input, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store/useAppStore'
import { mockCommunities } from '@/data/communities'
import SnapshotCard from '@/components/SnapshotCard'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const { snapshots, likedIds, bookmarkedIds, toggleLike, toggleBookmark } = useAppStore()

  const featuredSnapshots = snapshots
    .filter(s => s.status === 'approved')
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3)

  const latestSnapshots = snapshots
    .filter(s => s.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(s => ({
      ...s,
      isLiked: likedIds.has(s.id),
      isBookmarked: bookmarkedIds.has(s.id)
    }))

  const handleSearchConfirm = () => {
    if (searchValue.trim()) {
      Taro.switchTab({ url: '/pages/browse/index' }).then(() => {
        useAppStore.getState().setSearchKeyword(searchValue.trim())
      })
    }
  }

  const handleCommunityClick = (communityId: string) => {
    Taro.navigateTo({ url: `/pages/topic/index?id=${communityId}` })
  }

  const handleShare = (id: string) => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>社区旧网址档案馆</Text>
        <Text className={styles.subGreeting}>记忆不褪色，社区在传承</Text>
      </View>

      <View className={styles.searchWrap}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索活动名称或社区名称..."
          placeholderClass={styles.searchPlaceholder}
          value={searchValue}
          onInput={(e) => setSearchValue(e.detail.value)}
          onConfirm={handleSearchConfirm}
          confirmType="search"
        />
      </View>

      <View className={styles.swiperWrap}>
        <Swiper
          className={styles.swiperWrap}
          autoplay
          circular
          indicatorDots
          indicatorColor="rgba(255,255,255,0.4)"
          indicatorActiveColor="#ffffff"
          interval={4000}
        >
          {featuredSnapshots.map((item) => (
            <SwiperItem key={item.id}>
              <Image className={styles.swiperImage} src={item.imageUrl} mode="aspectFill" />
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门社区</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.navigateTo({ url: '/pages/map/index' })}>
            查看全部 ›
          </Text>
        </View>
        <ScrollView scrollX className={styles.communityScroll} enhanced showScrollbar={false}>
          <View className={styles.communityList}>
            {mockCommunities.slice(0, 6).map((c) => (
              <View
                key={c.id}
                className={styles.communityItem}
                onClick={() => handleCommunityClick(c.id)}
              >
                <Image className={styles.communityAvatar} src={c.coverUrl} mode="aspectFill" />
                <Text className={styles.communityName}>{c.name}</Text>
                <Text className={styles.communityCount}>{c.snapshotCount}个快照</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.quickEntries}>
        <View className={styles.quickEntry} onClick={() => Taro.navigateTo({ url: '/pages/map/index' })}>
          <Text className={styles.quickIcon}>📍</Text>
          <Text className={styles.quickLabel}>地图索引</Text>
          <Text className={styles.quickDesc}>按位置查看</Text>
        </View>
        <View className={styles.quickEntry} onClick={() => Taro.navigateTo({ url: '/pages/topic/index' })}>
          <Text className={styles.quickIcon}>📖</Text>
          <Text className={styles.quickLabel}>社区专题</Text>
          <Text className={styles.quickDesc}>历史公告</Text>
        </View>
        <View className={styles.quickEntry} onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}>
          <Text className={styles.quickIcon}>✅</Text>
          <Text className={styles.quickLabel}>志愿审核</Text>
          <Text className={styles.quickDesc}>审核快照</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最新快照</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/browse/index' })}>
            更多 ›
          </Text>
        </View>
      </View>

      <View className={styles.latestList}>
        {latestSnapshots.map((snapshot) => (
          <SnapshotCard
            key={snapshot.id}
            snapshot={snapshot}
            onLike={toggleLike}
            onBookmark={toggleBookmark}
            onShare={handleShare}
          />
        ))}
      </View>
    </View>
  )
}

export default HomePage
