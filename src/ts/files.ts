import {defineStore} from 'pinia';
import {ElMessageBox} from "element-plus";
import {useGlobalMessage} from "./useGlobalMessage";

const { showMessage } = useGlobalMessage();
export const useFilesStore = defineStore('files', {
    state: () => ({
        fileList: [
            {
                "label": "Welcome",
                "name": "1",
                "type":"PVE",
                "visible": true,
                "groups": [
                    {
                        "shortDescription": "<h1>鬼灵歌姬</h1><h2><em>这是一个演示项目，用于测试显示6个式神的对齐效果</em></h2>",
                        "groupInfo": [
                            {
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
                            }
                        ],
                        "details": "<h2><strong>开局因幡普攻主怪后锁二</strong></h2>"
                    },
                    {
                        "shortDescription": "<h1>魂土15秒</h1><p><em>相同式神编辑不同属性</em></p>",
                        "groupInfo": [
                            {
                                "avatar": "/assets/Shikigami/ssr/364.png",
                                "name": "阿修罗",
                                "rarity": "SSR",
                                "properties": {
                                    "edit": true,
                                    "yuhun": {
                                        "yuhunSetEffect": [
                                            {
                                                "name": "狂骨",
                                                "shortName": "狂",
                                                "type": "attack",
                                                "avatar": "/assets/Yuhun/狂骨.png"
                                            },
                                            {
                                                "name": "荒骷髅",
                                                "shortName": "荒",
                                                "type": "PVE",
                                                "avatar": "/assets/Yuhun/荒骷髅.png"
                                            }
                                        ],
                                        "target": "1",
                                        "property2": [
                                            "Attack"
                                        ],
                                        "property4": [
                                            "Attack"
                                        ],
                                        "property6": [
                                            "Crit",
                                            "CritDamage"
                                        ]
                                    },
                                    "levelRequired": "40",
                                    "speed": "",
                                    "skillRequiredMode": "all",
                                    "skillRequired": [
                                        "5",
                                        "5",
                                        "5"
                                    ]
                                }
                            },
                            {
                                "avatar": "/assets/Shikigami/ssr/364.png",
                                "name": "阿修罗",
                                "rarity": "SSR",
                                "properties": {
                                    "edit": true,
                                    "yuhun": {
                                        "yuhunSetEffect": [
                                            {
                                                "name": "狂骨",
                                                "shortName": "狂",
                                                "type": "attack",
                                                "avatar": "/assets/Yuhun/狂骨.png"
                                            },
                                            {
                                                "name": "鬼灵歌伎",
                                                "shortName": "歌伎",
                                                "type": "PVE",
                                                "avatar": "/assets/Yuhun/鬼灵歌伎.png"
                                            }
                                        ],
                                        "target": "0",
                                        "property2": [
                                            "Attack"
                                        ],
                                        "property4": [
                                            "Attack"
                                        ],
                                        "property6": [
                                            "Crit",
                                            "CritDamage"
                                        ]
                                    },
                                    "levelRequired": "40",
                                    "speed": "",
                                    "skillRequiredMode": "all",
                                    "skillRequired": [
                                        "5",
                                        "5",
                                        "5"
                                    ]
                                }
                            },
                            {
                                "avatar": "/assets/Shikigami/ssr/370.png",
                                "name": "饭笥",
                                "rarity": "SSR"
                            },
                            {
                                "avatar": "/assets/Shikigami/ssr/369.png",
                                "name": "食灵",
                                "rarity": "SSR"
                            },
                            {
                                "avatar": "/assets/Shikigami/r/205.png",
                                "name": "座敷童子",
                                "rarity": "R"
                            }
                        ],
                        "details": ""
                    }
                ]
            },
            {
                "label": "Test",
                "name": "2",
                "visible": true,
                "type":"PVE",
                "groups": [
                    {
                        "shortDescription": "<h1>御魂·悲鸣</h1><p>这是一个演示项目，用于测试不同标签页的切换效果</p>",
                        "groupInfo": [
                            {},
                            {},
                            {},
                            {},
                            {}
                        ],
                        "details": ""
                    },
                    {
                        "shortDescription": "",
                        "groupInfo": [
                            {},
                            {},
                            {},
                            {},
                            {}
                        ],
                        "details": ""
                    }
                ]
            }
        ],
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
        async deleteFile(fileId: string) {
            try {
                if (this.fileList.length === 1) {
                    showMessage('warning', '无法删除');
                    return;
                }
                await ElMessageBox.confirm('确定要删除此文件吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                });

                const index = this.fileList.findIndex(file => file.name === fileId);
                if (index > -1) {
                    this.fileList.splice(index, 1);
                    if (this.activeFile === fileId) {
                        const nextVisibleFile = this.visibleFiles[0];
                        this.activeFile = nextVisibleFile ? nextVisibleFile.name : "-1";
                    }
                }
                showMessage('success', '删除成功!');
            } catch (error) {
                showMessage('info', '已取消删除');
            }
        },
        renameFile(fileId, newName) {
            const file = this.fileList.find(file => file.name === fileId);
            if (file) {
                file.label = newName;
            }
        },
    },
});