import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'

interface PosterCardProps {
  title: string;
  communityName: string;
  date: string;
  imageUrl: string;
  description: string;
}

const PosterCard: React.FC<PosterCardProps> = ({ title, communityName, date, imageUrl, description }) => {
  return (
    <View className={styles.poster}>
      <View className={styles.posterHeader}>
        <Text className={styles.posterBrand}>社区旧网址档案馆</Text>
        <Text className={styles.posterSub}>记忆不褪色</Text>
      </View>
      <Image className={styles.posterImage} src={imageUrl} mode="aspectFill" />
      <View className={styles.posterBody}>
        <Text className={styles.posterTitle}>{title}</Text>
        <Text className={styles.posterMeta}>{communityName} · {date}</Text>
        <Text className={styles.posterDesc}>{description}</Text>
      </View>
      <View className={styles.posterFooter}>
        <Text className={styles.posterFooterText}>扫码查看更多社区记忆</Text>
      </View>
    </View>
  )
}

export default PosterCard
