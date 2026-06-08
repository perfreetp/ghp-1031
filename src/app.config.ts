export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/browse/index',
    'pages/submit/index',
    'pages/mine/index',
    'pages/map/index',
    'pages/topic/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#C67C4E',
    navigationBarTitleText: '社区旧网址档案馆',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9E9189',
    selectedColor: '#C67C4E',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/browse/index',
        text: '浏览'
      },
      {
        pagePath: 'pages/submit/index',
        text: '提交'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
