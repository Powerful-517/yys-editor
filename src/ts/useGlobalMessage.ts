import { ElMessage } from 'element-plus';

export function useGlobalMessage() {
    const showMessage = (type: 'success' | 'warning' | 'info' | 'error', message: string) => {
        ElMessage({
            type,
            message,
        });
    };

    return {
        showMessage,
    };
}