export const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

export const getFileName = (filename: string): string =>
    filename.split('.').slice(0, -1).join('.');

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export const isImageFile = (filename: string): boolean =>
    /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(filename);

export const isVideoFile = (filename: string): boolean =>
    /\.(mp4|webm|ogg|mov|avi|mkv|m4v|wmv|flv)$/i.test(filename);

export const isIframeSupported = (filename: string): boolean =>
    /\.(pdf|html?|txt)$/i.test(filename);

export const isValidFileType = (file: File, allowedTypes: string[]): boolean =>
    allowedTypes.some((type) =>
        type.startsWith('.') ? file.name.toLowerCase().endsWith(type.toLowerCase()) : file.type === type
    );

export const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
