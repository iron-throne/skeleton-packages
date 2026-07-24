import { ESize } from '@aryagg/types';

export const SIZE_CLASS: Record<ESize, string> = {
    [ESize.XS]: 'max-w-xs',
    [ESize.SM]: 'max-w-sm',
    [ESize.MD]: 'max-w-md',
    [ESize.LG]: 'max-w-lg',
    [ESize.XL]: 'max-w-xl',
    [ESize.XL2]: 'max-w-2xl',
    [ESize.XL3]: 'max-w-3xl',
    [ESize.XL4]: 'max-w-4xl',
    [ESize.XL5]: 'max-w-5xl',
    [ESize.XL6]: 'max-w-6xl',
    [ESize.XL7]: 'max-w-7xl',

    [ESize.FULL]: 'max-w-full',
    [ESize.FIT]: 'max-w-fit',
    [ESize.MIN]: 'max-w-min',
    [ESize.MAX]: 'max-w-max'
};
