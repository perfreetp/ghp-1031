import React, { useState, useCallback } from 'react'
import { View, Text, Map, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockCommunities } from '@/data/communities'
import { useAppStore } from '@/store/useAppStore'
import styles from './index.module.scss'

const MapPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { toggleSubscribe, isSubscribed, getSnapshotsByCommunity } = useAppStore()

  const selectedCommunity = mockCommunities.find(c => c.id === selectedId)

  const markers = mockCommunities.map((c) => ({
    id: parseInt(c.id.replace('c', '')),
    latitude: c.latitude,
    longitude: c.longitude,
    title: c.name,
    iconPath: '',
    width: 28,
    height: 28,
    callout: {
      content: `${c.name}\n${c.snapshotCount}个快照`,
      display: 'ALWAYS',
      color: '#2D2420',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#ffffff',
      padding: 8,
      textAlign: 'center'
    }
  }))

  const handleMarkerTap = useCallback((e) => {
    const markerId = e.markerId
    const community = mockCommunities.find(c => parseInt(c.id.replace('c', '')) === markerId)
    if (community) {
      setSelectedId(community.id)
    }
  }, [])

  const handleCommunityClick = (id: string) => {
    setSelectedId(id)
  }

  const handleViewSnapshots = (communityName: string) => {
    const snapshots = getSnapshotsByCommunity(communityName)
    if (snapshots.length > 0) {
      Taro.navigateTo({ url: `/pages/topic/index?communityName=${encodeURIComponent(communityName)}` })
    } else {
      Taro.showToast({ title: '该社区暂无快照', icon: 'none' })
    }
  }

  const handleSubscribe = (communityId: string, e?) => {
    if (e) e.stopPropagation()
    toggleSubscribe(communityId)
    const sub = !isSubscribed(communityId)
    Taro.showToast({ title: sub ? '已订阅' : '已取消订阅', icon: 'none' })
  }

  return (
    <View className={styles.container}>
      <Map
        className={styles.map}
        latitude={39.92}
        longitude={116.40}
        scale={11}
        markers={markers}
        onMarkerTap={handleMarkerTap}
        showLocation={false}
      />

      {selectedCommunity && (
        <View className={styles.selectedCard}>
          <View className={styles.selectedHeader}>
            <View className={styles.selectedInfo}>
              <Text className={styles.selectedName}>{selectedCommunity.name}</Text>
              <Text className={styles.selectedDistrict}>{selectedCommunity.district}</Text>
            </View>
            <View
              className={classnames(styles.subBtn, isSubscribed(selectedCommunity.id) && styles.subActive)}
              onClick={(e) => handleSubscribe(selectedCommunity.id, e)}
            >
              <Text className={classnames(styles.subBtnText, isSubscribed(selectedCommunity.id) && styles.subBtnTextActive)}>
                {isSubscribed(selectedCommunity.id) ? '已订阅' : '+ 订阅'}
              </Text>
            </View>
          </View>
          <View className={styles.selectedMeta}>
            <Text className={styles.selectedMetaText}>{selectedCommunity.snapshotCount}个快照</Text>
            <Text className={styles.selectedMetaText}>最新：{selectedCommunity.latestSnapshotDate}</Text>
          </View>
          <View className={styles.viewBtn} onClick={() => handleViewSnapshots(selectedCommunity.name)}>
            <Text className={styles.viewBtnText}>查看社区快照</Text>
          </View>
        </View>
      )}

      <ScrollView scrollY className={styles.listWrap} style={{ height: selectedId ? 'calc(100vh - 780rpx)' : 'calc(100vh - 500rpx)' }}>
        <View className={styles.listSection}>
          <Text className={styles.listTitle}>社区列表</Text>
          {mockCommunities.map((community) => (
            <View
              key={community.id}
              className={classnames(styles.communityCard, selectedId === community.id && styles.communityCardActive)}
              onClick={() => handleCommunityClick(community.id)}
            >
              <Text className={styles.communityIcon}>📍</Text>
              <View className={styles.communityInfo}>
                <Text className={styles.communityNameText}>{community.name}</Text>
                <Text className={styles.communityDistrict}>{community.district}</Text>
              </View>
              <View className={styles.communityRight}>
                <View className={styles.communityBadge}>
                  <Text className={styles.communityBadgeText}>{community.snapshotCount}个快照</Text>
                </View>
                <View
                  className={classnames(styles.miniSubBtn, isSubscribed(community.id) && styles.miniSubActive)}
                  onClick={(e) => handleSubscribe(community.id, e)}
                >
                  <Text className={classnames(styles.miniSubBtnText, isSubscribed(community.id) && styles.miniSubBtnTextActive)}>
                    {isSubscribed(community.id) ? '✓' : '+'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default MapPage
