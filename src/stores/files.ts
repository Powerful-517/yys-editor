import {defineStore} from 'pinia';

export const useFilesStore = defineStore('files', {
    state: () => ({
        fileList: [
            {
                label: 'Welcome',
                name: "1",
                visible: true,
                groups: [
                    {
                        shortDescription: '<h1>鬼灵歌姬</h1><p>这是一个演示项目，用于测试显示效果</p>',
                        groupInfo: [{
                            "avatar": "/assets/Shikigami/sp/372.png",
                            "name": "因幡辉夜姬",
                            "rarity": "SP"
                        },
                            {
                                "avatar": "/assets/Shikigami/ssr/356.png",
                                "name": "千姬",
                                "rarity": "SSR"
                            },
                            {
                                "avatar": "/assets/Shikigami/sp/554.png",
                                "name": "纺愿缘结神",
                                "rarity": "SP"
                            },
                            {
                                "avatar": "/assets/Shikigami/ssr/556.png",
                                "name": "天照",
                                "rarity": "SSR"
                            },
                            {
                                "avatar": "/assets/Shikigami/ssr/557.png",
                                "name": "伊邪那美",
                                "rarity": "SSR"
                            },
                            {
                                "avatar": "/assets/Shikigami/sp/367.png",
                                "name": "绘世花鸟卷",
                                "rarity": "SP"
                            }],
                        details: ''
                    },
                    {
                        shortDescription: '',
                        groupInfo: [{}, {}, {}, {}, {}],
                        details: ''
                    }
                ]
            }, {
                label: 'File 2',
                name: "2",
                visible: true,
                groups:[
                    {
                        shortDescription: '',
                        groupInfo: [{}, {}, {}, {}, {}],
                        details: ''
                    },
                    {
                        shortDescription: '',
                        groupInfo: [{}, {}, {}, {}, {}],
                        details: ''
                    }
                ]
            }],
        activeFile: "1",
    }),
    getters: {
        visibleFiles: (state) => state.fileList.filter(file => file.visible),
    },
    actions: {
        addFile(file) {
            this.fileList.push({...file, visible: true});
            this.activeFile = file.name;
        },
        setActiveFile(fileId: number) {
            this.activeFile = fileId;
        },
        setVisible(fileId: number, visibility: boolean) {
            const file = this.fileList.find(file => file.name === fileId);
            if (file) {
                file.visible = visibility;
            }
        },
        closeTab(fileName: String) {
            const file = this.fileList.find(file => file.name === fileName);
            if (file) {
                file.visible = false;
                if (this.activeFile === fileName) {
                    const nextVisibleFile = this.visibleFiles[0];
                    this.activeFile = nextVisibleFile ? nextVisibleFile.name : -1;
                }
            }
        },
    },
});