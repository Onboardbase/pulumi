
# Onboardbase Pulumi Component Provider

This is the official onboardbase pulumi component provider that makes onboardbase secrets available in the current running context

## Prerequisites

- Pulumi CLI
- Node.js
- Yarn

### Run Tests

---
```bash
# Build and install the provider
make test_nodejs
```
---
## Example Usage

yarn install @onboardbase/pulumi-onboardbase

---
```go
import * as onboardbase from "@onboardbase/pulumi-onboardbase";

const onboardbaseSecrets = new onboardbase.Secrets("test:secrets", {
  apiKey: "92TWYPQAZUA**EYTY9T66A",
  passcode: "passcode",
  project: "app-secrets",
  environment: "development",
});

export const ADSFDSF_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["ADSFDSF"];
export const WHAT_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["WHAT"];
export const SECRET_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["SECRET"];

```
---
