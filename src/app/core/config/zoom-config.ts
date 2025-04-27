export const ZOOM_CONFIG = {
    authEndpoint: 'YOUR_AUTH_ENDPOINT', // Endpoint để generate JWT token
    sdkKey: 'YOUR_SDK_KEY', // Zoom SDK Key
    sdkSecret: 'YOUR_SDK_SECRET', // Zoom SDK Secret
    leaveUrl: 'http://localhost:4200/meetings', // URL sau khi rời meeting
    // Các cấu hình mặc định cho meeting
    defaultConfig: {
        lang: 'vi-VN',
        showMeetingHeader: true,
        disableInvite: true,
        disableCallOut: true,
        disableRecord: true,
        disableJoinAudio: false,
        audioPanelAlwaysOpen: true,
        showPureSharingContent: false,
        videoHeader: true,
        isLockBottom: true,
        isSupportAV: true,
        isSupportChat: true,
        isSupportQA: true,
        isSupportCC: true,
        isSupportPolling: true,
        isSupportBreakout: true,
        screenShare: true,
        rwcBackup: '',
        videoDrag: true,
        sharingMode: 'fit',
        videoQuality: 1,
        rx: true,
        appKey: '',
        theme: 'default',
        meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
    }
};
