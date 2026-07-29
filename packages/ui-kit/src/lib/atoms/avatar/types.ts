import type { ESize } from "@aryagg/types";

export type AvatarStatus = 'online' | 'offline' | 'away';
export type AvatarProps = {
	src?: string;
	name?: string;
	size?: ESize;
	/** Optional presence indicator */
	status?: 'online' | 'offline' | 'away';
	klass?: string;
	avatarKlass?: string; imgKlass?: string; dotKlass?: string;
};
