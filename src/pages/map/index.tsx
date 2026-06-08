import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockCommunities } from '@/data/communities'
import styles from './index.module.scss'

const MapPage: React.FC = () => {
  const handleCommunityClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/topic/index?id=${id}` })
  }

  const districts = [...new Set(mockCommunities.map(c => c.district.split('区')[0] + '区'))]

  return (
    <View className={styles.container}>
      <View className={styles.mapPlaceholder}>
        <Text className={styles.mapIcon}>🗺️</Text>
        <Text className={styles.mapText}>社区地图索引</Text>
        <Text className={styles.mapSubText}>按地理位置浏览社区快照</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 500rpx)' }}>
        <View className={styles.listSection}>
          <Text className={styles.listTitle}>社区列表</Text>
          {mockCommunities.map((community) => (
            <View
              key={community.id}
              className={styles.communityCard}
              onClick={() => handleCommunityClick(community.id)}
            >
              <Text className={styles.communityIcon}>📍</Text>
              <View className={styles.communityInfo}>
                <Text className={styles.communityNameText}>{community.name}</Text>
                <Text className={styles.communityDistrict}>{community.district}</Text>
              </View>
              <View className={styles.communityBadge}>
                <Text className={styles.communityBadgeText}>{community.snapshotCount}个快照</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default MapPage
