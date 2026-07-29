export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away';
export type AvatarProps = {
	src?: string;
	name?: string;
	size?: AvatarSize;
	status?: AvatarStatus;
	class?: string;
};
