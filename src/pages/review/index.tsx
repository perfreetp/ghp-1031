import React, { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store/useAppStore'
import styles from './index.module.scss'

const ReviewPage: React.FC = () => {
  const { snapshots, approveSnapshot, rejectSnapshot } = useAppStore()
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const pendingSnapshots = snapshots.filter(s => s.status === 'pending')
  const reviewedSnapshots = snapshots.filter(s => s.status !== 'pending' && s.status !== 'approved').slice(0, 3)

  const handleApprove = (id: string) => {
    approveSnapshot(id)
    setReviewedIds(prev => new Set([...prev, id]))
    Taro.showToast({ title: '已通过审核', icon: 'success' })
    console.info('[Review] Approved:', id)
  }

  const handleReject = (id: string) => {
    rejectSnapshot(id)
    setReviewedIds(prev => new Set([...prev, id]))
    Taro.showToast({ title: '已驳回', icon: 'none' })
    console.info('[Review] Rejected:', id)
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>待审核快照</Text>
        <Text className={styles.headerDesc}>共 {pendingSnapshots.length} 条待审核</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 200rpx)' }}>
        {pendingSnapshots.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎉</Text>
            <Text className={styles.emptyText}>暂无待审核快照</Text>
          </View>
        ) : (
          pendingSnapshots.map((snapshot) => (
            <View key={snapshot.id} className={styles.reviewCard}>
              <Image className={styles.reviewImage} src={snapshot.imageUrl} mode="aspectFill" />
              <View className={styles.reviewContent}>
                <Text className={styles.reviewTitle}>{snapshot.title}</Text>
                <View className={styles.reviewMeta}>
                  <Text className={styles.reviewMetaItem}>贡献者：{snapshot.contributorName}</Text>
                  <Text className={styles.reviewMetaItem}>{snapshot.collectDate}</Text>
                </View>
                <Text className={styles.reviewDesc}>{snapshot.description}</Text>
                <View className={styles.reviewActions}>
                  <View className={styles.approveBtn} onClick={() => handleApprove(snapshot.id)}>
                    <Text style={{ color: '#fff', fontSize: '24rpx', fontWeight: 500 }}>通过</Text>
                  </View>
                  <View className={styles.rejectBtn} onClick={() => handleReject(snapshot.id)}>
                    <Text style={{ color: '#f5222d', fontSize: '24rpx', fontWeight: 500 }}>驳回</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default ReviewPage
