import type { ESize } from '@aryagg/types';

/** @deprecated Import ESize from @aryagg/types instead. */
export type AvatarSize = ESize;
export type AvatarStatus = 'online' | 'offline' | 'away';
export type AvatarProps = {
	src?: string;
	name?: string;
	size?: ESize;
	status?: AvatarStatus;
	class?: string;
	avatarKlass?: string;
	imgKlass?: string;
	dotKlass?: string;
};
