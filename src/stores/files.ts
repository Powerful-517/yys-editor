import {defineStore} from 'pinia';

export const useFilesStore = defineStore('files', {
    state: () => ({
        fileList: [
            {
                label: 'File 1',
                name: "1",
                visible: true,
                groups: [
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