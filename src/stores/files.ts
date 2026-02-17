import { defineStore } from 'pinia';

export const useFilesStore = defineStore('files', {
    state: () => ({
        fileList: [{ label: 'File 1', name: 1, visible: false }, { label: 'File 2', name: 2, visible: false }],
        activeFile: -1,
    }),
    getters: {
        visibleFiles: (state) => state.fileList.filter(file => file.visible),
    },
    actions: {
        addFile(file: { label: string; name: number }) {
            this.fileList.push({ ...file, visible: false });
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
        closeTab(fileId: number) {
            const file = this.fileList.find(file => file.name === fileId);
            if (file) {
                file.visible = false;
                if (this.activeFile === fileId) {
                    const nextVisibleFile = this.visibleFiles[0];
                    this.activeFile = nextVisibleFile ? nextVisibleFile.name : -1;
                }
            }
        },
    },
});