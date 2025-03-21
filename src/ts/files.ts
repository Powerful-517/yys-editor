import {defineStore} from 'pinia';
import {ElMessageBox} from "element-plus";
import {useGlobalMessage} from "./useGlobalMessage";

const { showMessage } = useGlobalMessage();

function getDefaultState() {
    return {
        fileList: [{
            "label": "File 1",
            "name": "1",
            "visible": true,
            "type":"PVE",
            "groups": [
                {
                    "shortDescription": "",
                    "groupInfo": [
                        {}, {}, {}, {}, {}
                    ],
                    "details": ""
                }
            ]
        }],
        activeFile: "1",
    };
}

function saveStateToLocalStorage(state) {
    localStorage.setItem('filesStore', JSON.stringify(state));
}

function clearFilesStoreLocalStorage() {
    localStorage.removeItem('filesStore')
}

function loadStateFromLocalStorage() {
    return JSON.parse(localStorage.getItem('filesStore'));
}

export const useFilesStore = defineStore('files', {
    state: () => getDefaultState(),
    getters: {
        visibleFiles: (state) => state.fileList.filter(file => file.visible),
    },
    actions: {
        initializeWithPrompt() {
            const savedState = loadStateFromLocalStorage();
            const defaultState = getDefaultState();

            const isSame = JSON.stringify(savedState) === JSON.stringify(defaultState);
            if (savedState && !isSame) {
                ElMessageBox.confirm(
                    '检测到有未保存的旧数据，是否恢复？',
                    '提示',
                    {
                        confirmButtonText: '恢复',
                        cancelButtonText: '不恢复',
                        type: 'warning',
                    }
                ).then(() => {
                    this.fileList = savedState.fileList || [];
                    this.activeFile = savedState.activeFile || "1";
                    showMessage('success', '数据已恢复');
                }).catch(() => {
                    clearFilesStoreLocalStorage();
                    showMessage('info', '选择了不恢复旧数据');
                });
            }
        },
        setupAutoSave() {
            setInterval(() => {
                saveStateToLocalStorage(this.$state);
            }, 30000); // 设置间隔时间为30秒
        },
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