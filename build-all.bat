@echo off

cd F:\repo\Skeleton\skeleton-packages\packages\types
call npm run build

cd F:\repo\Skeleton\skeleton-packages\packages\i18n
call npm run build

cd F:\repo\Skeleton\skeleton-packages\packages\utils
call npm run build

cd F:\repo\Skeleton\skeleton-packages\packages\ui-kit
call npm run build

cd F:\repo\Skeleton\skeleton-packages\packages\layout-kit
call npm run build

cd F:\repo\Skeleton\skeleton-packages\packages\remote-plugins
call npm run build

echo All builds completed!
pause
