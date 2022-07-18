import * as onboardbase from "@pulumi/onboardbase";

const onboardbaseSecrets = new onboardbase.Secrets("test:secrets", {
  apiKey: "92TWYPQAZUA94EYTY9T66A",
  passcode: "passcode",
  project: "app-secrets",
  environment: "development",
});

export const ADSFDSF_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["ADSFDSF"];
export const WHAT_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["WHAT"];
export const SECRET_FROM_ONBOARDBASE = onboardbaseSecrets.secrets["SECRET"];
