import { Topic } from '@/types/index'

export const mockTopics: Topic[] = [
  {
    id: 't1',
    title: '难忘的抗疫岁月',
    description: '记录各社区在疫情期间的官方通告、志愿者招募和互助信息，留存那段特殊的社区记忆',
    coverUrl: 'https://picsum.photos/id/1/750/500',
    snapshotIds: ['s1', 's8', 's11'],
    createdAt: '2024-03-01',
    announcementCount: 8
  },
  {
    id: 't2',
    title: '邻里运动会精彩回顾',
    description: '各社区运动会、健身活动的精彩瞬间，展现社区活力与邻里温情',
    coverUrl: 'https://picsum.photos/id/292/750/500',
    snapshotIds: ['s3', 's6'],
    createdAt: '2024-06-15',
    announcementCount: 5
  },
  {
    id: 't3',
    title: '传统文化的社区传承',
    description: '书法展览、节日庆典、民俗活动——社区里的传统文化风采',
    coverUrl: 'https://picsum.photos/id/401/750/500',
    snapshotIds: ['s6', 's9', 's12'],
    createdAt: '2024-07-20',
    announcementCount: 12
  },
  {
    id: 't4',
    title: '那些年的社区公告',
    description: '停水通知、安全提醒、政策解读……社区公告栏里的烟火气息',
    coverUrl: 'https://picsum.photos/id/1015/750/500',
    snapshotIds: ['s2', 's5', 's8', 's10'],
    createdAt: '2024-08-10',
    announcementCount: 20
  },
  {
    id: 't5',
    title: '旧官网记忆长廊',
    description: '从简陋网页到智慧社区，那些承载着社区初心的旧版官网',
    coverUrl: 'https://picsum.photos/id/1082/750/500',
    snapshotIds: ['s1', 's4', 's7', 's11'],
    createdAt: '2024-09-05',
    announcementCount: 15
  },
  {
    id: 't6',
    title: '节日里的社区温暖',
    description: '春节联欢、端午粽香、重阳敬老……社区节日活动里的温馨故事',
    coverUrl: 'https://picsum.photos/id/580/750/500',
    snapshotIds: ['s2', 's9', 's12'],
    createdAt: '2024-12-01',
    announcementCount: 10
  }
]
