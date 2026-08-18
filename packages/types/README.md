# @aryagg/types

Shared TypeScript types and constants for aryagg packages. Framework-agnostic — works with any TypeScript project.

[![npm](https://img.shields.io/npm/v/@aryagg/types)](https://www.npmjs.com/package/@aryagg/types)
[![GitHub](https://img.shields.io/badge/source-GitHub-181717)](https://github.com/iron-throne/skeleton-packages/tree/main/packages/types)

---

## Installation

```bash
npm install @aryagg/types
```

---

## API Types

### API & HTTP

```ts
import type { IApiResult, IApiResponse, IAPIQueuePayload } from '@aryagg/types';
import { EHttpMethod } from '@aryagg/types';

const result: IApiResult<User> = {
  status: true,
  message: 'OK',
  result: { id: 1, name: 'Alice' },
};

const response: IApiResponse<User[]> = {
  isSuccess: true,
  message: 'Fetched',
  data: [],
};

const payload: IAPIQueuePayload = {
  url: '/api/users',
  method: EHttpMethod.POST,
  data: { name: 'Alice' },
};
```

---

### UI Components

```ts
import type { IToast, ISnackData, ITab, TableColumn, IGenericObject } from '@aryagg/types';
import { ESnackType } from '@aryagg/types';

const toast: IToast = { id: 1, message: 'Saved!', type: ESnackType.SUCCESS };

const tab: ITab = {
  id: 'home',
  label: 'Home',
  badge: 3,
  disabled: false,
};

const column: TableColumn = {
  key: 'name',
  label: 'Full Name',
  sortable: true,
};
```

---

### Enums

```ts
import { ESnackType, ETheme, ELocale } from '@aryagg/types';

ESnackType.SUCCESS  // 'success'
ESnackType.DANGER   // 'danger'
ESnackType.WARNING  // 'warning'
ESnackType.INFO     // 'info'

ETheme.LIGHT        // 'light'
ETheme.DARK         // 'dark'

ELocale.EN          // 'en'
ELocale.ES          // 'es'
ELocale.AR          // 'ar'
```

---

### Auth

```ts
import type { IUser, IAuthState } from '@aryagg/types';
```

### Layout

```ts
import type { IMenuItem, ISidebarState } from '@aryagg/types';
```

### Storage

```ts
import type { IStorageItem } from '@aryagg/types';
```

### Settings

```ts
import type { IAppSettings } from '@aryagg/types';
```

### Input & Forms

```ts
import type { IInputOption } from '@aryagg/types';
import { EInputType, EDataType } from '@aryagg/types';
```

### Date Picker

```ts
import type { IDatePickerProps } from '@aryagg/types';
```

---

## Source

[github.com/iron-throne/skeleton-packages/tree/main/packages/types](https://github.com/iron-throne/skeleton-packages/tree/main/packages/types)
