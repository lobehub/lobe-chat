const electron = {
  remoteServer: {
    authError: '授权失败: {{error}}',
    authPending: '请在浏览器中完成授权',
    configDesc: '连接到远程LobeChat服务器，启用数据同步',
    configError: '配置出错',
    configTitle: '配置云同步',
    connect: '连接并授权',
    connected: '已连接',
    disconnect: '断开连接',
    disconnectError: '断开连接失败',
    disconnected: '未连接',
    fetchError: '获取配置失败',
    invalidUrl: '请输入有效的URL地址',
    serverUrl: '服务器地址',
    statusConnected: '已连接',
    statusDisconnected: '未连接',
    urlRequired: '请输入服务器地址',
  },
  updater: {
    downloadingUpdate: '正在下载更新',
    downloadingUpdateDesc: '更新正在下载中，请稍候...',
    later: '稍后更新',
    newVersionAvailable: '新版本可用',
    newVersionAvailableDesc: '发现新版本 {{version}}，是否立即下载？',
    restartAndInstall: '重启并安装',
    updateError: '更新错误',
    updateReady: '更新已就绪',
    updateReadyDesc: 'Lobe Chat {{version}} 已下载完成，重启应用后即可完成安装。',
    upgradeNow: '立即更新',
  },
};

export default electron;
