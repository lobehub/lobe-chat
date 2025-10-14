---
group: Feedback
title: Alert
description: React Native Alert component based on Ant Design Alert, used to display important operational feedback information.
---

## Features

- ✅ Supports four status styles: `info`, `success`, `warning`, `error`
- ✅ Allows displaying description text, action buttons, and custom icons
- ✅ Closable alerts with close callback support
- ✅ Theme adaptation with automatic semantic color inheritance
- ✅ Complete TypeScript type definitions

## Basic Usage

```tsx
import { Alert } from '@lobehub/ui-rn';

<Alert message="Default Alert" />

import { Alert, Button, Icon } from '@lobehub/ui-rn';
import { Info } from 'lucide-react-native';

<Alert
  description="Supports description information, suitable for scenarios that require additional explanation."
  message="Information Alert"
/>
```

## Type Examples

```tsx
<Alert message="Info Alert" type="info" />
<Alert message="Success Alert" type="success" />
<Alert message="Warning Alert" type="warning" />
<Alert message="Error Alert" type="error" />
```

## Closable

```tsx
<Alert closable message="Operation Successful" type="success" />

<Alert
  closable
  description="The onClose callback is triggered when the alert is closed."
  message="Alert with Action Required"
  onClose={() => console.log('Alert closed')}
/>
```

## Custom Icon & Action

```tsx
<Alert
  action={
    <Button size="small" type="primary">
      View Details
    </Button>
  }
  description="Action buttons can be placed inside the alert to guide users to the next step."
  icon={<Icon icon={Info} size={20} />}
  message="Custom Content"
  type="info"
/>
```
