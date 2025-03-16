import { defineStore } from 'pinia';

export const useFilesStore = defineStore('files', {
    state: () => ({
        fileList: [{ label: 'File 1', name: 1 },{ label: 'File 2', name: 2 }],
        activeFile: 1,
    }),
    actions: {
        addFile(file: { label: string; name: number }) {
            this.fileList.push(file);
        },
        setActiveFile(fileId: number) {
            this.activeFile = fileId;
        },
    },
});